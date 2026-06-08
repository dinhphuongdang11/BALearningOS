import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentItem = await prisma.lessonChecklistItem.findUnique({
      where: { id }
    });

    if (!currentItem) {
      return NextResponse.json({ error: "Checklist item không tồn tại trong học liệu." }, { status: 404 });
    }

    const progress = await prisma.checklistProgress.findUnique({
      where: { checklistItemId: id }
    });

    const nextChecked = progress ? !progress.isChecked : true;

    const updatedProgress = await prisma.checklistProgress.upsert({
      where: { checklistItemId: id },
      update: { isChecked: nextChecked, updatedAt: new Date() },
      create: { checklistItemId: id, isChecked: nextChecked }
    });

    // Return merged item structure so that UI receives a standard format
    return NextResponse.json({
      ...currentItem,
      isChecked: updatedProgress.isChecked
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
