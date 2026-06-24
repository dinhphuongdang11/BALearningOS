import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { ensureDefaultCourseAndMigrate } from "../../../../lib/migration";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDefaultCourseAndMigrate();
    const { id } = await params;
    const lesson = await prisma.lesson.findUnique({
      where: { id }
    });

    if (!lesson) {
      return NextResponse.json({ error: "Bài học không tồn tại" }, { status: 404 });
    }

    const dbChecklistItems = await prisma.lessonChecklistItem.findMany({
      where: { lessonId: id },
      orderBy: { order: "asc" }
    });

    // Fetch matching checklist progress states
    const itemIds = dbChecklistItems.map(item => item.id);
    const progressList = await prisma.checklistProgress.findMany({
      where: { checklistItemId: { in: itemIds } }
    });

    const progressMap = new Map<string, boolean>();
    progressList.forEach(p => {
      progressMap.set(p.checklistItemId, p.isChecked);
    });

    // Map into client-friendly structure with isChecked directly integrated
    const checklistItems = dbChecklistItems.map(item => ({
      ...item,
      isChecked: progressMap.get(item.id) || false
    }));

    const practice = await prisma.lessonPractice.findFirst({
      where: { lessonId: id }
    });

    const exercises = await prisma.exercise.findMany({
      where: { lessonId: id },
      orderBy: { createdAt: "asc" }
    });

    // Fetch general student progress state for this lesson
    const progressRow = await prisma.progress.findFirst({
      where: {
        entityType: "LESSON",
        entityId: id
      }
    });

    const progressStatus = progressRow ? progressRow.status : "NOT_STARTED";

    return NextResponse.json({
      ...lesson,
      // Map lesson status to progress status for backwards compatibility in studying UI
      status: progressStatus,
      publishStatus: lesson.status,
      // Map smallExercise to exercise for backward compatibility if any component reads 'exercise'
      exercise: lesson.smallExercise,
      checklistItems,
      practice: practice || null,
      exercises,
      progressStatus
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
    await ensureDefaultCourseAndMigrate();
    const { id } = await params;
    const body = await req.json();
    const {
      code,
      title,
      order,
      objective,
      theory,
      example,
      smallExercise,
      exercise, // Support either name
      realProjectApplication,
      expectedOutput,
      htmlContent,
      checklistText,
      status,
      stageId
    } = body;

    const currentLesson = await prisma.lesson.findUnique({ where: { id } });
    if (!currentLesson) {
      return NextResponse.json({ error: "Bài học không tồn tại" }, { status: 404 });
    }

    const data: any = {};
    if (code !== undefined) {
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode !== currentLesson.code) {
        const dup = await prisma.lesson.findFirst({
          where: { stageId: stageId || currentLesson.stageId, code: cleanCode, NOT: { id } }
        });
        if (dup) {
          return NextResponse.json({ error: "Mã bài học (code) đã tồn tại trong giai đoạn này." }, { status: 400 });
        }
        data.code = cleanCode;
      }
    }

    if (stageId !== undefined) data.stageId = stageId;
    if (title !== undefined) data.title = title;
    if (order !== undefined) data.order = Number(order);
    if (objective !== undefined) data.objective = objective;
    if (theory !== undefined) data.theory = theory;
    if (example !== undefined) data.example = example;
    if (htmlContent !== undefined) data.htmlContent = htmlContent;
    
    // Support either smallExercise or exercise
    const compExercise = smallExercise !== undefined ? smallExercise : exercise;
    if (compExercise !== undefined) data.smallExercise = compExercise;

    if (realProjectApplication !== undefined) data.realProjectApplication = realProjectApplication;
    if (expectedOutput !== undefined) data.expectedOutput = expectedOutput;
    if (status !== undefined) {
      data.status = status === "DRAFT" ? "DRAFT" : "PUBLISHED";
    }

    if (title !== undefined || stageId !== undefined) {
      // Check for name duplicate inside target stage
      const targetStageId = stageId || currentLesson.stageId;
      const targetTitle = title || currentLesson.title;
      if (targetStageId !== currentLesson.stageId || targetTitle !== currentLesson.title) {
        const dupTitle = await prisma.lesson.findFirst({
          where: {
            stageId: targetStageId,
            title: targetTitle,
            NOT: { id }
          }
        });
        if (dupTitle) {
          return NextResponse.json({ error: "Bài học với tiêu đề này đã tồn tại trong giai đoạn này." }, { status: 400 });
        }
      }
    }

    const updated = await prisma.lesson.update({
      where: { id },
      data
    });

    if (checklistText !== undefined) {
      const lines = checklistText
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);

      // Simple delete-and-rebuild for checklist items
      await prisma.lessonChecklistItem.deleteMany({
        where: { lessonId: id }
      });

      for (let i = 0; i < lines.length; i++) {
        await prisma.lessonChecklistItem.create({
          data: {
            lessonId: id,
            content: lines[i],
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
    await ensureDefaultCourseAndMigrate();
    const { id } = await params;
    await prisma.lesson.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Xóa bài học thành công" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
