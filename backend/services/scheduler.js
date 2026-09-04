import cron from "node-cron";
import { checkAllEnabledCompanies } from "./careerPageChecker.js";

export function startScheduler() {
  const expr = process.env.CHECK_INTERVAL_CRON || "0 * * * *"; // every hour by default
  cron.schedule(expr, async () => {
    console.log("[scheduler] running scheduled career page check...");
    try {
      const results = await checkAllEnabledCompanies();
      const totalNew = results.reduce((sum, r) => sum + (r.newJobs || 0), 0);
      console.log(`[scheduler] done. ${totalNew} new jobs found.`);
    } catch (err) {
      console.error("[scheduler] error:", err.message);
    }
  });
  console.log(`[scheduler] scheduled with cron expression: ${expr}`);
}
