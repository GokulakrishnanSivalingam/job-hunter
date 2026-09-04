/**
 * Job Matching service.
 * Compares a job against the saved profile + preferences.
 * Rule-based baseline (deterministic, explainable) with an optional LLM
 * refinement pass. IMPORTANT: never invents skills/experience - it only
 * ever compares against what's actually stored in the profile.
 */
import Profile from "../models/Profile.js";
import Preference from "../models/Preference.js";
import { callLLM } from "./aiAssistant.js";

export async function scoreJobAgainstProfile(job) {
  const profile = await Profile.findOne();
  const preference = await Preference.findOne();

  const mySkills = new Set(
    (profile?.skills || []).map((s) => s.toLowerCase().trim())
  );
  const requiredSkills = new Set(
    (preference?.requiredSkills || []).map((s) => s.toLowerCase().trim())
  );
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase().trim());

  const relevantSkillPool = new Set([...jobSkills, ...requiredSkills]);

  const matchingSkills = [];
  const missingSkills = [];

  for (const skill of relevantSkillPool) {
    if (mySkills.has(skill)) matchingSkills.push(skill);
    else missingSkills.push(skill);
  }

  // Exclusion keywords (Senior, Lead, Manager, 5+ years, etc.)
  const excludeHit = (preference?.excludeKeywords || []).some((kw) =>
    (job.title + " " + job.description).toLowerCase().includes(kw.toLowerCase())
  );
  if (excludeHit) {
    return { matchScore: 0, matchingSkills: [], missingSkills: Array.from(relevantSkillPool) };
  }

  // Location check
  const preferredLocations = (preference?.locations || []).map((l) => l.toLowerCase());
  const locationOk =
    preferredLocations.length === 0 ||
    preferredLocations.some((loc) => job.location.toLowerCase().includes(loc)) ||
    job.location.toLowerCase().includes("remote");

  const skillScore =
    relevantSkillPool.size > 0 ? matchingSkills.length / relevantSkillPool.size : 0.5;

  let score = Math.round(skillScore * 85); // skills weigh most
  if (locationOk) score += 10;
  if ((preference?.preferredRoles || []).some((r) => job.title.toLowerCase().includes(r.toLowerCase()))) {
    score += 5;
  }
  score = Math.min(100, score);

  return {
    matchScore: score,
    matchingSkills: capitalize(matchingSkills),
    missingSkills: capitalize(missingSkills),
  };
}

function capitalize(arr) {
  return arr.map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase()));
}

/**
 * Optional: ask the LLM to sanity-check / explain a match using ONLY the
 * facts provided (profile + job). The prompt explicitly forbids inventing
 * skills or experience.
 */
export async function explainMatchWithLLM(job, profile) {
  const prompt = `You are assisting with job matching. Using ONLY the facts given below,
explain briefly why this job is or isn't a good match. Do NOT invent, assume,
or add any skill, certification, or experience that is not explicitly listed.

CANDIDATE SKILLS: ${(profile.skills || []).join(", ")}
CANDIDATE EXPERIENCE: ${(profile.experience || []).map((e) => e.title).join(", ")}

JOB TITLE: ${job.title}
JOB DESCRIPTION: ${(job.description || "").slice(0, 2000)}

Respond with 2-3 short sentences only.`;

  try {
    return await callLLM(prompt);
  } catch {
    return null; // LLM is optional - matching still works without it
  }
}
