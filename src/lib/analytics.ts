import { prisma } from "@/lib/prisma";
import type { DifficultyLevel, ReviewRating } from "../../generated/prisma/client";

export async function recalculateAnalytics(userId: string) {
  const [topicsCompleted, reviewLogs, latestResult] = await Promise.all([
    prisma.userProgress.count({ where: { userId, completed: true } }),
    prisma.reviewLog.findMany({
      where: { userId },
      orderBy: { reviewedAt: "asc" },
      select: { reviewedAt: true, rating: true },
    }),
    prisma.onboardingAssessment.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      include: { result: true },
    }),
  ]);

  // Retention rate: % of all logged reviews rated GOOD or EASY
  const successfulReviews = reviewLogs.filter(
    (r) => r.rating === "GOOD" || r.rating === "EASY",
  ).length;
  const retentionRate =
    reviewLogs.length > 0
      ? Math.round((successfulReviews / reviewLogs.length) * 100)
      : 0;

  // Learning streak: consecutive days (ending today or yesterday) with at least one review
  const activeDays = [
    ...new Set(reviewLogs.map((r) => r.reviewedAt.toISOString().slice(0, 10))),
  ]
    .sort()
    .reverse(); // most recent first, as "YYYY-MM-DD" strings

  let learningStreak = 0;
  if (activeDays.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    if (activeDays[0] === today || activeDays[0] === yesterday) {
      learningStreak = 1;
      for (let i = 1; i < activeDays.length; i++) {
        const prevDay = new Date(activeDays[i - 1]);
        const expectedPrevDay = new Date(prevDay);
        expectedPrevDay.setDate(expectedPrevDay.getDate() - 1);

        if (activeDays[i] === expectedPrevDay.toISOString().slice(0, 10)) {
          learningStreak++;
        } else {
          break;
        }
      }
    }
  }

  const averageScore = latestResult?.result?.overallScore ?? 0;

  return prisma.learningAnalytics.upsert({
    where: { userId },
    update: { topicsCompleted, averageScore, learningStreak, retentionRate },
    create: {
      userId,
      topicsCompleted,
      averageScore,
      learningStreak,
      retentionRate,
    },
  });
}

const ACTIVITY_WINDOW_DAYS = 14;
const RATING_KEYS: ReviewRating[] = ["AGAIN", "HARD", "GOOD", "EASY"];

export interface AnalyticsData {
  analytics: {
    topicsCompleted: number;
    averageScore: number;
    learningStreak: number;
    retentionRate: number;
  } | null;
  categoryScores: Record<string, number> | null;
  ratingBreakdown: Record<ReviewRating, number>;
  totalReviews: number;
  activity: { date: string; count: number }[];
  difficultyBreakdown: {
    difficultyLevel: DifficultyLevel;
    completed: number;
    total: number;
  }[];
}

export async function getAnalyticsData(userId: string): Promise<AnalyticsData> {
  const since = new Date();
  since.setDate(since.getDate() - (ACTIVITY_WINDOW_DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const [analytics, latestAssessment, ratingCounts, recentLogs, learningPath] =
    await Promise.all([
      prisma.learningAnalytics.findUnique({ where: { userId } }),
      prisma.onboardingAssessment.findFirst({
        where: { userId, status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        include: { result: true },
      }),
      prisma.reviewLog.groupBy({
        by: ["rating"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.reviewLog.findMany({
        where: { userId, reviewedAt: { gte: since } },
        select: { reviewedAt: true },
      }),
      prisma.learningPath.findUnique({
        where: { userId },
        include: {
          topics: {
            include: {
              topic: {
                select: {
                  difficultyLevel: true,
                  progress: { where: { userId }, select: { completed: true } },
                },
              },
            },
          },
        },
      }),
    ]);

  const ratingBreakdown = RATING_KEYS.reduce(
    (acc, rating) => {
      acc[rating] =
        ratingCounts.find((r) => r.rating === rating)?._count._all ?? 0;
      return acc;
    },
    {} as Record<ReviewRating, number>,
  );
  const totalReviews = Object.values(ratingBreakdown).reduce(
    (sum, count) => sum + count,
    0,
  );

  const countsByDay = new Map<string, number>();
  for (const log of recentLogs) {
    const day = log.reviewedAt.toISOString().slice(0, 10);
    countsByDay.set(day, (countsByDay.get(day) ?? 0) + 1);
  }
  const activity = Array.from({ length: ACTIVITY_WINDOW_DAYS }, (_, i) => {
    const date = new Date(since);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    return { date: key, count: countsByDay.get(key) ?? 0 };
  });

  const difficultyTotals = new Map<
    DifficultyLevel,
    { completed: number; total: number }
  >();
  for (const { topic } of learningPath?.topics ?? []) {
    const bucket = difficultyTotals.get(topic.difficultyLevel) ?? {
      completed: 0,
      total: 0,
    };
    bucket.total += 1;
    if (topic.progress[0]?.completed) bucket.completed += 1;
    difficultyTotals.set(topic.difficultyLevel, bucket);
  }
  const difficultyBreakdown = Array.from(
    difficultyTotals,
    ([difficultyLevel, { completed, total }]) => ({
      difficultyLevel,
      completed,
      total,
    }),
  );

  return {
    analytics: analytics
      ? {
          topicsCompleted: analytics.topicsCompleted,
          averageScore: analytics.averageScore,
          learningStreak: analytics.learningStreak,
          retentionRate: analytics.retentionRate,
        }
      : null,
    categoryScores:
      (latestAssessment?.result?.categoryScores as Record<
        string,
        number
      > | null) ?? null,
    ratingBreakdown,
    totalReviews,
    activity,
    difficultyBreakdown,
  };
}
