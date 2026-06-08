import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { stageId, projectName, content, reflection } = body;

    if (!stageId) {
      return NextResponse.json({ error: "stageId là bắt buộc" }, { status: 400 });
    }

    const existing = await prisma.stagePractice.findFirst({
      where: { stageId }
    });

    let practice;
    if (existing) {
      practice = await prisma.stagePractice.update({
        where: { id: existing.id },
        data: {
          projectName: projectName !== undefined ? projectName : existing.projectName,
          content: content !== undefined ? content : existing.content,
          reflection: reflection !== undefined ? reflection : existing.reflection
        }
      });
    } else {
      practice = await prisma.stagePractice.create({
        data: {
          stageId,
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
