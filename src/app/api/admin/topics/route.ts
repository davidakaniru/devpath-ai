import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const trackId = req.nextUrl.searchParams.get("trackId");
    if (!trackId) {
      return NextResponse.json(
        { error: "'trackId' query param is required." },
        { status: 400 },
      );
    }

    const topics = await prisma.topic.findMany({
      where: { trackId },
      orderBy: { createdAt: "asc" },
      include: {
        prerequisiteTopic: { select: { id: true, title: true } },
        resources: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({ topics });
  } catch (err) {
    console.error("[adminTopicsGet]", err);
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
    const { trackId, title, description, difficultyLevel, prerequisiteTopicId } =
      await req.json();

    if (typeof trackId !== "string" || trackId.length === 0) {
      return NextResponse.json(
        { error: "'trackId' is required." },
        { status: 400 },
      );
    }
    if (typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "'title' is required." },
        { status: 400 },
      );
    }
    if (!["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(difficultyLevel)) {
      return NextResponse.json(
        { error: "'difficultyLevel' must be BEGINNER, INTERMEDIATE, or ADVANCED." },
        { status: 400 },
      );
    }

    if (prerequisiteTopicId) {
      const prereq = await prisma.topic.findUnique({
        where: { id: prerequisiteTopicId },
      });
      if (!prereq || prereq.trackId !== trackId) {
        return NextResponse.json(
          { error: "Prerequisite must belong to the same track." },
          { status: 400 },
        );
      }
    }

    const topic = await prisma.topic.create({
      data: {
        trackId,
        title: title.trim(),
        description: description ?? null,
        difficultyLevel,
        prerequisiteTopicId: prerequisiteTopicId ?? null,
      },
    });

    return NextResponse.json({ topic }, { status: 201 });
  } catch (err) {
    console.error("[adminTopicsPost]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
