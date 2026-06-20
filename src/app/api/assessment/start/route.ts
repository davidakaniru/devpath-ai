import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildInitializationPrompt,
  CAREER_GOAL_LABELS,
} from "@/lib/prompts/assessment";
import { questionSchema } from "@/lib/prompts/schemas";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { careerGoal: true },
    });

    if (!user?.careerGoal) {
      return NextResponse.json(
        { error: "Please select a career goal first." },
        { status: 400 },
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: buildInitializationPrompt(CAREER_GOAL_LABELS[user.careerGoal]),
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
      },
    });

    const questionData = JSON.parse(response.text!);

    const assessment = await prisma.onboardingAssessment.create({
      data: {
        userId: session.userId,
        careerGoal: user.careerGoal,
        status: "IN_PROGRESS",
        questions: {
          create: {
            questionNumber: questionData.questionNumber,
            category: questionData.category,
            difficulty: questionData.difficulty,
            questionText: questionData.question,
            optionA: questionData.options.A,
            optionB: questionData.options.B,
            optionC: questionData.options.C,
            optionD: questionData.options.D,
            correctOption: questionData.correctOption,
          },
        },
      },
      include: { questions: true },
    });

    const question = assessment.questions[0];

    return NextResponse.json({
      assessmentId: assessment.id,
      question: {
        id: question.id,
        questionNumber: question.questionNumber,
        category: question.category,
        difficulty: question.difficulty,
        questionText: question.questionText,
        options: {
          A: question.optionA,
          B: question.optionB,
          C: question.optionC,
          D: question.optionD,
        },
      },
    });
  } catch (err) {
    // handle unexpected errors
    console.error("[onboardingAssessment]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
