import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    // Standard filter for learner dashboard vs admin view
    const stageFilter = includeDrafts ? {} : { status: "PUBLISHED" as const };
    const lessonFilter = includeDrafts ? {} : { status: "PUBLISHED" as const };

    // Fetch data in parallel to reduce latency, resolving potential N+1 query structures
    const [stages, lessons, progressList] = await Promise.all([
      prisma.stage.findMany({
        where: stageFilter,
        orderBy: { order: "asc" }
      }),
      prisma.lesson.findMany({
        where: lessonFilter,
        orderBy: { updatedAt: "desc" }
      }),
      prisma.progress.findMany()
    ]);

    const totalStages = stages.length;
    const totalLessons = lessons.length;

    const activeLessonIds = new Set(lessons.map(l => l.id));

    // Calculate completed and in-progress status lists in-memory
    const completedLessons = progressList.filter(
      p => p.entityType === "LESSON" && p.status === "COMPLETED" && activeLessonIds.has(p.entityId)
    ).length;

    const inProgressLessons = progressList.filter(
      p => p.entityType === "LESSON" && p.status === "IN_PROGRESS" && activeLessonIds.has(p.entityId)
    ).length;

    // Calculate recent lessons list in-memory
    const recentLessonsRaw = lessons.slice(0, 4);
    const progressMap = new Map<string, string>();
    progressList.forEach(p => {
      if (p.entityType === "LESSON") {
        progressMap.set(p.entityId, p.status);
      }
    });

    const recentLessons = recentLessonsRaw.map(l => ({
      ...l,
      status: progressMap.get(l.id) || "NOT_STARTED"
    }));

    // Precalculate stage progress to eliminate DB query iterations inside loops
    const stageProgress = stages.map(stage => {
      const stageLessons = lessons.filter(l => l.stageId === stage.id);
      const sTotal = stageLessons.length;
      
      const lessonIds = new Set(stageLessons.map(l => l.id));
      const sCompleted = progressList.filter(
        p => p.entityType === "LESSON" && p.status === "COMPLETED" && lessonIds.has(p.entityId)
      ).length;

      const sInProgress = progressList.filter(
        p => p.entityType === "LESSON" && p.status === "IN_PROGRESS" && lessonIds.has(p.entityId)
      ).length;

      const stageProgressRow = progressList.find(
        p => p.entityType === "STAGE" && p.entityId === stage.id
      );

      const percentage = sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0;

      return {
        stageId: stage.id,
        stageTitle: stage.title,
        totalLessons: sTotal,
        completedLessons: sCompleted,
        inProgressLessons: sInProgress,
        percentage,
        stageStatus: stageProgressRow ? stageProgressRow.status : "NOT_STARTED"
      };
    });

    return NextResponse.json({
      totalStages,
      totalLessons,
      completedLessons,
      inProgressLessons,
      recentLessons,
      stageProgress
    });
  } catch (err: any) {
    console.error("Dashboard stats aggregation error:", err);
    return NextResponse.json({ error: err.message || "Database request failed." }, { status: 500 });
  }
}
