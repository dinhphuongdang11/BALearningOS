import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const current = await prisma.checklistItem.findUnique({
      where: { id }
    });

    if (!current) {
      return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
    }

    const updated = await prisma.checklistItem.update({
      where: { id },
      data: { isChecked: !current.isChecked }
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
