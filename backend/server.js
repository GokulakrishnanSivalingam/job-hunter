import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";
import { startScheduler } from "./services/scheduler.js";

import profileRoutes from "./routes/profile.js";
import resumeRoutes from "./routes/resumes.js";
import companyRoutes from "./routes/companies.js";
import jobRoutes from "./routes/jobs.js";
import applicationRoutes from "./routes/applications.js";
import preferenceRoutes from "./routes/preferences.js";
import notificationRoutes from "./routes/notifications.js";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/profile", profileRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/helth", (_req, res) => res.json({ ok: true }));

// Generic error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  startScheduler();
  app.listen(PORT, () => console.log(`[server] Personal Job Agent API running on port ${PORT}`));
})();
