import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lesson = await prisma.lesson.findUnique({
      where: { id }
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const checklistItems = await prisma.checklistItem.findMany({
      where: { lessonId: id },
      orderBy: { order: "asc" }
    });

    const practice = await prisma.practice.findFirst({
      where: { lessonId: id }
    });

    return NextResponse.json({
      ...lesson,
      checklistItems,
      practice: practice || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      order,
      objective,
      theory,
      example,
      exercise,
      realProjectApplication,
      expectedOutput,
      checklistText,
      status,
      personalNote,
      stageId
    } = body;

    const data: any = {};
    if (stageId !== undefined) data.stageId = stageId;
    if (title !== undefined) data.title = title;
    if (order !== undefined) data.order = Number(order);
    if (objective !== undefined) data.objective = objective;
    if (theory !== undefined) data.theory = theory;
    if (example !== undefined) data.example = example;
    if (exercise !== undefined) data.exercise = exercise;
    if (realProjectApplication !== undefined) data.realProjectApplication = realProjectApplication;
    if (expectedOutput !== undefined) data.expectedOutput = expectedOutput;
    if (status !== undefined) data.status = status;
    if (personalNote !== undefined) data.personalNote = personalNote;

    const updated = await prisma.lesson.update({
      where: { id },
      data
    });

    if (checklistText !== undefined) {
      const lines = checklistText
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);

      // delete old checklist items that are NOT checked, or recreate all
      await prisma.checklistItem.deleteMany({
        where: { lessonId: id }
      });

      for (let i = 0; i < lines.length; i++) {
        await prisma.checklistItem.create({
          data: {
            lessonId: id,
            content: lines[i],
            isChecked: false,
            order: i + 1
          }
        });
      }
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.lesson.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
