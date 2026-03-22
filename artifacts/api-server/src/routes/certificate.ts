import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (users.length === 0) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }
    const user = users[0];

    if (!user.certificateGenerated || !user.certificateId) {
      res.status(403).json({ error: "Forbidden", message: "Certificate not yet earned. Complete all tasks first." });
      return;
    }

    const completionDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    res.json({
      userName: user.name,
      internshipTitle: user.internshipTitle,
      internshipField: user.internshipField,
      completionDate,
      certificateId: user.certificateId,
      totalDays: user.totalTasks,
    });
  } catch (err) {
    console.error("Certificate error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to get certificate" });
  }
});

export default router;
