import { requireAdmin } from "@/lib/admin-guard";
import { Prisma, prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const VALID_TYPES = ["ARTICLE", "VIDEO", "DOCUMENTATION", "PROJECT"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> },
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const { resourceId } = await params;
    const { title, type, url } = await req.json();

    if (
      title !== undefined &&
      (typeof title !== "string" || title.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "'title' must be a non-empty string." },
        { status: 400 },
      );
    }
    if (type !== undefined && !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `'type' must be one of ${VALID_TYPES.join(", ")}.` },
        { status: 400 },
      );
    }
    if (
      url !== undefined &&
      (typeof url !== "string" || url.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "'url' must be a non-empty string." },
        { status: 400 },
      );
    }

    const resource = await prisma.learningResource.update({
      where: { id: resourceId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(type !== undefined && { type }),
        ...(url !== undefined && { url: url.trim() }),
      },
    });

    return NextResponse.json({ resource });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 },
      );
    }
    console.error("[adminResourcePatch]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> },
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const { resourceId } = await params;
    await prisma.learningResource.delete({ where: { id: resourceId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 },
      );
    }
    console.error("[adminResourceDelete]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
