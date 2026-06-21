import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const paths = await prisma.learningPath.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, email: true, careerGoal: true } },
        _count: { select: { topics: true } },
      },
    });

    return NextResponse.json({
      paths: paths.map((p) => ({
        id: p.id,
        userFullName: p.user.fullName,
        userEmail: p.user.email,
        careerGoal: p.user.careerGoal,
        title: p.title,
        topicCount: p._count.topics,
        generatedAt: p.createdAt,
      })),
    });
  } catch (err) {
    console.error("[adminMonitoringRecommendations]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
