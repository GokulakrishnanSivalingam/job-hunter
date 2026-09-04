import express from "express";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Profile from "../models/Profile.js";
import Resume from "../models/Resume.js";
import { generateCoverLetter, generateSuggestedAnswers } from "../services/aiAssistant.js";
import { attemptAutoApply } from "../services/autoApply.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const apps = await Application.find().sort({ createdAt: -1 });
  res.json(apps);
});

// Step: AI Application Assistant - prepare an application (assisted mode)
router.post("/prepare/:jobId", async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const profile = await Profile.findOne();
  if (!profile) return res.status(400).json({ error: "Please fill in your profile first" });

  const resume =
    (req.body.resumeId && (await Resume.findById(req.body.resumeId))) ||
    (await Resume.findOne({ isDefault: true })) ||
    (await Resume.findOne());

  let coverLetter = "";
  let suggestedAnswersText = "";
  try {
    coverLetter = await generateCoverLetter({ profile, job });
    suggestedAnswersText = await generateSuggestedAnswers({ profile, job });
  } catch (err) {
    coverLetter = "";
    suggestedAnswersText = "";
    // LLM optional - continue without it, never fabricate content manually
  }

  const application = await Application.create({
    job: job._id,
    company: job.companyName,
    jobTitle: job.title,
    jobUrl: job.applicationUrl,
    matchScore: job.matchScore,
    resumeUsed: resume?._id,
    coverLetter,
    suggestedAnswers: suggestedAnswersText
      ? [{ question: "AI suggested answers", answer: suggestedAnswersText }]
      : [],
    applyMode: "assisted",
    status: "Ready to Apply",
  });

  job.status = "Ready to Apply";
  await job.save();

  res.status(201).json(application);
});

// Automatic apply (opt-in) - stops itself on any login/CAPTCHA/MFA wall
router.post("/auto-apply/:jobId", async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  const profile = await Profile.findOne();
  if (!profile) return res.status(400).json({ error: "Please fill in your profile first" });

  const resume = (await Resume.findOne({ isDefault: true })) || (await Resume.findOne());
  let coverLetter = "";
  try {
    coverLetter = await generateCoverLetter({ profile, job });
  } catch {
    /* optional */
  }

  const result = await attemptAutoApply({ job, profile, resume, coverLetter });

  const application = await Application.create({
    job: job._id,
    company: job.companyName,
    jobTitle: job.title,
    jobUrl: job.applicationUrl,
    matchScore: job.matchScore,
    resumeUsed: resume?._id,
    coverLetter,
    applyMode: "automatic",
    status: result.status === "stopped_needs_manual" ? "Ready to Apply" : "New",
    automationLog: result.log,
  });

  res.status(201).json({ application, automation: result });
});

router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  const update = { status };
  if (status === "Applied") update.appliedDate = new Date();
  const app = await Application.findByIdAndUpdate(req.params.id, update, { new: true });
  if (app?.job) {
    await Job.findByIdAndUpdate(app.job, { status });
  }
  res.json(app);
});

router.put("/:id", async (req, res) => {
  const app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(app);
});

router.delete("/:id", async (req, res) => {
  await Application.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
