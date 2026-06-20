// src/app/api/learning-path/generate/route.ts

import { getSession } from "@/lib/auth";
import { matchTopic } from "@/lib/learning-path/match-topic";
import { prisma } from "@/lib/prisma";
import { CAREER_GOAL_LABELS } from "@/lib/prompts/assessment";
import { NextResponse } from "next/server";

export async function POST() {
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
        { error: "No career goal set." },
        { status: 400 },
      );
    }

    const trackLabel = CAREER_GOAL_LABELS[user.careerGoal];

    const track = await prisma.learningTrack.findFirst({
      where: { name: trackLabel },
    });

    if (!track) {
      return NextResponse.json(
        { error: `No learning track seeded for ${trackLabel} yet.` },
        { status: 404 },
      );
    }

    const assessment = await prisma.onboardingAssessment.findFirst({
      where: { userId: session.userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      include: { result: true },
    });

    if (!assessment?.result) {
      return NextResponse.json(
        { error: "Complete the onboarding assessment first." },
        { status: 400 },
      );
    }

    const recommendedPath = (
      assessment.result.recommendedPath as {
        title: string;
        priority: number;
        reason: string;
      }[]
    ).sort((a, b) => a.priority - b.priority);

    const learningPath = await prisma.$transaction(async (tx) => {
      let previousTopicId: string | null = null;
      const topicLinks: { topicId: string; sequenceOrder: number }[] = [];

      for (const item of recommendedPath) {
        const matched = await matchTopic(tx, track.id, item.title);

        let topicId: string;
        if (matched) {
          topicId = matched.id;
          // matched topics keep their curated prerequisite — don't touch it
        } else {
          const created = await tx.topic.create({
            data: {
              trackId: track.id,
              title: item.title,
              description: item.reason,
              difficultyLevel: "INTERMEDIATE",
              prerequisiteTopicId: previousTopicId,
            },
          });
          topicId = created.id;
        }

        topicLinks.push({ topicId, sequenceOrder: item.priority });
        previousTopicId = topicId;
      }

      return tx.learningPath.upsert({
        where: { userId: session.userId },
        update: {
          title: `${trackLabel} Learning Path`,
          topics: {
            deleteMany: {},
            create: topicLinks,
          },
        },
        create: {
          userId: session.userId,
          title: `${trackLabel} Learning Path`,
          topics: { create: topicLinks },
        },
        include: { topics: { include: { topic: true } } },
      });
    });

    return NextResponse.json({ learningPath });
  } catch (err) {
    console.error("[learningPathGenerate]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
