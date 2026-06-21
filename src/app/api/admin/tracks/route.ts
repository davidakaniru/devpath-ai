import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const tracks = await prisma.learningTrack.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { topics: true } } },
    });

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("[adminTracksGet]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const { name, description } = await req.json();

    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "'name' is required." },
        { status: 400 },
      );
    }

    const track = await prisma.learningTrack.create({
      data: { name: name.trim(), description: description ?? null },
    });

    return NextResponse.json({ track }, { status: 201 });
  } catch (err) {
    console.error("[adminTracksPost]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
