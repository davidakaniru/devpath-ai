// src/lib/dashboard.ts
import { prisma } from "@/lib/prisma";
import type {
  CareerGoal,
  DifficultyLevel,
  ExperienceLevel,
} from "../../generated/prisma/client";

export interface DashboardData {
  user: {
    fullName: string;
    careerGoal: CareerGoal | null;
    experienceLevel: ExperienceLevel | null;
  };
  learningPath: {
    id: string;
    title: string;
    topics: {
      id: string;
      title: string;
      difficultyLevel: DifficultyLevel;
      sequenceOrder: number;
      completed: boolean;
      progressPercentage: number;
    }[];
  } | null;
  progress: {
    completedCount: number;
    totalCount: number;
    percentComplete: number;
  };
  latestResult: {
    overallLevel: string;
    overallScore: number;
    confidenceProfile: string;
    strengths: string[];
    weaknesses: string[];
    summary: string;
  } | null;
  analytics: {
    topicsCompleted: number;
    averageScore: number;
    learningStreak: number;
    retentionRate: number;
  } | null;
  revisionQueueCount: number;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [user, learningPath, latestAssessment, analytics, dueRevisionsCount] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, careerGoal: true, experienceLevel: true },
      }),
      prisma.learningPath.findUnique({
        where: { userId },
        include: {
          topics: {
            orderBy: { sequenceOrder: "asc" },
            include: {
              topic: {
                include: {
                  progress: { where: { userId } },
                },
              },
            },
          },
        },
      }),
      prisma.onboardingAssessment.findFirst({
        where: { userId, status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        include: { result: true },
      }),
      prisma.learningAnalytics.findUnique({ where: { userId } }),
      prisma.revisionSchedule.count({
        where: { userId, reviewDate: { lte: new Date() } },
      }),
    ]);

  if (!user) {
    throw new Error("User not found.");
  }

  const topics =
    learningPath?.topics.map((lpt) => {
      const progress = lpt.topic.progress[0]; // filtered to this user already
      return {
        id: lpt.topic.id,
        title: lpt.topic.title,
        difficultyLevel: lpt.topic.difficultyLevel,
        sequenceOrder: lpt.sequenceOrder,
        completed: progress?.completed ?? false,
        progressPercentage: progress?.progressPercentage ?? 0,
      };
    }) ?? [];

  const completedCount = topics.filter((t) => t.completed).length;
  const totalCount = topics.length;
  const percentComplete =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    user: {
      fullName: user.fullName,
      careerGoal: user.careerGoal,
      experienceLevel: user.experienceLevel,
    },
    learningPath: learningPath
      ? { id: learningPath.id, title: learningPath.title, topics }
      : null,
    progress: { completedCount, totalCount, percentComplete },
    latestResult: latestAssessment?.result
      ? {
          overallLevel: latestAssessment.result.overallLevel,
          overallScore: latestAssessment.result.overallScore,
          confidenceProfile: latestAssessment.result.confidenceProfile,
          strengths: latestAssessment.result.strengths,
          weaknesses: latestAssessment.result.weaknesses,
          summary: latestAssessment.result.summary,
        }
      : null,
    analytics: analytics
      ? {
          topicsCompleted: analytics.topicsCompleted,
          averageScore: analytics.averageScore,
          learningStreak: analytics.learningStreak,
          retentionRate: analytics.retentionRate,
        }
      : null,
    revisionQueueCount: dueRevisionsCount,
  };
}
