import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const due = await prisma.revisionSchedule.findMany({
      where: { userId: session.userId, reviewDate: { lte: new Date() } },
      orderBy: { reviewDate: "asc" },
      include: {
        topic: { select: { id: true, title: true, difficultyLevel: true } },
      },
    });

    return NextResponse.json({ due });
  } catch (err) {
    console.error("[revisionDue]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
