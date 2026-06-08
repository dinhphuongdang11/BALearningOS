import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { DBService } from "./src/server/dbService.js";
import { LessonStatus } from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// --- API ROUTES ---

// 1. Dashboard Stats
app.get("/api/dashboard-stats", (req, res) => {
  try {
    const stats = DBService.getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch dashboard stats" });
  }
});

// 2. Stages CRM/CRUD
app.get("/api/stages", (req, res) => {
  try {
    const stages = DBService.getStages();
    res.json(stages);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch stages" });
  }
});

app.get("/api/stages/:id", (req, res) => {
  try {
    const { id } = req.params;
    const stage = DBService.getStageById(id);
    if (!stage) {
      return res.status(404).json({ error: "Stage not found" });
    }
    const lessons = DBService.getLessons(id);
    res.json({ ...stage, lessons });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch stage details" });
  }
});

app.post("/api/stages", (req, res) => {
  try {
    const { title, description, goal, order } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const stage = DBService.createStage(title, description || "", goal || "", Number(order) || 0);
    res.status(201).json(stage);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create stage" });
  }
});

app.put("/api/stages/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, goal, order } = req.body;
    const updated = DBService.updateStage(id, { title, description, goal, order: order !== undefined ? Number(order) : undefined });
    if (!updated) {
      return res.status(404).json({ error: "Stage not found" });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update stage" });
  }
});

app.delete("/api/stages/:id", (req, res) => {
  try {
    const { id } = req.params;
    const success = DBService.deleteStage(id);
    if (!success) {
      return res.status(404).json({ error: "Stage not found" });
    }
    res.json({ message: "Stage and all child records deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete stage" });
  }
});

// 3. Lessons CRUD
app.get("/api/lessons", (req, res) => {
  try {
    const { stageId } = req.query;
    const lessons = DBService.getLessons(stageId as string);
    res.json(lessons);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch lessons" });
  }
});

app.get("/api/lessons/:id", (req, res) => {
  try {
    const { id } = req.params;
    const lesson = DBService.getLessonById(id);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    const checklistItems = DBService.getChecklistItems(id);
    const practice = DBService.getPracticeByLesson(id);
    res.json({ ...lesson, checklistItems, practice });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch lesson details" });
  }
});

app.post("/api/lessons", (req, res) => {
  try {
    const {
      stageId,
      title,
      order,
      objective,
      theory,
      example,
      exercise,
      realProjectApplication,
      expectedOutput,
      checklistText
    } = req.body;

    if (!stageId || !title) {
      return res.status(400).json({ error: "stageId and title are required" });
    }

    const lessonInput = {
      stageId,
      title,
      order: Number(order) || 1,
      objective: objective || "",
      theory: theory || "",
      example: example || "",
      exercise: exercise || "",
      realProjectApplication: realProjectApplication || "",
      expectedOutput: expectedOutput || "",
    };

    const lesson = DBService.createLesson(lessonInput, checklistText);
    res.status(201).json(lesson);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create lesson" });
  }
});

app.put("/api/lessons/:id", (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      order,
      objective,
      theory,
      example,
      exercise,
      realProjectApplication,
      expectedOutput,
      checklistText,
      status,
      personalNote,
      stageId
    } = req.body;

    const updates: any = {};
    if (stageId !== undefined) updates.stageId = stageId;
    if (title !== undefined) updates.title = title;
    if (order !== undefined) updates.order = Number(order);
    if (objective !== undefined) updates.objective = objective;
    if (theory !== undefined) updates.theory = theory;
    if (example !== undefined) updates.example = example;
    if (exercise !== undefined) updates.exercise = exercise;
    if (realProjectApplication !== undefined) updates.realProjectApplication = realProjectApplication;
    if (expectedOutput !== undefined) updates.expectedOutput = expectedOutput;
    if (status !== undefined) updates.status = status as LessonStatus;
    if (personalNote !== undefined) updates.personalNote = personalNote;

    const updated = DBService.updateLesson(id, updates);
    if (!updated) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Sync checklist if provided
    if (checklistText !== undefined) {
      const lines = checklistText.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      DBService.syncChecklistItems(id, lines);
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update lesson" });
  }
});

app.delete("/api/lessons/:id", (req, res) => {
  try {
    const { id } = req.params;
    const success = DBService.deleteLesson(id);
    if (!success) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    res.json({ message: "Lesson deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete lesson" });
  }
});

// 4. Quick state patch triggers
app.patch("/api/lessons/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status value is required" });
    }
    const updated = DBService.updateLesson(id, { status: status as LessonStatus });
    if (!updated) {
      return res.status(444).json({ error: "Lesson not found" });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to patch lesson status" });
  }
});

app.patch("/api/lessons/:id/personal-note", (req, res) => {
  try {
    const { id } = req.params;
    const { personalNote } = req.body;
    const updated = DBService.updateLesson(id, { personalNote: personalNote || "" });
    if (!updated) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update personal note" });
  }
});

// 5. Checklist Quick APIs
app.get("/api/lessons/:id/checklist", (req, res) => {
  try {
    const { id } = req.params;
    const list = DBService.getChecklistItems(id);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch checklist" });
  }
});

app.post("/api/lessons/:id/checklist", (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Checklist item content is required" });
    }
    const item = DBService.createChecklistItem(id, content);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create checklist item" });
  }
});

app.put("/api/checklist-items/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }
    const updated = DBService.updateChecklistItem(id, content);
    if (!updated) {
      return res.status(444).json({ error: "Checklist item not found" });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update checklist item" });
  }
});

app.patch("/api/checklist-items/:id/toggle", (req, res) => {
  try {
    const { id } = req.params;
    const updated = DBService.toggleChecklistItem(id);
    if (!updated) {
      return res.status(404).json({ error: "Checklist item not found" });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to toggle checklist item" });
  }
});

app.delete("/api/checklist-items/:id", (req, res) => {
  try {
    const { id } = req.params;
    const success = DBService.deleteChecklistItem(id);
    if (!success) {
      return res.status(404).json({ error: "Checklist item not found" });
    }
    res.json({ message: "Checklist item deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete checklist item" });
  }
});

// 6. Practice Save/Fetch
app.get("/api/lessons/:id/practice", (req, res) => {
  try {
    const { id } = req.params;
    const practice = DBService.getPracticeByLesson(id);
    res.json(practice);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch practice work" });
  }
});

app.post("/api/lessons/:id/practice", (req, res) => {
  try {
    const { id } = req.params;
    const { projectName, content, reflection } = req.body;
    const practice = DBService.savePractice(id, projectName || "", content || "", reflection || "");
    res.json(practice);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save practice work" });
  }
});


// --- INTEGRATING VITE DEV SERVER OR STATIC ASSETS ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in developer (Vite HMR/Middleware) mode");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode serving static assets");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
