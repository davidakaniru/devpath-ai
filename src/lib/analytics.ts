import { prisma } from "@/lib/prisma";

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
