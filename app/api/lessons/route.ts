import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stageId = searchParams.get("stageId");

    const lessons = await prisma.lesson.findMany({
      where: stageId ? { stageId } : {},
      orderBy: { order: "asc" }
    });

    return NextResponse.json(lessons);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      stageId,
      title,
      order,
      objective,
      theory,
      example,
      exercise,
      realProjectApplication,
      expectedOutput,
      checklistText
    } = body;

    if (!stageId || !title) {
      return NextResponse.json({ error: "stageId and title are required" }, { status: 400 });
    }

    const lesson = await prisma.lesson.create({
      data: {
        stageId,
        title,
        order: Number(order) || 1,
        objective: objective || "",
        theory: theory || "",
        example: example || "",
        exercise: exercise || "",
        realProjectApplication: realProjectApplication || "",
        expectedOutput: expectedOutput || "",
        status: "NOT_STARTED",
        personalNote: ""
      }
    });

    if (checklistText) {
      const items = checklistText
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);

      for (let i = 0; i < items.length; i++) {
        await prisma.checklistItem.create({
          data: {
            lessonId: lesson.id,
            content: items[i],
            isChecked: false,
            order: i + 1
          }
        });
      }
    }

    return NextResponse.json(lesson, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
