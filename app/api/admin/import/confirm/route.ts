import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { stages, lessons, checklists } = body;

    if (!stages || !lessons) {
      return NextResponse.json({ error: "Dữ liệu xác nhận thiếu thông tin cần thiết." }, { status: 400 });
    }

    console.log(`Starting Database session to import ${stages.length} stages and ${lessons.length} lessons...`);

    // We execute inside sequential actions
    // 1. Upsert Stages
    for (const s of stages) {
      await prisma.stage.upsert({
        where: { code: s.code },
        update: {
          title: s.title,
          description: s.description,
          goal: s.goal,
          order: s.order,
          bigExercise: s.bigExercise,
          expectedOutput: s.expectedOutput,
          finalChecklist: s.finalChecklist,
          status: s.status,
          updatedAt: new Date()
        },
        create: {
          code: s.code,
          title: s.title,
          description: s.description,
          goal: s.goal,
          order: s.order,
          bigExercise: s.bigExercise,
          expectedOutput: s.expectedOutput,
          finalChecklist: s.finalChecklist,
          status: s.status
        }
      });
    }

    // Refresh Stage ID map
    const dbStages = await prisma.stage.findMany();
    const stageMap = new Map<string, string>();
    dbStages.forEach(s => {
      stageMap.set(s.code, s.id);
    });

    // 2. Upsert Lessons
    for (const l of lessons) {
      const stageId = stageMap.get(l.stage_code);
      if (!stageId) {
        console.warn(`Could not target stageId for stage_code ${l.stage_code}`);
        continue;
      }

      await prisma.lesson.upsert({
        where: { code: l.code },
        update: {
          stageId,
          title: l.title,
          order: l.order,
          objective: l.objective,
          theory: l.theory,
          example: l.example,
          smallExercise: l.smallExercise,
          realProjectApplication: l.realProjectApplication,
          expectedOutput: l.expectedOutput,
          status: l.status,
          updatedAt: new Date()
        },
        create: {
          code: l.code,
          stageId,
          title: l.title,
          order: l.order,
          objective: l.objective,
          theory: l.theory,
          example: l.example,
          smallExercise: l.smallExercise,
          realProjectApplication: l.realProjectApplication,
          expectedOutput: l.expectedOutput,
          status: l.status
        }
      });
    }

    // Refresh Lesson ID map
    const dbLessons = await prisma.lesson.findMany();
    const lessonMap = new Map<string, string>();
    dbLessons.forEach(l => {
      lessonMap.set(l.code, l.id);
    });

    // 3. Process Checklists (grouped by lesson map match)
    const checklistsByLesson = new Map<string, any[]>();
    for (const c of checklists) {
      const list = checklistsByLesson.get(c.lesson_code) || [];
      list.push(c);
      checklistsByLesson.set(c.lesson_code, list);
    }

    // Replace old checklists with imported ones
    for (const [lessonCode, items] of Array.from(checklistsByLesson.entries())) {
      const lessonId = lessonMap.get(lessonCode);
      if (!lessonId) {
        console.warn(`Skipping checklist items for untagged lessonCode ${lessonCode}`);
        continue;
      }

      // Delete existing checklist items for this lesson
      await prisma.lessonChecklistItem.deleteMany({
        where: { lessonId }
      });

      // Insert new ones
      for (const item of items) {
        await prisma.lessonChecklistItem.create({
          data: {
            lessonId,
            content: item.content,
            order: item.order
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã import hoàn tất (${stages.length} giai đoạn, ${lessons.length} bài học).`
    });

  } catch (err: any) {
    console.error("Confirming excel transaction crashed", err);
    return NextResponse.json({ error: "Lỗi lưu dữ liệu: " + err.message }, { status: 500 });
  }
}
