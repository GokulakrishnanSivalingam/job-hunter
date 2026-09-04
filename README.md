# Job Agent — Personal Career-Page Monitoring & Auto-Apply Tool

A private, single-user job search dashboard. No login, no accounts — it opens
straight to your dashboard. Everything (profile, resumes, companies, jobs,
applications) lives in your own MongoDB.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Scheduler:** node-cron
- **Scraping:** Cheerio (static pages) + Playwright (JS-rendered pages), used only for permitted public career pages
- **AI:** Pluggable LLM call (Anthropic API by default) for match explanations, cover letters, and suggested answers

## A note on LinkedIn / Naukri

Neither platform provides a public API for pulling job listings for a
personal tool, and both explicitly block/ban automated scraping in their
Terms of Service. So this project does **not** include a LinkedIn or Naukri
scraper — that would violate their ToS and the "never bypass anti-bot
protections" rule from the original spec.

Instead, the connector architecture ships with:
- **Greenhouse** and **Lever** connectors — these use each platform's genuine
  public job-board JSON APIs (no auth needed, openly published by companies
  for exactly this purpose).
- A **generic connector** (Cheerio + Playwright fallback) for other public
  career pages, which checks `robots.txt` first and immediately stops if it
  hits a CAPTCHA or login wall.
- An **External Job API** connector slot
  (`backend/services/connectors/externalJobApi.js`) where you can plug in
  credentials for any job API you *do* have legitimate access to (a licensed
  aggregator, or an official LinkedIn/Naukri partner API if you have one) —
  same standardized job format, easy to wire up.

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, optionally LLM_API_KEY, SMTP_*, TELEGRAM_*
npm install
npx playwright install chromium   # only needed for JS-rendered career pages
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to the backend.

### 3. MongoDB

Point `MONGO_URI` at a local MongoDB instance or a free MongoDB Atlas cluster.

## Adding a company to monitor

1. Go to **Companies** → paste the career page URL.
   - `https://boards.greenhouse.io/<company>` → auto-detected as Greenhouse.
   - `https://jobs.lever.co/<company>` → auto-detected as Lever.
   - Anything else → falls back to the generic connector.
2. Click **Check Now**, or wait for the hourly scheduled check
   (`CHECK_INTERVAL_CRON` in `backend/.env`).
3. New jobs are matched against your **Profile** + **Preferences**
   automatically and show up on the **Dashboard**.

## Folder structure

```
backend/
  models/          Mongoose schemas (profile, resumes, companies, jobs, applications, preferences, notifications)
  routes/          Express REST routes
  services/
    connectors/    Greenhouse, Lever, generic (Cheerio/Playwright), external API
    careerPageChecker.js   fetch -> normalize -> dedupe -> match -> save -> notify
    matcher.js       rule-based match scoring (never invents skills)
    aiAssistant.js   LLM calls for match explanations / cover letters / answers
    autoApply.js     opt-in automatic apply, stops on login/CAPTCHA/MFA
    notifier.js      website + email + Telegram notifications
    scheduler.js     node-cron hourly check
frontend/
  src/pages/       Dashboard, Jobs, Companies, Applications, Resume, Profile, Preferences, Settings
  src/components/  Sidebar, JobCard, StatCard, Toast, etc.
```

## Safety defaults baked in

- Respects `robots.txt` on generic career pages.
- Never attempts to bypass CAPTCHA, logins, MFA, or anti-bot protections —
  automation stops and hands control back to you instead.
- Never fabricates skills, experience, or application answers — AI features
  only use what's in your saved Profile/Resume, and say "not enough
  information" rather than guessing.
