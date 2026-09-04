/**
 * Thin wrapper around an LLM API for:
 *  - match explanations (matcher.js)
 *  - cover letter generation
 *  - suggested answers to standard application questions
 *
 * Strict rule enforced in every prompt: never invent skills, experience,
 * education, or achievements that aren't in the stored profile/resume.
 */
import axios from "axios";

export async function callLLM(prompt, { maxTokens = 1000 } = {}) {
  const apiKey = process.env.LLM_API_KEY;
  const apiUrl = process.env.LLM_API_URL || "https://api.anthropic.com/v1/messages";
  const model = process.env.LLM_MODEL || "claude-sonnet-4-6";

  if (!apiKey) {
    throw new Error("LLM_API_KEY not configured in backend/.env");
  }

  const { data } = await axios.post(
    apiUrl,
    {
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      timeout: 30000,
    }
  );

  const textBlock = (data.content || []).find((b) => b.type === "text");
  return textBlock?.text || "";
}

export async function generateCoverLetter({ profile, job }) {
  const prompt = `Write a concise, professional, tailored cover letter (max 250 words).
Use ONLY the facts below. Do NOT invent any skill, project, employer, or
achievement that isn't explicitly listed. If something relevant is missing,
simply don't mention it - never fabricate.

CANDIDATE NAME: ${profile.fullName}
CANDIDATE SKILLS: ${(profile.skills || []).join(", ")}
CANDIDATE EXPERIENCE: ${(profile.experience || [])
    .map((e) => `${e.title} at ${e.company} (${e.duration})`)
    .join("; ")}
CANDIDATE PROJECTS: ${(profile.projects || []).map((p) => p.name).join(", ")}

JOB TITLE: ${job.title}
COMPANY: ${job.companyName}
JOB DESCRIPTION: ${(job.description || "").slice(0, 2000)}

Write only the letter body, no subject line, no placeholders like [Company Name] unmatched to real data.`;

  return callLLM(prompt, { maxTokens: 500 });
}

export async function generateSuggestedAnswers({ profile, job }) {
  const prompt = `Based ONLY on the candidate facts below, draft short suggested answers
(2-3 sentences each) to these standard application questions. Do not invent
facts not listed. If information is insufficient for a question, say
"Not enough profile information - please fill this in manually" instead of guessing.

Questions:
1. Why are you interested in this role?
2. What relevant experience do you have?
3. What is your notice period?
4. What are your salary expectations?

CANDIDATE: ${JSON.stringify({
    skills: profile.skills,
    experience: profile.experience,
    projects: profile.projects,
    noticePeriod: profile.noticePeriod,
    expectedSalary: profile.expectedSalary,
  })}

JOB TITLE: ${job.title}
JOB DESCRIPTION: ${(job.description || "").slice(0, 1500)}

Return as a numbered list matching the question numbers.`;

  return callLLM(prompt, { maxTokens: 700 });
}
