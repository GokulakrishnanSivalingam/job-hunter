import express from "express";
import Profile from "../models/Profile.js";

const router = express.Router();

// Single-user: GET returns the one profile (or null)
router.get("/", async (_req, res) => {
  const profile = await Profile.findOne();
  res.json(profile || null);
});

// Upsert
router.put("/", async (req, res) => {
  const profile = await Profile.findOneAndUpdate({}, req.body, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });
  res.json(profile);
});

export default router;
