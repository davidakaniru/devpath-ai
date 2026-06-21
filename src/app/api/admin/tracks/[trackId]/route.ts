import { requireAdmin } from "@/lib/admin-guard";
import { Prisma, prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> },
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const { trackId } = await params;
    const { name, description } = await req.json();

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "'name' must be a non-empty string." },
        { status: 400 },
      );
    }

    const track = await prisma.learningTrack.update({
      where: { id: trackId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ track });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json({ error: "Track not found." }, { status: 404 });
    }
    console.error("[adminTrackPatch]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> },
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const { trackId } = await params;
    await prisma.learningTrack.delete({ where: { id: trackId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return NextResponse.json(
          { error: "Track not found." },
          { status: 404 },
        );
      }
      if (err.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "Cannot delete: this track still has topics. Delete its topics first.",
          },
          { status: 409 },
        );
      }
    }
    console.error("[adminTrackDelete]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
