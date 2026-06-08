/**
 * BA Learning OS
 * Domain Types Definition
 */

export enum LessonStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

export interface Stage {
  id: string;
  title: string;
  description: string;
  goal: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  stageId: string;
  title: string;
  order: number;
  objective: string;
  theory: string;
  example: string;
  exercise: string;
  realProjectApplication: string;
  expectedOutput: string;
  status: LessonStatus;
  personalNote: string;
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
  lessonId: string;
  projectName: string;
  content: string;
  reflection: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  stages: Stage[];
  lessons: Lesson[];
  checklistItems: ChecklistItem[];
  practices: Practice[];
}
