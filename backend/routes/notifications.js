import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(100);
  res.json(notifications);
});

router.patch("/:id/read", async (req, res) => {
  const n = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  res.json(n);
});

router.patch("/read-all", async (_req, res) => {
  await Notification.updateMany({ read: false }, { read: true });
  res.json({ success: true });
});

export default router;
