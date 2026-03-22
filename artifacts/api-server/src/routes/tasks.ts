import { Router, type IRouter } from "express";
import { db, usersTable, tasksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import type { MCQQuestion } from "@workspace/db";

const router: IRouter = Router();

function getTaskStatus(task: { isCompleted: boolean; dayNumber: number }, tasksCompleted: number): "locked" | "pending" | "completed" {
  if (task.isCompleted) return "completed";
  if (task.dayNumber === tasksCompleted + 1) return "pending";
  return "locked";
}

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (users.length === 0) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }
    const user = users[0];

    const tasks = await db.select().from(tasksTable)
      .where(eq(tasksTable.userId, req.userId!))
      .orderBy(tasksTable.dayNumber);

    const tasksWithStatus = tasks.map((task) => ({
      id: task.id,
      dayNumber: task.dayNumber,
      title: task.title,
      description: task.description,
      instructions: task.instructions,
      videoUrl: task.videoUrl ?? null,
      videoType: task.videoType ?? null,
      questions: task.questions ?? null,
      status: getTaskStatus(task, user.tasksCompleted),
      submittedCode: task.submittedCode ?? null,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    }));

    res.json({
      tasks: tasksWithStatus,
      internshipTitle: user.internshipTitle,
      progress: user.progress,
    });
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to get tasks" });
  }
});

router.post("/:taskId/complete", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const taskId = parseInt(req.params["taskId"] ?? "0", 10);
    if (isNaN(taskId)) {
      res.status(400).json({ error: "Bad Request", message: "Invalid task ID" });
      return;
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (users.length === 0) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }
    const user = users[0];

    const taskRows = await db.select().from(tasksTable)
      .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, req.userId!)))
      .limit(1);

    if (taskRows.length === 0) {
      res.status(404).json({ error: "Not Found", message: "Task not found" });
      return;
    }

    const task = taskRows[0];

    if (task.isCompleted) {
      res.status(400).json({ error: "Bad Request", message: "Task already completed" });
      return;
    }

    if (task.dayNumber !== user.tasksCompleted + 1) {
      res.status(400).json({ error: "Bad Request", message: "Complete previous tasks first" });
      return;
    }

    // Validate MCQ answers if the task has questions
    const questions = task.questions as MCQQuestion[] | null;
    const answers: number[] = req.body?.answers ?? [];

    if (questions && questions.length > 0) {
      if (!Array.isArray(answers) || answers.length !== questions.length) {
        res.status(400).json({
          error: "Bad Request",
          message: `Please answer all ${questions.length} question(s) before submitting.`,
        });
        return;
      }

      const wrongAnswers: number[] = [];
      questions.forEach((q, i) => {
        if (answers[i] !== q.correctIndex) {
          wrongAnswers.push(i);
        }
      });

      if (wrongAnswers.length > 0) {
        res.status(400).json({
          error: "Wrong Answers",
          message: `${wrongAnswers.length} answer(s) are incorrect. Please review and try again.`,
          wrongAnswers,
        });
        return;
      }
    }

    const submittedCode = req.body?.submittedCode ?? null;

    await db.update(tasksTable).set({
      isCompleted: true,
      submittedCode,
      completedAt: new Date(),
    }).where(eq(tasksTable.id, taskId));

    const newTasksCompleted = user.tasksCompleted + 1;
    const newProgress = (newTasksCompleted / user.totalTasks) * 100;
    const certificateGenerated = newProgress >= 100;

    const certificateId = certificateGenerated && !user.certificateGenerated
      ? `IH-${user.id}-${Date.now()}`
      : user.certificateId;

    await db.update(usersTable).set({
      tasksCompleted: newTasksCompleted,
      progress: newProgress,
      certificateGenerated,
      ...(certificateId ? { certificateId } : {}),
    }).where(eq(usersTable.id, req.userId!));

    let message = "All answers correct! Task completed.";
    if (certificateGenerated && !user.certificateGenerated) {
      message = "Congratulations! You've completed the internship. Your certificate is ready!";
    }

    res.json({
      success: true,
      progress: newProgress,
      tasksCompleted: newTasksCompleted,
      totalTasks: user.totalTasks,
      certificateGenerated,
      message,
    });
  } catch (err) {
    console.error("Complete task error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to complete task" });
  }
});

export default router;
