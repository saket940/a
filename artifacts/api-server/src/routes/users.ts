import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (users.length === 0) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }
    const user = users[0];
    res.json({
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
    });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to get user" });
  }
});

export default router;
