import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      recentReviewers,
      recentCompleters,
      recentChatters,
      scoreAgg,
      levelGroups,
      totalConversations,
      totalMessages,
      recentMessages,
      ratingGroups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.reviewLog.findMany({
        where: { reviewedAt: { gte: sevenDaysAgo } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.userProgress.findMany({
        where: { completed: true, completedAt: { gte: sevenDaysAgo } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.message.findMany({
        where: { role: "USER", createdAt: { gte: sevenDaysAgo } },
        select: { conversation: { select: { userId: true } } },
      }),
      prisma.onboardingResult.aggregate({
        _avg: { overallScore: true },
        _count: true,
      }),
      prisma.onboardingResult.groupBy({ by: ["overallLevel"], _count: true }),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.message.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.reviewLog.groupBy({ by: ["rating"], _count: true }),
    ]);

    // Merge the three "active" signals into a single set of unique user IDs
    const activeUserIds = new Set<string>([
      ...recentReviewers.map((r) => r.userId),
      ...recentCompleters.map((r) => r.userId),
      ...recentChatters.map((m) => m.conversation.userId),
    ]);

    const totalReviews = ratingGroups.reduce((sum, g) => sum + g._count, 0);
    const successfulReviews = ratingGroups
      .filter((g) => g.rating === "GOOD" || g.rating === "EASY")
      .reduce((sum, g) => sum + g._count, 0);
    const platformRetentionRate =
      totalReviews > 0
        ? Math.round((successfulReviews / totalReviews) * 100)
        : 0;

    return NextResponse.json({
      totalUsers,
      activeLearners: activeUserIds.size,
      assessmentPerformance: {
        averageScore: Math.round(scoreAgg._avg.overallScore ?? 0),
        completedAssessments: scoreAgg._count,
        levelDistribution: levelGroups.map((g) => ({
          level: g.overallLevel,
          count: g._count,
        })),
      },
      aiUsage: {
        totalConversations,
        totalMessages,
        messagesLast7Days: recentMessages,
      },
      knowledgeRetention: {
        platformRetentionRate,
        totalReviewsLogged: totalReviews,
      },
    });
  } catch (err) {
    console.error("[adminAnalytics]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
