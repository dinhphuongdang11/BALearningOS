import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stageId = searchParams.get("stageId");
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    const whereClause: any = {};
    if (stageId) {
      whereClause.stageId = stageId;
    }
    if (!includeDrafts) {
      whereClause.status = "PUBLISHED";
    }

    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      orderBy: { order: "asc" }
    });

    // Obtain the list of matching student progress stages/lessons entries
    const progressList = await prisma.progress.findMany({
      where: {
        entityType: "LESSON",
        entityId: { in: lessons.map(l => l.id) }
      }
    });

    const progressMap = new Map<string, string>();
    progressList.forEach(p => {
      progressMap.set(p.entityId, p.status);
    });

    // Overwrite .status property dynamically to maintain backwards compatibility with client views
    const mappedLessons = lessons.map(l => ({
      ...l,
      // Backup true publishStatus in secondary field
      publishStatus: l.status,
      status: progressMap.get(l.id) || "NOT_STARTED"
    }));

    return NextResponse.json(mappedLessons);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      code,
      stageId,
      title,
      order,
      objective,
      theory,
      example,
      smallExercise,
      realProjectApplication,
      expectedOutput,
      status,
      checklistText
    } = body;

    if (!stageId || !title) {
      return NextResponse.json({ error: "stageId và title là bắt buộc" }, { status: 400 });
    }

    const computedCode = code
      ? code.trim().toUpperCase()
      : "LESSON-" + Math.floor(100000 + Math.random() * 900000);

    const dupCode = await prisma.lesson.findUnique({
      where: { code: computedCode }
    });
    if (dupCode) {
      return NextResponse.json({ error: "Mã bài học (code) đã tồn tại." }, { status: 400 });
    }

    // Checking composite unique constraint: stageId + title
    const dupTitleInStage = await prisma.lesson.findFirst({
      where: { stageId, title }
    });
    if (dupTitleInStage) {
      return NextResponse.json({ error: "Tiêu đề bài học này đã tồn tại trong giai đoạn này." }, { status: 400 });
    }

    const lesson = await prisma.lesson.create({
      data: {
        code: computedCode,
        stageId,
        title,
        order: Number(order) || 1,
        objective: objective || "",
        theory: theory || "",
        example: example || "",
        smallExercise: smallExercise || "",
        realProjectApplication: realProjectApplication || "",
        expectedOutput: expectedOutput || "",
        status: status === "DRAFT" ? "DRAFT" : "PUBLISHED"
      }
    });

    if (checklistText) {
      const items = checklistText
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);

      for (let i = 0; i < items.length; i++) {
        await prisma.lessonChecklistItem.create({
          data: {
            lessonId: lesson.id,
            content: items[i],
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
