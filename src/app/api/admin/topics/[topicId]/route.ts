import { requireAdmin } from "@/lib/admin-guard";
import { Prisma, prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const { topicId } = await params;
    const { title, description, difficultyLevel, prerequisiteTopicId } =
      await req.json();

    const existing = await prisma.topic.findUnique({
      where: { id: topicId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Topic not found." }, { status: 404 });
    }

    if (
      title !== undefined &&
      (typeof title !== "string" || title.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "'title' must be a non-empty string." },
        { status: 400 },
      );
    }
    if (
      difficultyLevel !== undefined &&
      !["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(difficultyLevel)
    ) {
      return NextResponse.json(
        { error: "'difficultyLevel' must be BEGINNER, INTERMEDIATE, or ADVANCED." },
        { status: 400 },
      );
    }

    if (prerequisiteTopicId !== undefined && prerequisiteTopicId !== null) {
      if (prerequisiteTopicId === topicId) {
        return NextResponse.json(
          { error: "A topic cannot be its own prerequisite." },
          { status: 400 },
        );
      }
      const prereq = await prisma.topic.findUnique({
        where: { id: prerequisiteTopicId },
      });
      if (!prereq || prereq.trackId !== existing.trackId) {
        return NextResponse.json(
          { error: "Prerequisite must belong to the same track." },
          { status: 400 },
        );
      }
    }

    const topic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(difficultyLevel !== undefined && { difficultyLevel }),
        ...(prerequisiteTopicId !== undefined && { prerequisiteTopicId }),
      },
    });

    return NextResponse.json({ topic });
  } catch (err) {
    console.error("[adminTopicPatch]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const { topicId } = await params;
    await prisma.topic.delete({ where: { id: topicId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return NextResponse.json(
          { error: "Topic not found." },
          { status: 404 },
        );
      }
      if (err.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "Cannot delete: this topic is referenced by learner progress, a learning path, or another topic's prerequisite.",
          },
          { status: 409 },
        );
      }
    }
    console.error("[adminTopicDelete]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
