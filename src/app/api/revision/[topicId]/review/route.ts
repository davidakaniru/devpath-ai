import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateSM2, RATING_TO_QUALITY } from "@/lib/sm2";
import { NextRequest, NextResponse } from "next/server";

const VALID_RATINGS = Object.keys(RATING_TO_QUALITY);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { topicId } = await params;
    const { rating } = await req.json();

    if (typeof rating !== "string" || !VALID_RATINGS.includes(rating)) {
      return NextResponse.json(
        { error: "'rating' must be one of AGAIN, HARD, GOOD, EASY." },
        { status: 400 },
      );
    }

    const schedule = await prisma.revisionSchedule.findUnique({
      where: { userId_topicId: { userId: session.userId, topicId } },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "No revision schedule found for this topic." },
        { status: 404 },
      );
    }

    const quality = RATING_TO_QUALITY[rating as keyof typeof RATING_TO_QUALITY];
    const result = calculateSM2(schedule, quality);

    const updated = await prisma.revisionSchedule.update({
      where: { id: schedule.id },
      data: { ...result, lastReviewedAt: new Date() },
    });

    return NextResponse.json({ schedule: updated });
  } catch (err) {
    console.error("[revisionReview]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
