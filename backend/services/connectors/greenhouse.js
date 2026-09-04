/**
 * Greenhouse connector
 * Uses Greenhouse's public job-board JSON API, which is openly published
 * by companies for this exact purpose (no auth, no scraping, no ToS issues).
 * Docs: https://developers.greenhouse.io/job-board.html
 *
 * boardToken = the company's slug on Greenhouse, e.g. for
 * https://boards.greenhouse.io/zoho -> boardToken = "zoho"
 */
import axios from "axios";

export async function fetchGreenhouseJobs(boardToken) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;
  const { data } = await axios.get(url, { timeout: 15000 });

  return (data.jobs || []).map((j) => ({
    jobId: String(j.id),
    title: j.title,
    location: j.location?.name || "",
    description: stripHtml(j.content || ""),
    applicationUrl: j.absolute_url,
    postedDate: j.updated_at || j.created_at || "",
    source: "greenhouse",
    raw: j,
  }));
}

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
