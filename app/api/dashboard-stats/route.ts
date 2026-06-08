import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const totalStages = await prisma.stage.count();
    const totalLessons = await prisma.lesson.count();
    const completedLessons = await prisma.lesson.count({
      where: { status: "COMPLETED" }
    });
    const inProgressLessons = await prisma.lesson.count({
      where: { status: "IN_PROGRESS" }
    });

    const recentLessons = await prisma.lesson.findMany({
      orderBy: { updatedAt: "desc" },
      take: 3
    });

    const stages = await prisma.stage.findMany({
      orderBy: { order: "asc" }
    });

    const stageProgress = [];
    for (const stage of stages) {
      const sTotal = await prisma.lesson.count({ where: { stageId: stage.id } });
      const sCompleted = await prisma.lesson.count({
        where: { stageId: stage.id, status: "COMPLETED" }
      });
      const sInProgress = await prisma.lesson.count({
        where: { stageId: stage.id, status: "IN_PROGRESS" }
      });
      const percentage = sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0;

      stageProgress.push({
        stageId: stage.id,
        stageTitle: stage.title,
        totalLessons: sTotal,
        completedLessons: sCompleted,
        inProgressLessons: sInProgress,
        percentage
      });
    }

    return NextResponse.json({
      totalStages,
      totalLessons,
      completedLessons,
      inProgressLessons,
      recentLessons,
      stageProgress
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
