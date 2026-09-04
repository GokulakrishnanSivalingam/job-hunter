/**
 * External Job API connector
 * -----------------------------------------------------------------------
 * NOTE ON LINKEDIN / NAUKRI:
 * Neither LinkedIn nor Naukri offer a public API for pulling job listings
 * for a personal tool like this, and both explicitly prohibit scraping /
 * automated access in their Terms of Service (anti-bot detection, login
 * walls, rate limiting, legal action against scrapers). Building a scraper
 * or unofficial API wrapper for them would violate their ToS and the
 * "never bypass anti-bot protections / access controls" rule from your
 * own spec, so this project does not include one.
 *
 * What this connector DOES support instead:
 * If you have legitimate access to a job data API - for example:
 *   - A licensed job-aggregator API you've signed up for and pay for
 *     (many exist on RapidAPI etc. with proper terms), or
 *   - LinkedIn's official Talent/Jobs partner APIs (requires being an
 *     approved LinkedIn partner - real companies apply for this), or
 *   - Naukri's official recruiter/portal API (also partner-gated)
 * ...you can plug the credentials into .env (EXTERNAL_JOB_API_URL /
 * EXTERNAL_JOB_API_KEY) and set a Company's connectorType to
 * "external_api". This function just does a generic authenticated GET
 * and maps the response into this app's standard job format - you'll
 * likely need to tweak the `mapResponse` function to match whatever
 * API you actually have access to.
 */
import axios from "axios";

export async function fetchExternalApiJobs(company) {
  const baseUrl = process.env.EXTERNAL_JOB_API_URL;
  const apiKey = process.env.EXTERNAL_JOB_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "No EXTERNAL_JOB_API_URL / EXTERNAL_JOB_API_KEY configured. " +
        "Add credentials for a job API you have legitimate access to in backend/.env"
    );
  }

  const { data } = await axios.get(baseUrl, {
    headers: { Authorization: `Bearer ${apiKey}` },
    params: { company: company.name, url: company.careerPageUrl },
    timeout: 20000,
  });

  return mapResponse(data);
}

// Adjust this mapper to match the shape of the API you actually connect.
function mapResponse(data) {
  const list = Array.isArray(data) ? data : data.jobs || data.results || [];
  return list.map((j) => ({
    jobId: String(j.id || j.jobId || j.url),
    title: j.title || j.jobTitle || "",
    location: j.location || "",
    description: j.description || "",
    applicationUrl: j.url || j.applyUrl || j.applicationUrl || "",
    postedDate: j.postedDate || j.datePosted || "",
    source: "external_api",
  }));
}
