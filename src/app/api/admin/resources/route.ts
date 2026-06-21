import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const VALID_TYPES = ["ARTICLE", "VIDEO", "DOCUMENTATION", "PROJECT"];

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const { topicId, title, type, url } = await req.json();

    if (typeof topicId !== "string" || topicId.length === 0) {
      return NextResponse.json(
        { error: "'topicId' is required." },
        { status: 400 },
      );
    }
    if (typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "'title' is required." },
        { status: 400 },
      );
    }
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `'type' must be one of ${VALID_TYPES.join(", ")}.` },
        { status: 400 },
      );
    }
    if (typeof url !== "string" || url.trim().length === 0) {
      return NextResponse.json(
        { error: "'url' is required." },
        { status: 400 },
      );
    }

    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) {
      return NextResponse.json({ error: "Topic not found." }, { status: 404 });
    }

    const resource = await prisma.learningResource.create({
      data: { topicId, title: title.trim(), type, url: url.trim() },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (err) {
    console.error("[adminResourcesPost]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
