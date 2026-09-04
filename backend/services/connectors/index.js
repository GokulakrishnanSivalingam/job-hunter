/**
 * Connector registry - the "Detect / Select Source" step.
 * Add new connectors here to extend the system to new career platforms.
 */
import { fetchGreenhouseJobs } from "./greenhouse.js";
import { fetchLeverJobs } from "./lever.js";
import { fetchGenericJobsStatic, fetchGenericJobsDynamic } from "./generic.js";
import { fetchExternalApiJobs } from "./externalJobApi.js";

export async function fetchJobsForCompany(company) {
  switch (company.connectorType) {
    case "greenhouse":
      if (!company.boardToken) throw new Error("Greenhouse connector requires a boardToken");
      return fetchGreenhouseJobs(company.boardToken);

    case "lever":
      if (!company.boardToken) throw new Error("Lever connector requires a boardToken");
      return fetchLeverJobs(company.boardToken);

    case "external_api":
      return fetchExternalApiJobs(company);

    case "generic":
    default:
      // Try static (Cheerio) first - cheaper and faster.
      try {
        const jobs = await fetchGenericJobsStatic(company.careerPageUrl, company.selectors || {});
        if (jobs.length > 0) return jobs;
      } catch (err) {
        // fall through to dynamic only if static didn't hard-fail on robots/captcha
        if (/robots\.txt|CAPTCHA|login/i.test(err.message)) throw err;
      }
      // Fall back to Playwright for JS-rendered pages.
      return fetchGenericJobsDynamic(company.careerPageUrl, company.selectors || {});
  }
}

/** Try to auto-detect a connector type from a career page URL. */
export function detectConnectorType(url) {
  if (/boards\.greenhouse\.io/i.test(url)) return "greenhouse";
  if (/jobs\.lever\.co/i.test(url)) return "lever";
  return "generic";
}

export function extractBoardToken(url, connectorType) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    if (connectorType === "greenhouse" || connectorType === "lever") {
      return parts[0] || "";
    }
  } catch {
    /* ignore */
  }
  return "";
}
