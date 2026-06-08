import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const list = await prisma.lessonChecklistItem.findMany({
      where: { lessonId: id },
      orderBy: { order: "asc" }
    });
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Checklist item content is required" }, { status: 400 });
    }

    const count = await prisma.lessonChecklistItem.count({
      where: { lessonId: id }
    });

    const item = await prisma.lessonChecklistItem.create({
      data: {
        lessonId: id,
        content,
        order: count + 1
      }
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
