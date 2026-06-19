import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const VALID_GOALS = [
  "FRONTEND_DEVELOPER",
  "BACKEND_DEVELOPER",
  "FULLSTACK_DEVELOPER",
  "MOBILE_DEVELOPER",
  "DATA_SCIENTIST",
  "DEVOPS_ENGINEER",
];

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { careerGoal } = await req.json();

    if (!VALID_GOALS.includes(careerGoal)) {
      return NextResponse.json(
        { error: "Invalid career goal." },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { careerGoal },
      select: { id: true, fullName: true, email: true, careerGoal: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[onboarding]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
