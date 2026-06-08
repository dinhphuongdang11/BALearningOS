import { Stage, Lesson, ChecklistItem, Practice } from "./types";

const API_BASE = "/api";

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const AppAPI = {
  // 1. Stats
  getDashboardStats: async (includeDrafts = false) => {
    return fetchJson<any>(`${API_BASE}/dashboard-stats?includeDrafts=${includeDrafts}`);
  },

  // 2. Stages
  getStages: async (includeDrafts = false) => {
    return fetchJson<Stage[]>(`${API_BASE}/stages?includeDrafts=${includeDrafts}`);
  },

  getStageDetails: async (id: string, includeDrafts = false) => {
    return fetchJson<Stage & { lessons: Lesson[] }>(`${API_BASE}/stages/${id}?includeDrafts=${includeDrafts}`);
  },

  createStage: async (stageInput: {
    code?: string;
    title: string;
    description: string;
    goal: string;
    order: number;
    bigExercise: string;
    expectedOutput: string;
    finalChecklist: string;
    status: string;
  }) => {
    return fetchJson<Stage>(`${API_BASE}/stages`, {
      method: "POST",
      body: JSON.stringify(stageInput),
    });
  },

  updateStage: async (id: string, stageInput: {
    code?: string;
    title?: string;
    description?: string;
    goal?: string;
    order?: number;
    bigExercise?: string;
    expectedOutput?: string;
    finalChecklist?: string;
    status?: string;
  }) => {
    return fetchJson<Stage>(`${API_BASE}/stages/${id}`, {
      method: "PUT",
      body: JSON.stringify(stageInput),
    });
  },

  deleteStage: async (id: string) => {
    return fetchJson<{ message: string }>(`${API_BASE}/stages/${id}`, {
      method: "DELETE",
    });
  },

  // 3. Lessons
  getLessons: async (stageId?: string, includeDrafts = false) => {
    let url = `${API_BASE}/lessons?includeDrafts=${includeDrafts}`;
    if (stageId) url += `&stageId=${stageId}`;
    return fetchJson<Lesson[]>(url);
  },

  getLessonDetails: async (id: string) => {
    return fetchJson<Lesson & { checklistItems: ChecklistItem[]; practice: Practice; progressStatus?: string }>(`${API_BASE}/lessons/${id}`);
  },

  createLesson: async (payload: any) => {
    return fetchJson<Lesson>(`${API_BASE}/lessons`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateLesson: async (id: string, payload: any) => {
    return fetchJson<Lesson>(`${API_BASE}/lessons/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteLesson: async (id: string) => {
    return fetchJson<{ message: string }>(`${API_BASE}/lessons/${id}`, {
      method: "DELETE",
    });
  },

  // 4. Progress Management (Unified)
  updateProgress: async (entityType: "STAGE" | "LESSON", entityId: string, status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED") => {
    return fetchJson<any>(`${API_BASE}/progress`, {
      method: "PUT",
      body: JSON.stringify({ entityType, entityId, status }),
    });
  },

  updateChecklistProgress: async (checklistItemId: string, isChecked: boolean) => {
    return fetchJson<any>(`${API_BASE}/checklist-progress`, {
      method: "PUT",
      body: JSON.stringify({ checklistItemId, isChecked }),
    });
  },

  // Backwards compatible patch endpoints calling the toggle API
  toggleChecklistItem: async (id: string) => {
    return fetchJson<any>(`${API_BASE}/checklist-items/${id}/toggle`, {
      method: "PATCH"
    });
  },

  patchLessonStatus: async (id: string, status: string) => {
    return fetchJson<any>(`${API_BASE}/progress`, {
      method: "PUT",
      body: JSON.stringify({ entityType: "LESSON", entityId: id, status }),
    });
  },

  patchLessonPersonalNote: async (id: string, personalNote: string) => {
    return fetchJson<any>(`${API_BASE}/lesson-practices`, {
      method: "POST",
      body: JSON.stringify({ lessonId: id, reflection: personalNote }),
    });
  },

  // Mock-add for quick manual inputs
  addChecklistItem: async (lessonId: string, content: string) => {
    return fetchJson<ChecklistItem>(`${API_BASE}/lessons/${lessonId}/checklist`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  // 5. Practices (Lesson and Stage levels)
  saveLessonPractice: async (lessonId: string, payload: { projectName: string; content: string; reflection: string }) => {
    return fetchJson<any>(`${API_BASE}/lesson-practices`, {
      method: "POST",
      body: JSON.stringify({ lessonId, ...payload })
    });
  },

  saveStagePractice: async (stageId: string, payload: { projectName: string; content: string; reflection: string }) => {
    return fetchJson<any>(`${API_BASE}/stage-practices`, {
      method: "POST",
      body: JSON.stringify({ stageId, ...payload })
    });
  },

  // Backwards compatible fallback
  savePractice: async (lessonId: string, projectName: string, content: string, reflection: string) => {
    return fetchJson<any>(`${API_BASE}/lesson-practices`, {
      method: "POST",
      body: JSON.stringify({ lessonId, projectName, content, reflection })
    });
  },

  // 6. Excel Bulk Import
  importPreview: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch(`${API_BASE}/admin/import/preview`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    return response.json();
  },

  importConfirm: async (payload: { stages: any[]; lessons: any[]; checklists: any[] }) => {
    return fetchJson<any>(`${API_BASE}/admin/import/confirm`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
