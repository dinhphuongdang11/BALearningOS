import { prisma } from "./prisma";

let isMigrationDone = false;

export async function ensureDefaultCourseAndMigrate() {
  if (isMigrationDone) return;
  try {
    // 1. Check if we have any stages with null courseId
    const unlinkedStages = await prisma.stage.findMany({
      where: { courseId: null },
    });

    if (unlinkedStages.length === 0) {
      isMigrationDone = true;
      return;
    }

    console.log(`Found ${unlinkedStages.length} stages without courseId. Migrating to default course...`);

    // 2. Find or create the default course
    let defaultCourse = await prisma.course.findFirst({
      where: { title: "Lộ trình Business Analyst" },
    });

    if (!defaultCourse) {
      defaultCourse = await prisma.course.create({
        data: {
          title: "Lộ trình Business Analyst",
          description: "Khóa học lộ trình Business Analyst toàn diện dành cho mọi cấp độ học viên, bao gồm các giai đoạn học tập, kỹ thuật và bài làm thực tế.",
          thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600",
          level: "All Levels",
          category: "Business Analysis",
          status: "PUBLISHED",
          sortOrder: 1,
        },
      });
      console.log(`Created default course with ID: ${defaultCourse.id}`);
    }

    // 3. Link all unlinked stages to this course
    const count = await prisma.stage.updateMany({
      where: { courseId: null },
      data: { courseId: defaultCourse.id },
    });

    console.log(`Successfully migrated ${count.count} stages to default course.`);
    isMigrationDone = true;
  } catch (err) {
    console.error("Auto-migration error in ensureDefaultCourseAndMigrate:", err);
  }
}
