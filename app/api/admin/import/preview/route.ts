import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
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

    // Read the workbook
    const workbook = xlsx.read(buffer, { type: "buffer" });

    // Extract Sheets
    const stagesSheet = workbook.Sheets["Stages"] || workbook.Sheets[workbook.SheetNames[0]];
    const lessonsSheet = workbook.Sheets["Lessons"] || workbook.Sheets[workbook.SheetNames[1]];
    const checklistsSheet = workbook.Sheets["Lesson_Checklists"] || workbook.Sheets[workbook.SheetNames[2]];

    if (!stagesSheet) {
      return NextResponse.json({ error: "File Excel không chứa sheet 'Stages'." }, { status: 400 });
    }

    // Convert to JSON row-by-row
    const stagesRows = xlsx.utils.sheet_to_json<any>(stagesSheet);
    const lessonsRows = lessonsSheet ? xlsx.utils.sheet_to_json<any>(lessonsSheet) : [];
    const checklistsRows = checklistsSheet ? xlsx.utils.sheet_to_json<any>(checklistsSheet) : [];

    const parsedStages: any[] = [];
    const parsedLessons: any[] = [];
    const parsedChecklists: any[] = [];
    const errors: string[] = [];

    // Helper unique checkers
    const fileStageCodes = new Set<string>();
    const fileLessonCodes = new Set<string>();

    // 1. Parse Stages
    console.log("Parsing Stages...");
    for (let idx = 0; idx < stagesRows.length; idx++) {
      const row = stagesRows[idx];
      const rowNum = idx + 2; // offset header line in excel view

      const stage_code = getRowValue(row, ["stage_code", "stageCode", "code"])?.toString()?.trim();
      const title = getRowValue(row, ["title", "name", "tiêu đề", "tieu de"])?.toString()?.trim();
      const description = getRowValue(row, ["description", "desc", "mô tả", "mo ta"])?.toString() || "";
      const goal = getRowValue(row, ["goal", "mục tiêu", "muc tieu"])?.toString() || "";
      const orderRaw = getRowValue(row, ["order", "thứ tự", "thu tu"]);
      const bigExercise = getRowValue(row, ["big_exercise", "bigExercise", "bài tập lớn", "bai tap lon"])?.toString() || "";
      const expectedOutput = getRowValue(row, ["expected_output", "expectedOutput", "output cần đạt", "output can dat"])?.toString() || "";
      const finalChecklist = getRowValue(row, ["final_checklist", "finalChecklist", "checklist"])?.toString() || "";
      const statusRaw = getRowValue(row, ["status", "trạng thái", "trang thai"])?.toString()?.trim();

      if (!stage_code) {
        errors.push(`[Stages Row ${rowNum}] Mã giai đoạn (stage_code) là bắt buộc.`);
        continue;
      }

      if (!title) {
        errors.push(`[Stages Row ${rowNum}] Tiêu đề (title) của giai đoạn "${stage_code}" là bắt buộc.`);
        continue;
      }

      const order = Number(orderRaw);
      if (isNaN(order)) {
        errors.push(`[Stages Row ${rowNum}] Thứ tự hiển thị (order) phải là số.`);
        continue;
      }

      const status = statusRaw && statusRaw.toUpperCase() === "DRAFT" ? "DRAFT" : "PUBLISHED";

      const upperCode = stage_code.toUpperCase();
      if (fileStageCodes.has(upperCode)) {
        errors.push(`[Stages Row ${rowNum}] Trùng mã stage_code "${upperCode}" trong file excel.`);
        continue;
      }
      fileStageCodes.add(upperCode);

      parsedStages.push({
        code: upperCode,
        title,
        description,
        goal,
        order,
        bigExercise,
        expectedOutput,
        finalChecklist,
        status
      });
    }

    // Fetch existing stages from DB for mapping/existence check
    const dbStages = await prisma.stage.findMany();
    const dbStageMap = new Map<string, string>(); // code -> id
    dbStages.forEach(s => {
      dbStageMap.set(s.code, s.id);
    });

    // 2. Parse Lessons
    console.log("Parsing Lessons...");
    for (let idx = 0; idx < lessonsRows.length; idx++) {
      const row = lessonsRows[idx];
      const rowNum = idx + 2;

      const lesson_code = getRowValue(row, ["lesson_code", "lessonCode", "code"])?.toString()?.trim();
      const stage_code = getRowValue(row, ["stage_code", "stageCode"])?.toString()?.trim();
      const title = getRowValue(row, ["title", "name", "tiêu đề", "tieu de"])?.toString()?.trim();
      const orderRaw = getRowValue(row, ["order", "thứ tự", "thu tu"]);
      const objective = getRowValue(row, ["objective", "mục tiêu học", "muc tieu bai hoc"])?.toString() || "";
      const theory = getRowValue(row, ["theory", "lý thuyết", "ly thuyet"])?.toString() || "";
      const example = getRowValue(row, ["example", "ví dụ", "vi du"])?.toString() || "";
      const smallExercise = getRowValue(row, ["small_exercise", "smallExercise", "exercise", "bài tập nhỏ", "bai tap nho"])?.toString() || "";
      const realProjectApplication = getRowValue(row, ["real_project_application", "realProjectApplication", "áp dụng thực tế"])?.toString() || "";
      const expectedOutput = getRowValue(row, ["expected_output", "expectedOutput", "output cần tạo"])?.toString() || "";
      const statusRaw = getRowValue(row, ["status", "trạng thái", "trang thai"])?.toString()?.trim();

      if (!lesson_code) {
        errors.push(`[Lessons Row ${rowNum}] Mã bài học (lesson_code) là bắt buộc.`);
        continue;
      }

      if (!stage_code) {
        errors.push(`[Lessons Row ${rowNum}] Mã giai đoạn cha (stage_code) là bắt buộc.`);
        continue;
      }

      if (!title) {
        errors.push(`[Lessons Row ${rowNum}] Tiêu đề (title) của bài học "${lesson_code}" là bắt buộc.`);
        continue;
      }

      const order = Number(orderRaw);
      if (isNaN(order)) {
        errors.push(`[Lessons Row ${rowNum}] Thứ tự hiển thị bài học (order) phải là số.`);
        continue;
      }

      const stageUpper = stage_code.toUpperCase();
      // Ensure stage code exists either in file or in database
      if (!fileStageCodes.has(stageUpper) && !dbStageMap.has(stageUpper)) {
        errors.push(`[Lessons Row ${rowNum}] stage_code "${stageUpper}" không khớp với bất kỳ giai đoạn nào trong file hay cơ sở dữ liệu.`);
        continue;
      }

      const lessonUpper = lesson_code.toUpperCase();
      if (fileLessonCodes.has(lessonUpper)) {
        errors.push(`[Lessons Row ${rowNum}] Trùng mã lesson_code "${lessonUpper}" trong file excel.`);
        continue;
      }
      fileLessonCodes.add(lessonUpper);

      const status = statusRaw && statusRaw.toUpperCase() === "DRAFT" ? "DRAFT" : "PUBLISHED";

      parsedLessons.push({
        code: lessonUpper,
        stage_code: stageUpper,
        title,
        order,
        objective,
        theory,
        example,
        smallExercise,
        realProjectApplication,
        expectedOutput,
        status
      });
    }

    // 3. Parse Checklists
    console.log("Parsing Lesson Checklists...");
    for (let idx = 0; idx < checklistsRows.length; idx++) {
      const row = checklistsRows[idx];
      const rowNum = idx + 2;

      const lesson_code = getRowValue(row, ["lesson_code", "lessonCode"])?.toString()?.trim();
      const checklist_order_raw = getRowValue(row, ["checklist_order", "order"]);
      const content = getRowValue(row, ["checklist_content", "content", "nội dung"])?.toString()?.trim();

      if (!lesson_code) {
        errors.push(`[Checklist Row ${rowNum}] Thiếu lesson_code.`);
        continue;
      }

      if (!content) {
        errors.push(`[Checklist Row ${rowNum}] Thiếu nội dung checklist.`);
        continue;
      }

      const checklist_order = Number(checklist_order_raw) || (idx + 1);

      const lessonUpper = lesson_code.toUpperCase();
      parsedChecklists.push({
        lesson_code: lessonUpper,
        order: checklist_order,
        content
      });
    }

    // Calculate DB mutations for preview
    const dbLessons = await prisma.lesson.findMany();
    const dbLessonSet = new Set(dbLessons.map(l => l.code));

    let createdStagesCount = 0;
    let updatedStagesCount = 0;
    parsedStages.forEach(s => {
      if (dbStageMap.has(s.code)) {
        updatedStagesCount++;
      } else {
        createdStagesCount++;
      }
    });

    let createdLessonsCount = 0;
    let updatedLessonsCount = 0;
    parsedLessons.forEach(l => {
      if (dbLessonSet.has(l.code)) {
        updatedLessonsCount++;
      } else {
        createdLessonsCount++;
      }
    });

    return NextResponse.json({
      success: errors.length === 0,
      errors,
      counts: {
        stagesToCreate: createdStagesCount,
        stagesToUpdate: updatedStagesCount,
        lessonsToCreate: createdLessonsCount,
        lessonsToUpdate: updatedLessonsCount,
        checklistsCount: parsedChecklists.length
      },
      previewData: {
        stages: parsedStages,
        lessons: parsedLessons,
        checklists: parsedChecklists
      }
    });

  } catch (err: any) {
    console.error("Critical preview excel error", err);
    return NextResponse.json({ error: "Lỗi xử lý file Excel: " + err.message }, { status: 500 });
  }
}
