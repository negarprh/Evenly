import { Router } from "express";
import { authRouter } from "./authRoutes.js";
import { groupRouter } from "./groupRoutes.js";
import { expenseRouter } from "./expenseRoutes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" }, message: "Evenly API is healthy" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/groups", groupRouter);
apiRouter.use("/expenses", expenseRouter);
