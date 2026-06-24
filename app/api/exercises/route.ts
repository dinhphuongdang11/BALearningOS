import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const lessonId = searchParams.get("lessonId");

    const filter: any = {};
    if (courseId) filter.courseId = courseId;
    if (lessonId) filter.lessonId = lessonId;

    const exercises = await prisma.exercise.findMany({
      where: filter,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(exercises);
  } catch (err: any) {
    console.error("GET Exercises error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch exercises" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, lessonId, title, description, instruction, type } = body;

    if (!title || !type) {
      return NextResponse.json({ error: "Title and type are required" }, { status: 400 });
    }

    const exercise = await prisma.exercise.create({
      data: {
        courseId: courseId || null,
        lessonId: lessonId || null,
        title,
        description: description || "",
        instruction: instruction || "",
        type, // "lesson_exercise" or "course_project"
      },
    });

    return NextResponse.json(exercise);
  } catch (err: any) {
    console.error("POST Exercise error:", err);
    return NextResponse.json({ error: err.message || "Failed to create exercise" }, { status: 500 });
  }
}
