import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { entityType, entityId, status, courseId, userId } = body;

    if (!entityType || !entityId || !status) {
      return NextResponse.json({ error: "entityType, entityId và status là bắt buộc" }, { status: 400 });
    }

    if (entityType !== "STAGE" && entityType !== "LESSON" && entityType !== "COURSE") {
      return NextResponse.json({ error: "entityType chỉ nhận giá trị STAGE, LESSON hoặc COURSE" }, { status: 400 });
    }

    if (status !== "NOT_STARTED" && status !== "IN_PROGRESS" && status !== "COMPLETED") {
      return NextResponse.json({ error: "status không hợp lệ" }, { status: 400 });
    }

    const completedAtValue = status === "COMPLETED" ? new Date() : null;

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
        courseId: courseId || undefined,
        userId: userId || undefined,
        completedAt: completedAtValue,
        updatedAt: new Date()
      },
      create: {
        entityType,
        entityId,
        status,
        courseId: courseId || null,
        userId: userId || null,
        completedAt: completedAtValue
      }
    });

    return NextResponse.json(progress);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const filter: any = {};
    if (courseId) {
      filter.courseId = courseId;
    }

    const progressList = await prisma.progress.findMany({
      where: filter
    });

    return NextResponse.json(progressList);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
