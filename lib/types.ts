/**
 * BA Learning OS
 * Domain Types Definition
 */

export enum PublishStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED"
}

export enum ProgressStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

export enum LessonStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  level: string;
  category: string;
  status: string; // "DRAFT" | "PUBLISHED" | "ARCHIVED"
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stage {
  id: string;
  code: string;
  courseId?: string | null;
  title: string;
  description: string;
  goal: string;
  order: number;
  bigExercise: string;
  expectedOutput: string;
  finalChecklist: string;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  code: string;
  stageId: string;
  title: string;
  order: number;
  objective: string;
  theory: string;
  example: string;
  smallExercise: string;
  exercise?: string; // backwards compatibility alias for smaller layouts
  realProjectApplication: string;
  expectedOutput: string;
  htmlContent?: string;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  lessonId: string;
  content: string;
  isChecked: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Practice {
  id: string;
  lessonId?: string;
  stageId?: string;
  projectName: string;
  content: string;
  reflection: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  courseId?: string | null;
  lessonId?: string | null;
  title: string;
  description: string;
  instruction: string;
  type: string; // "lesson_exercise" | "course_project"
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  courses: Course[];
  stages: Stage[];
  lessons: Lesson[];
  checklistItems: ChecklistItem[];
  practices: Practice[];
  exercises: Exercise[];
}
