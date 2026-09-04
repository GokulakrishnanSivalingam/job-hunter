import express from "express";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { checkAllEnabledCompanies } from "../services/careerPageChecker.js";

const router = express.Router();

router.get("/stats", async (_req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [companiesMonitoring, totalJobs, newJobsToday, strongMatches, applications, interviews] =
    await Promise.all([
      Company.countDocuments({ enabled: true }),
      Job.countDocuments(),
      Job.countDocuments({ createdAt: { $gte: startOfDay } }),
      Job.countDocuments({ matchScore: { $gte: 80 } }),
      Application.countDocuments(),
      Application.countDocuments({ status: "Interview" }),
    ]);

  res.json({
    companiesMonitoring,
    totalJobs,
    newJobsToday,
    strongMatches,
    applications,
    interviews,
  });
});

router.get("/new-matches", async (_req, res) => {
  const jobs = await Job.find({ status: "New" }).sort({ matchScore: -1 }).limit(20);
  res.json(jobs);
});

router.post("/check-all", async (_req, res) => {
  try {
    const results = await checkAllEnabledCompanies();
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
