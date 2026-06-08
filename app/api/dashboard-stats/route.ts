import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    // Standard filter for learner dashboard vs admin view
    const stageFilter = includeDrafts ? {} : { status: "PUBLISHED" as const };
    const lessonFilter = includeDrafts ? {} : { status: "PUBLISHED" as const };

    const totalStages = await prisma.stage.count({ where: stageFilter });
    const totalLessons = await prisma.lesson.count({ where: lessonFilter });

    // Count completed and in-progress based on the unified Progress model
    const completedLessons = await prisma.progress.count({
      where: {
        entityType: "LESSON",
        status: "COMPLETED",
        entityId: {
          in: (await prisma.lesson.findMany({ where: lessonFilter, select: { id: true } })).map(l => l.id)
        }
      }
    });

    const inProgressLessons = await prisma.progress.count({
      where: {
        entityType: "LESSON",
        status: "IN_PROGRESS",
        entityId: {
          in: (await prisma.lesson.findMany({ where: lessonFilter, select: { id: true } })).map(l => l.id)
        }
      }
    });

    const recentLessonsRaw = await prisma.lesson.findMany({
      where: lessonFilter,
      orderBy: { updatedAt: "desc" },
      take: 4
    });

    const recentLessonIds = recentLessonsRaw.map(l => l.id);
    const recentProgress = await prisma.progress.findMany({
      where: {
        entityType: "LESSON",
        entityId: { in: recentLessonIds }
      }
    });
    const recentProgressMap = new Map<string, string>();
    recentProgress.forEach(p => {
      recentProgressMap.set(p.entityId, p.status);
    });

    const recentLessons = recentLessonsRaw.map(l => ({
      ...l,
      status: recentProgressMap.get(l.id) || "NOT_STARTED"
    }));

    const stages = await prisma.stage.findMany({
      where: stageFilter,
      orderBy: { order: "asc" }
    });

    const stageProgress = [];
    for (const stage of stages) {
      const stageLessons = await prisma.lesson.findMany({
        where: { stageId: stage.id, ...lessonFilter },
        select: { id: true }
      });
      const lessonIds = stageLessons.map(l => l.id);

      const sTotal = lessonIds.length;
      let sCompleted = 0;
      let sInProgress = 0;

      if (sTotal > 0) {
        sCompleted = await prisma.progress.count({
          where: {
            entityType: "LESSON",
            entityId: { in: lessonIds },
            status: "COMPLETED"
          }
        });

        sInProgress = await prisma.progress.count({
          where: {
            entityType: "LESSON",
            entityId: { in: lessonIds },
            status: "IN_PROGRESS"
          }
        });
      }

      // Check if Stage itself is marked complete by looking at the STAGE progress row
      const stageProgressRow = await prisma.progress.findUnique({
        where: {
          entityType_entityId: {
            entityType: "STAGE",
            entityId: stage.id
          }
        }
      });

      const percentage = sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0;

      stageProgress.push({
        stageId: stage.id,
        stageTitle: stage.title,
        totalLessons: sTotal,
        completedLessons: sCompleted,
        inProgressLessons: sInProgress,
        percentage,
        stageStatus: stageProgressRow ? stageProgressRow.status : "NOT_STARTED"
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
