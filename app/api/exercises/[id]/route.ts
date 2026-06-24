import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const { title, description, instruction, type } = body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (instruction !== undefined) data.instruction = instruction;
    if (type !== undefined) data.type = type;

    const updated = await prisma.exercise.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT Exercise error:", err);
    return NextResponse.json({ error: err.message || "Failed to update exercise" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await prisma.exercise.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Exercise deleted successfully" });
  } catch (err: any) {
    console.error("DELETE Exercise error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete exercise" }, { status: 500 });
  }
}
