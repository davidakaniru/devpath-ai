import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { topicId } = await params;
    const { completed } = await req.json();

    if (typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "'completed' must be a boolean." },
        { status: 400 },
      );
    }

    const progress = await prisma.userProgress.findFirst({
      where: { userId: session.userId, topicId },
    });

    if (!progress) {
      return NextResponse.json(
        { error: "This topic is not part of your learning path." },
        { status: 404 },
      );
    }

    await prisma.userProgress.update({
      where: { id: progress.id },
      data: {
        completed,
        progressPercentage: completed ? 100 : 0,
        completedAt: completed ? new Date() : null,
      },
    });

    const topicsCompleted = await prisma.userProgress.count({
      where: { userId: session.userId, completed: true },
    });

    await prisma.learningAnalytics.upsert({
      where: { userId: session.userId },
      update: { topicsCompleted },
      create: { userId: session.userId, topicsCompleted },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[learningPathTopic]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
