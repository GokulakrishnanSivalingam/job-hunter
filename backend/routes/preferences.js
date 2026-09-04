import express from "express";
import Preference from "../models/Preference.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const pref = await Preference.findOne();
  res.json(pref || null);
});

router.put("/", async (req, res) => {
  const pref = await Preference.findOneAndUpdate({}, req.body, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });
  res.json(pref);
});

export default router;
