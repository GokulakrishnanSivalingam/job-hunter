/**
 * Lever connector
 * Uses Lever's public postings API, openly published by companies.
 * Docs: https://github.com/lever/postings-api
 *
 * boardToken = the company's slug on Lever, e.g. for
 * https://jobs.lever.co/acme -> boardToken = "acme"
 */
import axios from "axios";

export async function fetchLeverJobs(boardToken) {
  const url = `https://api.lever.co/v0/postings/${boardToken}?mode=json`;
  const { data } = await axios.get(url, { timeout: 15000 });

  return (data || []).map((j) => ({
    jobId: j.id,
    title: j.text,
    location: j.categories?.location || "",
    description: stripHtml(j.descriptionPlain || j.description || ""),
    applicationUrl: j.applyUrl || j.hostedUrl,
    postedDate: j.createdAt ? new Date(j.createdAt).toISOString() : "",
    source: "lever",
    raw: j,
  }));
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
