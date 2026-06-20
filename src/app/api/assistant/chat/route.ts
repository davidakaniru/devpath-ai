import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt } from "@/lib/prompts/assistant";
import { CAREER_GOAL_LABELS } from "@/lib/prompts/assessment";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const MAX_HISTORY_MESSAGES = 20; // last 20 messages (~10 exchanges)

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { userId: session.userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json({ messages: conversation?.messages ?? [] });
  } catch (err) {
    console.error("[assistantChatGet]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { message } = await req.json();

    if (typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message must be a non-empty string." },
        { status: 400 },
      );
    }

    const [user, learningPath] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { careerGoal: true },
      }),
      prisma.learningPath.findUnique({
        where: { userId: session.userId },
        include: {
          topics: {
            orderBy: { sequenceOrder: "asc" },
            include: { topic: { select: { title: true } } },
          },
        },
      }),
    ]);

    const trackLabel = user?.careerGoal
      ? CAREER_GOAL_LABELS[user.careerGoal]
      : "General Software Development";
    const topicTitles = learningPath?.topics.map((t) => t.topic.title) ?? [];

    const conversation = await prisma.conversation.upsert({
      where: { userId: session.userId },
      update: {},
      create: { userId: session.userId },
    });

    const recentHistory = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: MAX_HISTORY_MESSAGES,
    });
    recentHistory.reverse();

    const contents = [
      ...recentHistory.map((m) => ({
        role: m.role === "USER" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: buildSystemPrompt(trackLabel, topicTitles),
      },
    });

    const reply = response.text!;

    const [, assistantMessage] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "USER",
          content: message,
        },
      }),
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: reply,
        },
      }),
    ]);

    return NextResponse.json({ message: assistantMessage });
  } catch (err) {
    console.error("[assistantChatPost]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
