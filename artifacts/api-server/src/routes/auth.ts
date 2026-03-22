import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, tasksTable, internshipTemplatesTable, taskTemplatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateToken } from "../middlewares/auth.js";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    internshipTitle: user.internshipTitle,
    internshipField: user.internshipField,
    progress: user.progress,
    tasksCompleted: user.tasksCompleted,
    totalTasks: user.totalTasks,
    certificateGenerated: user.certificateGenerated,
    startDate: user.startDate.toISOString(),
    isAdmin: user.isAdmin,
  };
}

router.post("/register", async (req, res) => {
  try {
    const parsed = RegisterBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", message: "Invalid input data" });
      return;
    }

    const { name, email, password } = parsed.data;
    const internshipId = req.body.internshipId ? Number(req.body.internshipId) : null;

    // Internship selection is required
    if (!internshipId) {
      res.status(400).json({ error: "Validation error", message: "Please select an internship program to continue." });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Conflict", message: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Must use specified internship — no random fallback
    const rows = await db.select().from(internshipTemplatesTable)
      .where(eq(internshipTemplatesTable.id, internshipId))
      .limit(1);

    if (rows.length === 0 || !rows[0].isActive) {
      res.status(400).json({ error: "Bad Request", message: "Selected internship program is not available." });
      return;
    }

    const internship = rows[0];

    const templateTasks = await db.select().from(taskTemplatesTable)
      .where(eq(taskTemplatesTable.internshipTemplateId, internship.id))
      .orderBy(taskTemplatesTable.dayNumber);

    const totalTasks = templateTasks.length;

    const [user] = await db.insert(usersTable).values({
      name, email, passwordHash,
      internshipTitle: internship.title,
      internshipField: internship.field,
      totalTasks, progress: 0, tasksCompleted: 0,
      certificateGenerated: false, isAdmin: false,
    }).returning();

    if (templateTasks.length > 0) {
      await db.insert(tasksTable).values(
        templateTasks.map(t => ({
          userId: user.id,
          dayNumber: t.dayNumber,
          title: t.title,
          description: t.description,
          instructions: t.instructions,
          videoUrl: t.videoUrl ?? null,
          videoType: t.videoType ?? null,
          questions: t.questions ?? null,
          isCompleted: false,
        }))
      );
    }

    const token = generateToken(user.id);
    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error", message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", message: "Invalid input data" });
      return;
    }
    const { email, password } = parsed.data;
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (users.length === 0) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
      return;
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
      return;
    }
    const token = generateToken(user.id);
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error", message: "Login failed" });
  }
});

export default router;
