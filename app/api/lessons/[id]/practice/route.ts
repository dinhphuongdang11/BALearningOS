import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const practice = await prisma.practice.findFirst({
      where: { lessonId: id }
    });
    return NextResponse.json(practice || null);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { projectName, content, reflection } = body;

    const existingPractice = await prisma.practice.findFirst({
      where: { lessonId: id }
    });

    const data = {
      projectName: projectName || "",
      content: content || "",
      reflection: reflection || ""
    };

    let result;
    if (!existingPractice) {
      result = await prisma.practice.create({
        data: {
          lessonId: id,
          ...data
        }
      });
    } else {
      result = await prisma.practice.update({
        where: { id: existingPractice.id },
        data
      });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
