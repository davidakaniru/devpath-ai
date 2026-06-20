import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const assessment = await prisma.onboardingAssessment.findFirst({
      where: { userId: session.userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      include: { result: true },
    });

    if (!assessment || !assessment.result) {
      return NextResponse.json(
        { error: "No completed assessment found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ result: assessment.result });
  } catch (err) {
    console.error("[assessmentResult]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
