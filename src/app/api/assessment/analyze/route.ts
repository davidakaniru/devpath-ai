import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildAnalysisPrompt,
  CAREER_GOAL_LABELS,
  mapToExperienceLevel,
} from "@/lib/prompts/assessment";
import { analysisSchema } from "@/lib/prompts/schemas";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { assessmentId } = await req.json();

    const assessment = await prisma.onboardingAssessment.findUnique({
      where: { id: assessmentId },
      include: { questions: { orderBy: { questionNumber: "asc" } } },
    });

    if (!assessment || assessment.userId !== session.userId) {
      return NextResponse.json(
        { error: "Assessment not found." },
        { status: 404 },
      );
    }

    if (assessment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment already analyzed." },
        { status: 409 },
      );
    }

    const unanswered = assessment.questions.some((q) => !q.userAnswer);
    if (assessment.questions.length < 15 || unanswered) {
      return NextResponse.json(
        { error: "Assessment is not yet complete." },
        { status: 400 },
      );
    }

    const history = assessment.questions.map((q) => ({
      questionNumber: q.questionNumber,
      category: q.category,
      difficulty: q.difficulty,
      userAnswer: q.userAnswer!,
      confidence: q.confidence!,
      correct: q.isCorrect!,
    }));

    const trackLabel = CAREER_GOAL_LABELS[assessment.careerGoal];

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: buildAnalysisPrompt(trackLabel, history),
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const analysis = JSON.parse(response.text!);

    const [result] = await prisma.$transaction([
      prisma.onboardingResult.create({
        data: {
          assessmentId: assessment.id,
          overallLevel: analysis.overallLevel,
          overallScore: analysis.overallScore,
          confidenceProfile: analysis.confidenceProfile,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          categoryScores: analysis.categoryScores,
          recommendedPath: analysis.recommendedPath,
          summary: analysis.summary,
        },
      }),
      prisma.onboardingAssessment.update({
        where: { id: assessment.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: session.userId },
        data: { experienceLevel: mapToExperienceLevel(analysis.overallLevel) },
      }),
    ]);

    return NextResponse.json({ result });
  } catch (err) {
    console.error("[assessmentAnalysis]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
