import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { projectName, content, reflection } = body;

    const existing = await prisma.lessonPractice.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: "Bài thực hành không tồn tại" }, { status: 404 });
    }

    const updated = await prisma.lessonPractice.update({
      where: { id },
      data: {
        projectName: projectName !== undefined ? projectName : existing.projectName,
        content: content !== undefined ? content : existing.content,
        reflection: reflection !== undefined ? reflection : existing.reflection
      }
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
