import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courses, modules, lessons, exercises } = body;

    if (!courses || !modules || !lessons) {
      return NextResponse.json({ error: "Dữ liệu xác nhận thiếu thông tin cần thiết." }, { status: 400 });
    }

    console.log(`Starting bulk import of ${courses.length} courses, ${modules.length} modules, ${lessons.length} lessons...`);

    // 1. Create or Find Courses
    const courseIdMap = new Map<string, string>(); // courseTitle -> courseId
    for (const c of courses) {
      let dbCourse = await prisma.course.findFirst({
        where: { title: c.title }
      });

      if (!dbCourse) {
        dbCourse = await prisma.course.create({
          data: {
            title: c.title,
            description: c.description || "",
            level: c.level || "All Levels",
            category: c.category || "General",
            status: "PUBLISHED",
            sortOrder: c.sortOrder || 1
          }
        });
      }
      courseIdMap.set(c.title, dbCourse.id);
    }

    // 2. Create or Find Modules (Stages)
    const moduleIdMap = new Map<string, string>(); // courseTitle|moduleTitle -> stageId
    for (const m of modules) {
      const courseId = courseIdMap.get(m.courseTitle);
      if (!courseId) continue;

      let dbStage = await prisma.stage.findFirst({
        where: { courseId, title: m.title }
      });

      if (!dbStage) {
        const computedCode = "STAGE-" + Math.floor(100000 + Math.random() * 900000);
        dbStage = await prisma.stage.create({
          data: {
            courseId,
            title: m.title,
            description: m.description || "",
            code: computedCode,
            order: m.order || 1,
            goal: m.description || "",
            bigExercise: "Dự án cuối khóa học: " + m.title,
            expectedOutput: "Tài liệu thiết kế giải pháp cho module: " + m.title,
            finalChecklist: "Hoàn thành tất cả bài tập trong chương",
            status: "PUBLISHED"
          }
        });
      }
      moduleIdMap.set(`${m.courseTitle}||${m.title}`, dbStage.id);
    }

    // 3. Create or Find Lessons
    const lessonIdMap = new Map<string, string>(); // courseTitle|moduleTitle|lessonTitle -> lessonId
    for (const l of lessons) {
      const stageId = moduleIdMap.get(`${l.courseTitle}||${l.moduleTitle}`);
      if (!stageId) continue;

      let dbLesson = await prisma.lesson.findFirst({
        where: { stageId, title: l.title }
      });

      if (!dbLesson) {
        const computedCode = "LESSON-" + Math.floor(100000 + Math.random() * 900000);
        dbLesson = await prisma.lesson.create({
          data: {
            stageId,
            title: l.title,
            code: computedCode,
            order: l.order || 1,
            objective: l.objective || "",
            theory: l.theory || "",
            example: "Ví dụ nghiệp vụ thực tế.",
            smallExercise: l.description || "",
            realProjectApplication: "Áp dụng kỹ năng để hoàn thiện dự án.",
            expectedOutput: "Bài giải và báo cáo kết quả tự học.",
            status: "PUBLISHED"
          }
        });
      }
      lessonIdMap.set(`${l.courseTitle}||${l.moduleTitle}||${l.title}`, dbLesson.id);
    }

    // 4. Create Exercises
    for (const ex of exercises) {
      const lessonId = lessonIdMap.get(`${ex.courseTitle}||${ex.moduleTitle}||${ex.lessonTitle}`);
      if (!lessonId) continue;

      // Delete existing exercises with same title for this lesson to prevent duplicates on re-import
      await prisma.exercise.deleteMany({
        where: { lessonId, title: ex.title }
      });

      await prisma.exercise.create({
        data: {
          lessonId,
          title: ex.title,
          description: ex.description || "",
          instruction: ex.instruction || "",
          type: "lesson_exercise"
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Nhập dữ liệu thành công! Đã tạo/cập nhật ${courses.length} khóa học, ${modules.length} chương học, và ${lessons.length} bài học.`
    });

  } catch (err: any) {
    console.error("Confirming excel transaction crashed", err);
    return NextResponse.json({ error: "Lỗi lưu dữ liệu: " + err.message }, { status: 500 });
  }
}
