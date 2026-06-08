import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    const stages = await prisma.stage.findMany({
      where: includeDrafts ? {} : { status: "PUBLISHED" },
      orderBy: { order: "asc" }
    });
    return NextResponse.json(stages);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      code,
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

    // Check for existing stage with unique code or order to avoid prisma direct crashes
    const existingCode = await prisma.stage.findUnique({
      where: { code: computedCode }
    });
    if (existingCode) {
      return NextResponse.json({ error: "Mã giai đoạn (code) đã tồn tại trong hệ thống." }, { status: 400 });
    }

    const existingOrder = await prisma.stage.findUnique({
      where: { order: computedOrder }
    });
    if (existingOrder) {
      return NextResponse.json({ error: "Thứ tự hiển thị (order) này đã được sử dụng." }, { status: 400 });
    }

    const stage = await prisma.stage.create({
      data: {
        code: computedCode,
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
