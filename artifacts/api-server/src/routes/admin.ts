import { Router, type IRouter } from "express";
import { db, internshipTemplatesTable, taskTemplatesTable, usersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth.js";
import { adminMiddleware } from "../middlewares/adminAuth.js";

const router: IRouter = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

function formatInternship(i: typeof internshipTemplatesTable.$inferSelect, taskCount: number) {
  return {
    id: i.id,
    title: i.title,
    field: i.field,
    description: i.description,
    imageUrl: i.imageUrl ?? null,
    isActive: i.isActive,
    taskCount,
    createdAt: i.createdAt.toISOString(),
  };
}

function formatTaskTemplate(t: typeof taskTemplatesTable.$inferSelect) {
  return {
    id: t.id,
    internshipTemplateId: t.internshipTemplateId,
    dayNumber: t.dayNumber,
    title: t.title,
    description: t.description,
    instructions: t.instructions,
    videoUrl: t.videoUrl ?? null,
    videoType: t.videoType ?? null,
    questions: t.questions ?? null,
  };
}

// ── Internships ───────────────────────────────────────────────────

router.get("/internships", async (_req, res) => {
  try {
    const internships = await db.select().from(internshipTemplatesTable).orderBy(internshipTemplatesTable.createdAt);
    const result = await Promise.all(
      internships.map(async (i) => {
        const [{ value: taskCount }] = await db.select({ value: count() }).from(taskTemplatesTable).where(eq(taskTemplatesTable.internshipTemplateId, i.id));
        return formatInternship(i, Number(taskCount));
      })
    );
    res.json({ internships: result });
  } catch (err) {
    console.error("Admin get internships error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to get internships" });
  }
});

router.post("/internships", async (req, res) => {
  try {
    const { title, field, description, imageUrl, isActive = true } = req.body;
    if (!title || !field || !description) {
      res.status(400).json({ error: "Bad Request", message: "title, field, and description are required" });
      return;
    }
    const [intern] = await db.insert(internshipTemplatesTable).values({ title, field, description, imageUrl: imageUrl || null, isActive }).returning();
    res.status(201).json(formatInternship(intern, 0));
  } catch (err) {
    console.error("Admin create internship error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to create internship" });
  }
});

router.get("/internships/:internshipId", async (req, res) => {
  try {
    const id = parseInt(req.params["internshipId"] ?? "0", 10);
    const rows = await db.select().from(internshipTemplatesTable).where(eq(internshipTemplatesTable.id, id)).limit(1);
    if (rows.length === 0) {
      res.status(404).json({ error: "Not Found", message: "Internship not found" });
      return;
    }
    const intern = rows[0];
    const tasks = await db.select().from(taskTemplatesTable).where(eq(taskTemplatesTable.internshipTemplateId, id)).orderBy(taskTemplatesTable.dayNumber);
    res.json({
      id: intern.id, title: intern.title, field: intern.field,
      description: intern.description, imageUrl: intern.imageUrl ?? null,
      isActive: intern.isActive, createdAt: intern.createdAt.toISOString(),
      tasks: tasks.map(formatTaskTemplate),
    });
  } catch (err) {
    console.error("Admin get internship error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to get internship" });
  }
});

router.put("/internships/:internshipId", async (req, res) => {
  try {
    const id = parseInt(req.params["internshipId"] ?? "0", 10);
    const { title, field, description, imageUrl, isActive } = req.body;
    if (!title || !field || !description) {
      res.status(400).json({ error: "Bad Request", message: "title, field, and description are required" });
      return;
    }
    const [intern] = await db.update(internshipTemplatesTable)
      .set({ title, field, description, imageUrl: imageUrl ?? null, ...(isActive !== undefined ? { isActive } : {}) })
      .where(eq(internshipTemplatesTable.id, id))
      .returning();
    if (!intern) {
      res.status(404).json({ error: "Not Found", message: "Internship not found" });
      return;
    }
    const [{ value: taskCount }] = await db.select({ value: count() }).from(taskTemplatesTable).where(eq(taskTemplatesTable.internshipTemplateId, id));
    res.json(formatInternship(intern, Number(taskCount)));
  } catch (err) {
    console.error("Admin update internship error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to update internship" });
  }
});

router.delete("/internships/:internshipId", async (req, res) => {
  try {
    const id = parseInt(req.params["internshipId"] ?? "0", 10);
    await db.delete(internshipTemplatesTable).where(eq(internshipTemplatesTable.id, id));
    res.json({ success: true, message: "Internship deleted" });
  } catch (err) {
    console.error("Admin delete internship error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to delete internship" });
  }
});

// ── Task Templates ────────────────────────────────────────────────

router.post("/internships/:internshipId/tasks", async (req, res) => {
  try {
    const internshipTemplateId = parseInt(req.params["internshipId"] ?? "0", 10);
    const { dayNumber, title, description, instructions, videoUrl, videoType, questions } = req.body;
    if (!dayNumber || !title || !description || !instructions) {
      res.status(400).json({ error: "Bad Request", message: "dayNumber, title, description, and instructions are required" });
      return;
    }
    const [task] = await db.insert(taskTemplatesTable).values({
      internshipTemplateId, dayNumber: Number(dayNumber), title, description, instructions,
      videoUrl: videoUrl || null,
      videoType: videoType || null,
      questions: questions || null,
    }).returning();
    res.status(201).json(formatTaskTemplate(task));
  } catch (err) {
    console.error("Admin create task template error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to create task template" });
  }
});

router.put("/tasks/:taskTemplateId", async (req, res) => {
  try {
    const id = parseInt(req.params["taskTemplateId"] ?? "0", 10);
    const { dayNumber, title, description, instructions, videoUrl, videoType, questions } = req.body;
    if (!dayNumber || !title || !description || !instructions) {
      res.status(400).json({ error: "Bad Request", message: "dayNumber, title, description, and instructions are required" });
      return;
    }
    const [task] = await db.update(taskTemplatesTable).set({
      dayNumber: Number(dayNumber), title, description, instructions,
      videoUrl: videoUrl || null,
      videoType: videoType || null,
      questions: questions || null,
    }).where(eq(taskTemplatesTable.id, id)).returning();
    if (!task) {
      res.status(404).json({ error: "Not Found", message: "Task template not found" });
      return;
    }
    res.json(formatTaskTemplate(task));
  } catch (err) {
    console.error("Admin update task template error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to update task template" });
  }
});

router.delete("/tasks/:taskTemplateId", async (req, res) => {
  try {
    const id = parseInt(req.params["taskTemplateId"] ?? "0", 10);
    await db.delete(taskTemplatesTable).where(eq(taskTemplatesTable.id, id));
    res.json({ success: true, message: "Task template deleted" });
  } catch (err) {
    console.error("Admin delete task template error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to delete task template" });
  }
});

// ── Users ─────────────────────────────────────────────────────────

router.get("/users", async (_req, res) => {
  try {
    const users = await db.select({
      id: usersTable.id, name: usersTable.name, email: usersTable.email,
      internshipTitle: usersTable.internshipTitle, internshipField: usersTable.internshipField,
      progress: usersTable.progress,
      tasksCompleted: usersTable.tasksCompleted, totalTasks: usersTable.totalTasks,
      certificateGenerated: usersTable.certificateGenerated, startDate: usersTable.startDate,
    }).from(usersTable).orderBy(usersTable.createdAt);
    res.json({ users: users.map(u => ({ ...u, startDate: u.startDate.toISOString() })) });
  } catch (err) {
    console.error("Admin get users error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to get users" });
  }
});

export default router;
