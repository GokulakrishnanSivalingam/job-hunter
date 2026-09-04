import express from "express";
import path from "path";
import fs from "fs";
import Resume from "../models/Resume.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const resumes = await Resume.find().sort({ createdAt: -1 });
  res.json(resumes);
});

router.post("/", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const { label, isDefault } = req.body;

  if (isDefault === "true") {
    await Resume.updateMany({}, { isDefault: false });
  }

  const resume = await Resume.create({
    label: label || req.file.originalname,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    filePath: req.file.path,
    mimeType: req.file.mimetype,
    isDefault: isDefault === "true",
  });
  res.status(201).json(resume);
});

router.get("/:id/download", async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) return res.status(404).json({ error: "Not found" });
  res.download(resume.filePath, resume.originalName);
});

router.put("/:id", upload.single("resume"), async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) return res.status(404).json({ error: "Not found" });

  if (req.file) {
    // remove old file
    fs.existsSync(resume.filePath) && fs.unlinkSync(resume.filePath);
    resume.fileName = req.file.filename;
    resume.originalName = req.file.originalname;
    resume.filePath = req.file.path;
    resume.mimeType = req.file.mimetype;
  }
  if (req.body.label) resume.label = req.body.label;
  if (req.body.isDefault === "true") {
    await Resume.updateMany({}, { isDefault: false });
    resume.isDefault = true;
  }
  await resume.save();
  res.json(resume);
});

router.delete("/:id", async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) return res.status(404).json({ error: "Not found" });
  fs.existsSync(resume.filePath) && fs.unlinkSync(resume.filePath);
  await resume.deleteOne();
  res.json({ success: true });
});

export default router;
