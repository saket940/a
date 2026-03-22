import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import router from "./routes/index.js";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use("/api/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

app.use("/api", router);

export default app;
