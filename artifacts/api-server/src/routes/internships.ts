import { Router, type IRouter } from "express";
import { db, internshipTemplatesTable, taskTemplatesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  try {
    const internships = await db.select().from(internshipTemplatesTable)
      .where(eq(internshipTemplatesTable.isActive, true))
      .orderBy(internshipTemplatesTable.createdAt);

    const result = await Promise.all(
      internships.map(async (i) => {
        const [{ value: taskCount }] = await db
          .select({ value: count() })
          .from(taskTemplatesTable)
          .where(eq(taskTemplatesTable.internshipTemplateId, i.id));
        return {
          id: i.id,
          title: i.title,
          field: i.field,
          description: i.description,
          imageUrl: i.imageUrl ?? null,
          taskCount: Number(taskCount),
        };
      })
    );

    res.json({ internships: result });
  } catch (err) {
    console.error("Get public internships error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to get internships" });
  }
});

export default router;
