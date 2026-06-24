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
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    const stage = await prisma.stage.findUnique({
      where: { id },
      include: {
        lessons: {
          where: includeDrafts ? {} : { status: "PUBLISHED" },
          orderBy: { order: "asc" }
        }
      }
    });

    if (!stage) {
      return NextResponse.json({ error: "Giai đoạn không tồn tại" }, { status: 404 });
    }

    return NextResponse.json(stage);
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

    const currentStage = await prisma.stage.findUnique({ where: { id } });
    if (!currentStage) {
      return NextResponse.json({ error: "Giai đoạn không tồn tại" }, { status: 404 });
    }

    const targetCourseId = courseId !== undefined ? courseId : currentStage.courseId;

    const data: any = {};
    if (code !== undefined) {
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode !== currentStage.code || courseId !== undefined) {
        if (targetCourseId) {
          const dup = await prisma.stage.findFirst({
            where: { courseId: targetCourseId, code: cleanCode, NOT: { id } }
          });
          if (dup) {
            return NextResponse.json({ error: "Mã giai đoạn (code) đã được sử dụng trong khóa học này." }, { status: 400 });
          }
        }
        data.code = cleanCode;
      }
    }

    if (order !== undefined) {
      const orderNum = Number(order);
      if (orderNum !== currentStage.order || courseId !== undefined) {
        if (targetCourseId) {
          const dupOrder = await prisma.stage.findFirst({
            where: { courseId: targetCourseId, order: orderNum, NOT: { id } }
          });
          if (dupOrder) {
            return NextResponse.json({ error: "Thứ tự hiển thị (order) đã được sử dụng trong khóa học này." }, { status: 400 });
          }
        }
        data.order = orderNum;
      }
    }

    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (goal !== undefined) data.goal = goal;
    if (bigExercise !== undefined) data.bigExercise = bigExercise;
    if (expectedOutput !== undefined) data.expectedOutput = expectedOutput;
    if (finalChecklist !== undefined) data.finalChecklist = finalChecklist;
    if (courseId !== undefined) data.courseId = courseId;
    if (status !== undefined) {
      data.status = status === "DRAFT" ? "DRAFT" : "PUBLISHED";
    }

    const updated = await prisma.stage.update({
      where: { id },
      data
    });

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
    await prisma.stage.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Giai đoạn đã được xóa thành công" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
