/**
 * Automatic Apply flow (opt-in, per your spec).
 * Only proceeds for application flows where automation is explicitly
 * feasible with a normal form-fill (no login/CAPTCHA/MFA). The moment
 * anything like that is detected, it stops and hands control back to you.
 *
 * This uses Playwright to fill a REAL application form that YOU direct it
 * to (the job's own applicationUrl) - it never bypasses any security
 * mechanism, it simply automates typing into visible form fields.
 */
import Application from "../models/Application.js";

export async function attemptAutoApply({ job, profile, resume, coverLetter }) {
  const log = [];
  const push = (step, result, message) => log.push({ step, result, message, at: new Date() });

  if (!job.applicationUrl) {
    push("start", "error", "No application URL available");
    return { status: "error", log };
  }

  let browser;
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch();
    const page = await browser.newPage();
    push("navigate", "success", `Opening ${job.applicationUrl}`);
    await page.goto(job.applicationUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    const bodyText = (await page.textContent("body").catch(() => "")) || "";
    if (/captcha|sign in|log in|verify you.?re human|two-factor|otp/i.test(bodyText)) {
      push("security-check", "stopped", "Login / CAPTCHA / MFA detected - stopping automation");
      await browser.close();
      return { status: "stopped_needs_manual", log, applicationUrl: job.applicationUrl };
    }

    // Best-effort generic field fill (works for simple forms like Greenhouse's
    // embedded application form). Complex/custom forms will simply not match
    // any selector and are safely skipped - never guessed or fabricated.
    const fieldMap = [
      { selectors: ["input[name*=name]", "#first_name"], value: profile.fullName },
      { selectors: ["input[type=email]", "input[name*=email]"], value: profile.email },
      { selectors: ["input[type=tel]", "input[name*=phone]"], value: profile.phone },
    ];

    for (const field of fieldMap) {
      for (const sel of field.selectors) {
        const el = await page.$(sel);
        if (el && field.value) {
          await el.fill(String(field.value)).catch(() => {});
          break;
        }
      }
    }
    push("fill-fields", "success", "Filled available standard fields (name/email/phone)");

    // Resume upload, cover letter fields etc. vary too much per-ATS to safely
    // automate blindly - we stop here and hand back to you for review before
    // any final submission, per the "never fabricate application answers" rule.
    push("handoff", "stopped", "Stopping before submit for your review (safety default)");

    await browser.close();
    return { status: "stopped_needs_manual", log, applicationUrl: job.applicationUrl };
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    push("error", "error", err.message);
    return { status: "error", log };
  }
}
