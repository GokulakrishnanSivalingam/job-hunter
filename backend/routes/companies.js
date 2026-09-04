import express from "express";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import { checkCompany } from "../services/careerPageChecker.js";
import { detectConnectorType, extractBoardToken } from "../services/connectors/index.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const companies = await Company.find().sort({ createdAt: -1 });
  res.json(companies);
});

router.post("/", async (req, res) => {
  const { name, careerPageUrl, connectorType, boardToken } = req.body;
  if (!name || !careerPageUrl) {
    return res.status(400).json({ error: "name and careerPageUrl are required" });
  }
  const finalType = connectorType || detectConnectorType(careerPageUrl);
  const finalToken = boardToken || extractBoardToken(careerPageUrl, finalType);

  const company = await Company.create({
    name,
    careerPageUrl,
    connectorType: finalType,
    boardToken: finalToken,
  });
  res.status(201).json(company);
});

router.put("/:id", async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!company) return res.status(404).json({ error: "Not found" });
  res.json(company);
});

router.patch("/:id/toggle", async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ error: "Not found" });
  company.enabled = !company.enabled;
  await company.save();
  res.json(company);
});

router.delete("/:id", async (req, res) => {
  await Company.findByIdAndDelete(req.params.id);
  await Job.deleteMany({ company: req.params.id });
  res.json({ success: true });
});

router.post("/:id/check-now", async (req, res) => {
  try {
    const result = await checkCompany(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
