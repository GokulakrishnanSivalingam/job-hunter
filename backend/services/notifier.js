/**
 * Notification fan-out: website (DB-backed, polled by frontend),
 * email (optional, via nodemailer/SMTP), Telegram (optional, via bot API).
 */
import axios from "axios";
import Notification from "../models/Notification.js";
import Preference from "../models/Preference.js";

export async function notifyNewMatch(job) {
  const preference = await Preference.findOne();
  const threshold = preference?.minMatchScoreForNotification ?? 60;

  const title =
    job.matchScore >= threshold
      ? `🔥 ${job.matchScore}% MATCH: ${job.title}`
      : `🆕 New job: ${job.title}`;
  const message = `${job.companyName} - ${job.location || "Location N/A"}`;

  await Notification.create({
    type: job.matchScore >= threshold ? "new_match" : "new_job",
    title,
    message,
    job: job._id,
  });

  if (job.matchScore >= threshold) {
    await sendEmail(title, message, job);
    await sendTelegram(`${title}\n${message}\n${job.applicationUrl || ""}`);
  }
}

async function sendEmail(subject, text, job) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL_TO } = process.env;
  if (!SMTP_HOST || !NOTIFY_EMAIL_TO) return; // email optional

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
    await transporter.sendMail({
      from: SMTP_USER,
      to: NOTIFY_EMAIL_TO,
      subject,
      text: `${text}\n\nApply: ${job.applicationUrl || ""}`,
    });
  } catch (err) {
    console.error("[notifier] email failed:", err.message);
  }
}

async function sendTelegram(text) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return; // telegram optional

  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      { chat_id: TELEGRAM_CHAT_ID, text },
      { timeout: 10000 }
    );
  } catch (err) {
    console.error("[notifier] telegram failed:", err.message);
  }
}
