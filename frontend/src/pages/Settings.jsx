import React from "react";

export default function Settings() {
  return (
    <div className="max-w-2xl space-y-6 text-sm">
      <section className="border border-paper-line dark:border-ink-line rounded-lg p-5 bg-paper-soft dark:bg-ink-soft">
        <h2 className="font-display font-semibold text-base mb-2">About this app</h2>
        <p className="text-ink/70 dark:text-paper/70">
          This is your personal job search agent — single user, no login. All configuration
          (LLM key, SMTP, Telegram, external job APIs) lives in <code>backend/.env</code>.
        </p>
      </section>

      <section className="border border-paper-line dark:border-ink-line rounded-lg p-5 bg-paper-soft dark:bg-ink-soft space-y-2">
        <h2 className="font-display font-semibold text-base mb-1">Career page connectors</h2>
        <ul className="list-disc list-inside text-ink/70 dark:text-paper/70 space-y-1">
          <li><strong>Greenhouse</strong> — real public job-board API, auto-detected from URL.</li>
          <li><strong>Lever</strong> — real public postings API, auto-detected from URL.</li>
          <li><strong>Generic</strong> — Cheerio for static pages, Playwright fallback for JS-rendered pages. Respects robots.txt and stops on CAPTCHA/login walls.</li>
          <li><strong>External Job API</strong> — plug in a job API you have legitimate access to. LinkedIn and Naukri don't offer public scraping-friendly APIs and block automated access, so this app doesn't scrape them directly — see <code>backend/services/connectors/externalJobApi.js</code>.</li>
        </ul>
      </section>

      <section className="border border-paper-line dark:border-ink-line rounded-lg p-5 bg-paper-soft dark:bg-ink-soft">
        <h2 className="font-display font-semibold text-base mb-2">Scheduler</h2>
        <p className="text-ink/70 dark:text-paper/70">
          Career pages are checked automatically on the cron schedule set by{" "}
          <code>CHECK_INTERVAL_CRON</code> in <code>backend/.env</code> (default: every hour).
          You can also trigger a check anytime from the Dashboard.
        </p>
      </section>
    </div>
  );
}
