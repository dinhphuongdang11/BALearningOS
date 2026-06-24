import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { ensureDefaultCourseAndMigrate } from "../../../lib/migration";

export async function GET(req: Request) {
  try {
    await ensureDefaultCourseAndMigrate();
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get("includeDrafts") === "true";
    const courseId = searchParams.get("courseId");

    const filter: any = includeDrafts ? {} : { status: "PUBLISHED" };
    if (courseId) {
      filter.courseId = courseId;
    }

    const stages = await prisma.stage.findMany({
      where: filter,
      orderBy: { order: "asc" }
    });
    return NextResponse.json(stages);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDefaultCourseAndMigrate();
    const body = await req.json();
    const {
      code,
      courseId,
      title,
      description,
      goal,
      order,
      bigExercise,
      expectedOutput,
      finalChecklist,
      status
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Tiêu đề giai đoạn là bắt buộc" }, { status: 400 });
    }

    const computedCode = code
      ? code.trim().toUpperCase()
      : "STAGE-" + Math.floor(100000 + Math.random() * 900000);

    const computedOrder = order !== undefined ? Number(order) : 1;

    // Default to the first course if courseId is not provided
    let targetCourseId = courseId;
    if (!targetCourseId) {
      const defaultCourse = await prisma.course.findFirst({
        orderBy: { sortOrder: "asc" }
      });
      targetCourseId = defaultCourse?.id || null;
    }

    // Check for existing stage with unique code or order within the same course
    if (targetCourseId) {
      const existingCode = await prisma.stage.findFirst({
        where: { courseId: targetCourseId, code: computedCode }
      });
      if (existingCode) {
        return NextResponse.json({ error: "Mã giai đoạn (code) đã tồn tại trong khóa học này." }, { status: 400 });
      }

      const existingOrder = await prisma.stage.findFirst({
        where: { courseId: targetCourseId, order: computedOrder }
      });
      if (existingOrder) {
        return NextResponse.json({ error: "Thứ tự hiển thị (order) này đã được sử dụng trong khóa học." }, { status: 400 });
      }
    }

    const stage = await prisma.stage.create({
      data: {
        code: computedCode,
        courseId: targetCourseId,
        title,
        description: description || "",
        goal: goal || "",
        order: computedOrder,
        bigExercise: bigExercise || "",
        expectedOutput: expectedOutput || "",
        finalChecklist: finalChecklist || "",
        status: status === "DRAFT" ? "DRAFT" : "PUBLISHED"
      }
    });

    return NextResponse.json(stage, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
