import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import tasksRouter from "./tasks.js";
import certificateRouter from "./certificate.js";
import adminRouter from "./admin.js";
import internshipsRouter from "./internships.js";
import uploadRouter from "./upload.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/tasks", tasksRouter);
router.use("/certificate", certificateRouter);
router.use("/admin", adminRouter);
router.use("/internships", internshipsRouter);
router.use("/uploads", uploadRouter);

export default router;
