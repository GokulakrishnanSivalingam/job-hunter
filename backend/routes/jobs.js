import express from "express";
import Job from "../models/Job.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { status, minMatch, search, sort } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (minMatch) filter.matchScore = { $gte: Number(minMatch) };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
    ];
  }

  let query = Job.find(filter);
  query = sort === "recent" ? query.sort({ createdAt: -1 }) : query.sort({ matchScore: -1 });

  const jobs = await query.limit(200);
  res.json(jobs);
});

router.get("/:id", async (req, res) => {
  const job = await Job.findById(req.params.id).populate("company");
  if (!job) return res.status(404).json({ error: "Not found" });
  res.json(job);
});

router.patch("/:id/status", async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, isNew: false },
    { new: true }
  );
  if (!job) return res.status(404).json({ error: "Not found" });
  res.json(job);
});

router.patch("/:id/seen", async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, { isNew: false }, { new: true });
  res.json(job);
});

export default router;
