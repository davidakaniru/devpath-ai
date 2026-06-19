import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validation/auth";
import * as yup from "yup";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. validate inputs
    let data;
    try {
      data = await registerSchema.validate(body, { abortEarly: false });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return NextResponse.json(
          { error: err.errors[0] ?? "Invalid input." },
          { status: 400 },
        );
      }
      throw err;
    }

    const { fullName, email, password } = data;

    // 2. check for existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // 3. hash password
    const passwordHash = await hashPassword(password);

    // 4. create user in DB
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash },
      select: { id: true, email: true, role: true, fullName: true },
    });

    // 5. create JWT + set cookie
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await setSessionCookie(token);

    // 6. return user (without passwordHash)
    return NextResponse.json(
      { user: { id: user.id, fullName: user.fullName, email: user.email } },
      { status: 201 },
    );
  } catch (err) {
    // handle unexpected errors
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
