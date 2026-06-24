import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { ensureDefaultCourseAndMigrate } from "../../../lib/migration";

export async function GET(req: Request) {
  try {
    await ensureDefaultCourseAndMigrate();
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    const filter = includeDrafts ? {} : { status: "PUBLISHED" };

    const courses = await prisma.course.findMany({
      where: filter,
      orderBy: { sortOrder: "asc" },
      include: {
        stages: {
          include: {
            lessons: true,
          },
        },
      },
    });

    return NextResponse.json(courses);
  } catch (err: any) {
    console.error("GET Courses error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDefaultCourseAndMigrate();
    const body = await req.json();
    const { title, description, thumbnail, level, category, status, sortOrder } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description: description || "",
        thumbnail: thumbnail || null,
        level: level || "All Levels",
        category: category || "General",
        status: status || "PUBLISHED",
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      },
    });

    return NextResponse.json(course);
  } catch (err: any) {
    console.error("POST Course error:", err);
    return NextResponse.json({ error: err.message || "Failed to create course" }, { status: 500 });
  }
}
