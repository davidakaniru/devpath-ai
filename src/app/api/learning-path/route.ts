import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const learningPath = await prisma.learningPath.findUnique({
      where: { userId: session.userId },
      include: {
        topics: {
          orderBy: { sequenceOrder: "asc" },
          include: { topic: { include: { resources: true } } },
        },
      },
    });

    if (!learningPath) {
      return NextResponse.json({ path: null });
    }

    const progressRecords = await prisma.userProgress.findMany({
      where: {
        userId: session.userId,
        topicId: { in: learningPath.topics.map((t) => t.topicId) },
      },
    });
    const progressByTopic = new Map(
      progressRecords.map((p) => [p.topicId, p]),
    );

    let previousCompleted = true;
    let foundCurrent = false;

    const topics = learningPath.topics.map(({ topic, sequenceOrder }) => {
      const progress = progressByTopic.get(topic.id);
      const completed = progress?.completed ?? false;
      const locked = !previousCompleted;
      const isCurrent = !locked && !completed && !foundCurrent;
      if (isCurrent) foundCurrent = true;
      previousCompleted = previousCompleted && completed;

      return {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        difficultyLevel: topic.difficultyLevel,
        sequenceOrder,
        resources: topic.resources.map((r) => ({
          id: r.id,
          title: r.title,
          type: r.type,
          url: r.url,
        })),
        completed,
        progressPercentage: progress?.progressPercentage ?? 0,
        locked,
        isCurrent,
      };
    });

    const completedCount = topics.filter((t) => t.completed).length;
    const overallProgress =
      topics.length === 0
        ? 0
        : Math.round((completedCount / topics.length) * 100);

    return NextResponse.json({
      path: {
        id: learningPath.id,
        title: learningPath.title,
        overallProgress,
        completedCount,
        totalCount: topics.length,
        topics,
      },
    });
  } catch (err) {
    console.error("[learningPath]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
