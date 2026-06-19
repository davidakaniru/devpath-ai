import { verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/auth";
import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // validate inputs
    let data;
    try {
      data = await loginSchema.validate(body, { abortEarly: false });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return NextResponse.json(
          { error: err.errors[0] ?? "Invalid input." },
          { status: 400 },
        );
      }
      throw err;
    }

    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        passwordHash: true,
        careerGoal: true,
        experienceLevel: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const onboardingComplete = !!(user.careerGoal && user.experienceLevel);

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      onboardingComplete,
    });
  } catch (err) {
    // handle unexpected errors
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
