import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildContinuationPrompt,
  CAREER_GOAL_LABELS,
} from "@/lib/prompts/assessment";
import { questionSchema } from "@/lib/prompts/schemas";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { assessmentId, questionId, selectedOption, confidence } =
      await req.json();

    if (!["A", "B", "C", "D"].includes(selectedOption)) {
      return NextResponse.json({ error: "Invalid option." }, { status: 400 });
    }
    if (!["LOW", "MEDIUM", "HIGH"].includes(confidence)) {
      return NextResponse.json(
        { error: "Invalid confidence level." },
        { status: 400 },
      );
    }

    const question = await prisma.onboardingQuestion.findUnique({
      where: { id: questionId },
      include: { assessment: true },
    });

    if (
      !question ||
      question.assessment.userId !== session.userId ||
      question.assessmentId !== assessmentId
    ) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 },
      );
    }

    if (question.assessment.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Assessment has been completed." },
        { status: 409 },
      );
    }

    if (question.userAnswer) {
      return NextResponse.json(
        { error: "Question already answered." },
        { status: 409 },
      );
    }

    const isCorrect = selectedOption === question.correctOption;

    await prisma.onboardingQuestion.update({
      where: { id: questionId },
      data: {
        userAnswer: selectedOption,
        confidence,
        isCorrect,
        answeredAt: new Date(),
      },
    });

    if (question.questionNumber >= 15) {
      return NextResponse.json({ completed: true, assessmentId });
    }

    const allQuestions = await prisma.onboardingQuestion.findMany({
      where: { assessmentId },
      orderBy: { questionNumber: "asc" },
    });

    const history = allQuestions.map((q) => ({
      questionNumber: q.questionNumber,
      category: q.category,
      difficulty: q.difficulty,
      userAnswer: q.userAnswer!,
      confidence: q.confidence!,
      correct: q.isCorrect!,
    }));

    const trackLabel = CAREER_GOAL_LABELS[question.assessment.careerGoal];
    const nextNumber = question.questionNumber + 1;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildContinuationPrompt(trackLabel, history, nextNumber),
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
      },
    });

    const nextQuestionData = JSON.parse(response.text!);

    const nextQuestion = await prisma.onboardingQuestion.create({
      data: {
        assessmentId,
        questionNumber: nextQuestionData.questionNumber,
        category: nextQuestionData.category,
        difficulty: nextQuestionData.difficulty,
        questionText: nextQuestionData.question,
        optionA: nextQuestionData.options.A,
        optionB: nextQuestionData.options.B,
        optionC: nextQuestionData.options.C,
        optionD: nextQuestionData.options.D,
        correctOption: nextQuestionData.correctOption,
      },
    });

    return NextResponse.json({
      completed: false,
      question: {
        id: nextQuestion.id,
        questionNumber: nextQuestion.questionNumber,
        category: nextQuestion.category,
        difficulty: nextQuestion.difficulty,
        questionText: nextQuestion.questionText,
        options: {
          A: nextQuestion.optionA,
          B: nextQuestion.optionB,
          C: nextQuestion.optionC,
          D: nextQuestion.optionD,
        },
      },
    });
  } catch (err) {
    // handle unexpected errors
    console.error("[assessmentAnswer]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
