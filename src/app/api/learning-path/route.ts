import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CAREER_GOAL_LABELS } from "@/lib/prompts/assessment";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
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

    let learningPath = await prisma.learningPath.findUnique({
      where: { userId: session.userId },
      include: {
        topics: {
          orderBy: { sequenceOrder: "asc" },
          include: { topic: { include: { resources: true } } },
        },
      },
    });

    if (!learningPath) {
      const trackLabel = CAREER_GOAL_LABELS[user.careerGoal];
      const track = await prisma.learningTrack.findFirst({
        where: { name: trackLabel },
        include: { topics: { orderBy: { createdAt: "asc" } } },
      });

      if (!track) {
        return NextResponse.json(
          { error: "No learning track found for your career goal." },
          { status: 404 },
        );
      }

      await prisma.$transaction([
        prisma.learningPath.create({
          data: {
            userId: session.userId,
            title: `${trackLabel} Path`,
            topics: {
              create: track.topics.map((topic, index) => ({
                topicId: topic.id,
                sequenceOrder: index,
              })),
            },
          },
        }),
        prisma.userProgress.createMany({
          data: track.topics.map((topic) => ({
            userId: session.userId,
            topicId: topic.id,
          })),
        }),
      ]);

      learningPath = await prisma.learningPath.findUnique({
        where: { userId: session.userId },
        include: {
          topics: {
            orderBy: { sequenceOrder: "asc" },
            include: { topic: { include: { resources: true } } },
          },
        },
      });
    }

    const progressRecords = await prisma.userProgress.findMany({
      where: {
        userId: session.userId,
        topicId: { in: learningPath!.topics.map((t) => t.topicId) },
      },
    });
    const progressByTopic = new Map(
      progressRecords.map((p) => [p.topicId, p]),
    );

    let previousCompleted = true;
    let foundCurrent = false;

    const topics = learningPath!.topics.map(({ topic, sequenceOrder }) => {
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
        id: learningPath!.id,
        title: learningPath!.title,
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
