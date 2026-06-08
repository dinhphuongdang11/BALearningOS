import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { checklistItemId, isChecked } = body;

    if (!checklistItemId) {
      return NextResponse.json({ error: "checklistItemId là bắt buộc" }, { status: 400 });
    }

    const valIsChecked = isChecked === true;

    const progress = await prisma.checklistProgress.upsert({
      where: {
        checklistItemId
      },
      update: {
        isChecked: valIsChecked,
        updatedAt: new Date()
      },
      create: {
        checklistItemId,
        isChecked: valIsChecked
      }
    });

    return NextResponse.json(progress);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
