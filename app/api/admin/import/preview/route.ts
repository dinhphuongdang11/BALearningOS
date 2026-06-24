import { NextResponse } from "next/server";
import * as xlsx from "xlsx";

function getRowValue(row: any, keys: string[]): any {
  const normalizedKeys = keys.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ""));
  for (const rowKey of Object.keys(row)) {
    const normRowKey = rowKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalizedKeys.includes(normRowKey)) {
      return row[rowKey];
    }
  }
  return undefined;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file tải lên." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Read workbook
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    if (!sheet) {
      return NextResponse.json({ error: "File Excel rỗng hoặc không có dữ liệu." }, { status: 400 });
    }

    const rows = xlsx.utils.sheet_to_json<any>(sheet);
    if (rows.length === 0) {
      return NextResponse.json({ error: "File Excel không chứa bất kỳ hàng dữ liệu nào." }, { status: 400 });
    }

    const courses: any[] = [];
    const modules: any[] = [];
    const lessons: any[] = [];
    const exercises: any[] = [];
    const errors: string[] = [];

    // Helper maps to track groupings during flat-file scan
    const coursesMap = new Map<string, any>(); // title -> course
    const modulesMap = new Map<string, any>(); // courseTitle|moduleTitle -> module
    const lessonsMap = new Map<string, any>(); // courseTitle|moduleTitle|lessonTitle -> lesson

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      const rowNum = idx + 2;

      // Extract raw values
      const courseTitle = getRowValue(row, ["Course Title", "coursetitle", "khóa học", "tên khóa học"])?.toString()?.trim();
      const courseDesc = getRowValue(row, ["Course Description", "coursedescription", "mô tả khóa học"])?.toString()?.trim() || "";
      const courseLevel = getRowValue(row, ["Course Level", "courselevel", "cấp độ"])?.toString()?.trim() || "All Levels";
      const courseCat = getRowValue(row, ["Course Category", "coursecategory", "danh mục"])?.toString()?.trim() || "Business Analysis";

      const moduleTitle = getRowValue(row, ["Module Title", "moduletitle", "chương", "giai đoạn", "tên giai đoạn"])?.toString()?.trim();
      const moduleDesc = getRowValue(row, ["Module Description", "moduledescription", "mô tả giai đoạn", "mô tả chương"])?.toString()?.trim() || "";

      const lessonTitle = getRowValue(row, ["Lesson Title", "lessontitle", "bài học", "tên bài học"])?.toString()?.trim();
      const lessonDesc = getRowValue(row, ["Lesson Short Description", "lessonshortdescription", "mô tả bài học", "mô tả ngắn"])?.toString()?.trim() || "";
      const estTime = getRowValue(row, ["Estimated Time", "estimatedtime", "thời lượng", "thời gian học"])?.toString()?.trim() || "30";

      const exerciseTitle = getRowValue(row, ["Exercise Title", "exercisetitle", "bài tập", "tên bài tập"])?.toString()?.trim();
      const exerciseDesc = getRowValue(row, ["Exercise Description", "exercisedescription", "mô tả bài tập"])?.toString()?.trim() || "";
      const exerciseInst = getRowValue(row, ["Exercise Instruction", "exerciseinstruction", "hướng dẫn bài tập"])?.toString()?.trim() || "";

      // Validations
      if (!courseTitle) {
        errors.push(`[Hàng ${rowNum}] Tên khóa học (Course Title) là bắt buộc.`);
        continue;
      }
      if (!moduleTitle) {
        errors.push(`[Hàng ${rowNum}] Tên giai đoạn/chương (Module Title) là bắt buộc.`);
        continue;
      }
      if (!lessonTitle) {
        errors.push(`[Hàng ${rowNum}] Tên bài học (Lesson Title) là bắt buộc.`);
        continue;
      }

      // 1. Course Grouping
      let course = coursesMap.get(courseTitle);
      if (!course) {
        course = {
          title: courseTitle,
          description: courseDesc,
          level: courseLevel,
          category: courseCat,
          status: "PUBLISHED",
          sortOrder: coursesMap.size + 1
        };
        coursesMap.set(courseTitle, course);
        courses.push(course);
      }

      // 2. Module Grouping within Course
      const moduleKey = `${courseTitle}||${moduleTitle}`;
      let mod = modulesMap.get(moduleKey);
      if (!mod) {
        mod = {
          courseTitle,
          title: moduleTitle,
          description: moduleDesc,
          order: modulesMap.size + 1,
          status: "PUBLISHED"
        };
        modulesMap.set(moduleKey, mod);
        modules.push(mod);
      }

      // 3. Lesson Grouping within Module
      const lessonKey = `${courseTitle}||${moduleTitle}||${lessonTitle}`;
      let les = lessonsMap.get(lessonKey);
      if (!les) {
        les = {
          courseTitle,
          moduleTitle,
          title: lessonTitle,
          description: lessonDesc,
          order: lessonsMap.size + 1,
          objective: lessonDesc,
          theory: `Bài học lý thuyết về: ${lessonTitle}. Thời lượng học dự kiến: ${estTime} phút.`,
          status: "PUBLISHED"
        };
        lessonsMap.set(lessonKey, les);
        lessons.push(les);
      }

      // 4. Exercise details (if available)
      if (exerciseTitle) {
        exercises.push({
          courseTitle,
          moduleTitle,
          lessonTitle,
          title: exerciseTitle,
          description: exerciseDesc,
          instruction: exerciseInst,
          type: "lesson_exercise"
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      errors,
      counts: {
        coursesToCreate: courses.length,
        modulesToCreate: modules.length,
        lessonsToCreate: lessons.length,
        exercisesToCreate: exercises.length
      },
      previewData: {
        courses,
        modules,
        lessons,
        exercises
      }
    });

  } catch (err: any) {
    console.error("Critical preview excel error", err);
    return NextResponse.json({ error: "Lỗi phân tích file Excel: " + err.message }, { status: 500 });
  }
}
