/**
 * Generic connector for permitted static/dynamic career pages that don't
 * expose a known structured API (Greenhouse/Lever/etc).
 *
 * IMPORTANT: This connector is intentionally conservative:
 * - It checks robots.txt before fetching.
 * - It does NOT attempt to bypass logins, CAPTCHAs, or bot-detection.
 * - It uses generic heuristics (job-ish list items/links) that you should
 *   tune per-site by supplying CSS selectors on the Company record if needed.
 *
 * Static pages -> Cheerio (fast, no browser).
 * JS-rendered pages -> Playwright (headless browser), only if the page
 * genuinely requires it and access is permitted.
 */
import axios from "axios";
import * as cheerio from "cheerio";

export async function isAllowedByRobots(pageUrl) {
  try {
    const { origin } = new URL(pageUrl);
    const robotsUrl = `${origin}/robots.txt`;
    const { data } = await axios.get(robotsUrl, { timeout: 8000 });
    // Extremely simple robots.txt check: block if a Disallow: / applies to * and
    // no specific allow overrides it. Real-world sites vary; treat this as a
    // conservative default, not a full parser.
    const lines = data.split("\n").map((l) => l.trim());
    let applies = false;
    for (const line of lines) {
      if (/^user-agent:\s*\*/i.test(line)) applies = true;
      else if (/^user-agent:/i.test(line)) applies = false;
      else if (applies && /^disallow:\s*\/\s*$/i.test(line)) return false;
    }
    return true;
  } catch {
    // If robots.txt is unreachable, don't block on that alone -
    // but the caller should still respect ToS separately.
    return true;
  }
}

export async function fetchGenericJobsStatic(pageUrl, selectors = {}) {
  const allowed = await isAllowedByRobots(pageUrl);
  if (!allowed) {
    throw new Error("robots.txt disallows automated access to this career page");
  }

  const { data: html } = await axios.get(pageUrl, {
    timeout: 20000,
    headers: { "User-Agent": "Mozilla/5.0 (personal-job-agent; +for-personal-use)" },
  });
  const $ = cheerio.load(html);
  return extractJobs($, pageUrl, selectors);
}

export async function fetchGenericJobsDynamic(pageUrl, selectors = {}) {
  const allowed = await isAllowedByRobots(pageUrl);
  if (!allowed) {
    throw new Error("robots.txt disallows automated access to this career page");
  }

  // Lazy import so Playwright isn't required unless actually used.
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      userAgent: "Mozilla/5.0 (personal-job-agent; +for-personal-use)",
    });
    await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 30000 });

    // Bail out politely if a CAPTCHA / login wall is detected.
    const bodyText = (await page.textContent("body")) || "";
    if (/captcha|verify you are human|sign in to continue/i.test(bodyText)) {
      throw new Error("Login/CAPTCHA wall detected - automation stopped, please check manually");
    }

    const html = await page.content();
    const $ = cheerio.load(html);
    return extractJobs($, pageUrl, selectors);
  } finally {
    await browser.close();
  }
}

function extractJobs($, pageUrl, selectors) {
  const jobs = extractStructuredJobs($, pageUrl);
  const itemSelector = selectors.item || [
    "a[href*='/job']",
    "a[href*='/career']",
    "a[href*='/position']",
    "li[class*='job']",
    "div[class*='job-card']",
    "div[class*='job-listing']",
    "[data-testid*='job']",
  ].join(",");

  $(itemSelector).each((_, el) => {
    const $el = $(el);
    const link = $el.is("a") ? $el : $el.find("a[href]").first();
    const href = link.attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;

    const title = cleanText(
      selectors.title ? $el.find(selectors.title).first().text() :
        $el.find("h1, h2, h3, h4, [class*='title'], [data-testid*='title']").first().text() ||
        link.text() || $el.text()
    );
    if (!title || isNavigationText(title)) return;

    const applicationUrl = new URL(href, pageUrl).toString();
    jobs.push({
      jobId: applicationUrl,
      title: title.slice(0, 200),
      location: cleanText(selectors.location ? $el.find(selectors.location).first().text() :
        $el.find("[class*='location'], [data-testid*='location'], [class*='place']").first().text()),
      description: cleanText($el.find("[class*='description'], [data-testid*='description']").first().text()),
      applicationUrl,
      postedDate: "",
      source: "generic",
    });
  });

  const seen = new Set();
  return jobs.filter((job) => {
    if (!job.applicationUrl || seen.has(job.applicationUrl)) return false;
    seen.add(job.applicationUrl);
    return true;
  });
}

function extractStructuredJobs($, pageUrl) {
  const jobs = [];
  $("script[type='application/ld+json']").each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      const entries = Array.isArray(parsed) ? parsed : [parsed, ...(parsed?.itemListElement || [])];
      for (const entry of entries) {
        const posting = entry?.["@type"] === "JobPosting" ? entry : entry?.item;
        if (!posting?.title) continue;
        const applicationUrl = posting.url || posting.sameAs;
        if (!applicationUrl) continue;
        jobs.push({
          jobId: String(posting.identifier?.value || applicationUrl),
          title: cleanText(posting.title).slice(0, 200),
          location: cleanText(formatLocation(posting.jobLocation)),
          description: cleanText(posting.description || ""),
          applicationUrl: new URL(applicationUrl, pageUrl).toString(),
          postedDate: posting.datePosted || posting.datePublished || "",
          source: "generic",
        });
      }
    } catch {
      // Ignore malformed JSON-LD and continue with the DOM extractor.
    }
  });
  return jobs;
}

function formatLocation(location) {
  const locations = Array.isArray(location) ? location : [location];
  return locations.map((item) => item?.address?.addressLocality || item?.name || "").filter(Boolean).join(", ");
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isNavigationText(title) {
  return /^(apply|learn more|view jobs|search jobs|careers|job openings?)$/i.test(title);
}
