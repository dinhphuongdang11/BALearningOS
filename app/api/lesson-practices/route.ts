import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lessonId, projectName, content, reflection } = body;

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId là bắt buộc" }, { status: 400 });
    }

    // Upsert behavior on practice (per lesson, a user has at most one practice in this MVP setup)
    const existing = await prisma.lessonPractice.findFirst({
      where: { lessonId }
    });

    let practice;
    if (existing) {
      practice = await prisma.lessonPractice.update({
        where: { id: existing.id },
        data: {
          projectName: projectName !== undefined ? projectName : existing.projectName,
          content: content !== undefined ? content : existing.content,
          reflection: reflection !== undefined ? reflection : existing.reflection
        }
      });
    } else {
      practice = await prisma.lessonPractice.create({
        data: {
          lessonId,
          projectName: projectName || "",
          content: content || "",
          reflection: reflection || ""
        }
      });
    }

    return NextResponse.json(practice);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
