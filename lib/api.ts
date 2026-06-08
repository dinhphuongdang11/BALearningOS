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
  getDashboardStats: async () => {
    return fetchJson<any>(`${API_BASE}/dashboard-stats`);
  },

  // 2. Stages
  getStages: async () => {
    return fetchJson<Stage[]>(`${API_BASE}/stages`);
  },

  getStageDetails: async (id: string) => {
    return fetchJson<Stage & { lessons: Lesson[] }>(`${API_BASE}/stages/${id}`);
  },

  createStage: async (stageInput: { title: string; description: string; goal: string; order?: number }) => {
    return fetchJson<Stage>(`${API_BASE}/stages`, {
      method: "POST",
      body: JSON.stringify(stageInput),
    });
  },

  // 3. Lessons
  getLessons: async (stageId?: string) => {
    const url = stageId ? `${API_BASE}/lessons?stageId=${stageId}` : `${API_BASE}/lessons`;
    return fetchJson<Lesson[]>(url);
  },

  getLessonDetails: async (id: string) => {
    return fetchJson<Lesson & { checklistItems: ChecklistItem[]; practice: Practice }>(`${API_BASE}/lessons/${id}`);
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

  // 4. Patches
  patchLessonStatus: async (id: string, status: string) => {
    return fetchJson<Lesson>(`${API_BASE}/lessons/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  patchLessonPersonalNote: async (id: string, personalNote: string) => {
    return fetchJson<Lesson>(`${API_BASE}/lessons/${id}/personal-note`, {
      method: "PATCH",
      body: JSON.stringify({ personalNote }),
    });
  },

  // 5. Checklist Items
  addChecklistItem: async (lessonId: string, content: string) => {
    return fetchJson<ChecklistItem>(`${API_BASE}/lessons/${lessonId}/checklist`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  toggleChecklistItem: async (id: string) => {
    return fetchJson<ChecklistItem>(`${API_BASE}/checklist-items/${id}/toggle`, {
      method: "PATCH",
    });
  },

  // 6. Practice Work
  savePractice: async (lessonId: string, projectName: string, content: string, reflection: string) => {
    return fetchJson<Practice>(`${API_BASE}/lessons/${lessonId}/practice`, {
      method: "POST",
      body: JSON.stringify({ projectName, content, reflection }),
    });
  }
};
