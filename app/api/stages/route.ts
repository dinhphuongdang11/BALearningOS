import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const stages = await prisma.stage.findMany({
      orderBy: { order: "asc" }
    });
    return NextResponse.json(stages);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, goal, order } = body;
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const stage = await prisma.stage.create({
      data: {
        title,
        description: description || "",
        goal: goal || "",
        order: Number(order) || 0
      }
    });
    return NextResponse.json(stage, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
