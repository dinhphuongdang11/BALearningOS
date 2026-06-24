import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { ensureDefaultCourseAndMigrate } from "../../../../lib/migration";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDefaultCourseAndMigrate();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (err: any) {
    console.error("GET Course Details error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch course" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDefaultCourseAndMigrate();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const { title, description, thumbnail, level, category, status, sortOrder } = body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (thumbnail !== undefined) data.thumbnail = thumbnail;
    if (level !== undefined) data.level = level;
    if (category !== undefined) data.category = category;
    if (status !== undefined) data.status = status;
    if (sortOrder !== undefined) data.sortOrder = typeof sortOrder === "number" ? sortOrder : parseInt(sortOrder) || 0;

    const updated = await prisma.course.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT Course error:", err);
    return NextResponse.json({ error: err.message || "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDefaultCourseAndMigrate();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (err: any) {
    console.error("DELETE Course error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete course" }, { status: 500 });
  }
}
