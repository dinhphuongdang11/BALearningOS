import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { entityType, entityId, status } = body;

    if (!entityType || !entityId || !status) {
      return NextResponse.json({ error: "entityType, entityId và status là bắt buộc" }, { status: 400 });
    }

    if (entityType !== "STAGE" && entityType !== "LESSON") {
      return NextResponse.json({ error: "entityType chỉ nhận giá trị STAGE hoặc LESSON" }, { status: 400 });
    }

    if (status !== "NOT_STARTED" && status !== "IN_PROGRESS" && status !== "COMPLETED") {
      return NextResponse.json({ error: "status không hợp lệ" }, { status: 400 });
    }

    // Upsert using prisma unique constraints
    const progress = await prisma.progress.upsert({
      where: {
        entityType_entityId: {
          entityType,
          entityId
        }
      },
      update: {
        status,
        updatedAt: new Date()
      },
      create: {
        entityType,
        entityId,
        status
      }
    });

    return NextResponse.json(progress);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
