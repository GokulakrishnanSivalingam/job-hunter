/**
 * Career Page Checker
 * Flow: Company List -> fetch via connector -> normalize -> dedupe ->
 *       compare with existing -> detect new jobs -> match -> save -> notify
 */
import crypto from "crypto";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import { fetchJobsForCompany } from "./connectors/index.js";
import { scoreJobAgainstProfile } from "./matcher.js";
import { notifyNewMatch } from "./notifier.js";

function normalize(rawJob, company) {
  return {
    company: company._id,
    companyName: company.name,
    title: (rawJob.title || "Untitled Role").trim(),
    jobId: rawJob.jobId || "",
    location: rawJob.location || "",
    description: rawJob.description || "",
    skills: extractSkillsFromText(rawJob.description || rawJob.title || ""),
    experience: "",
    salary: rawJob.salary || "",
    postedDate: rawJob.postedDate || "",
    applicationUrl: rawJob.applicationUrl || "",
    source: rawJob.source || company.connectorType,
  };
}

function dedupeHash(job) {
  const basis = job.jobId || job.applicationUrl || `${job.companyName}-${job.title}`;
  return crypto.createHash("sha256").update(basis).digest("hex");
}

const COMMON_SKILLS = [
  "react", "javascript", "typescript", "node.js", "node", "express", "mongodb",
  "sql", "python", "java", "spring", "aws", "docker", "kubernetes", "git",
  "html", "css", "tailwind", "next.js", "redux", "graphql", "rest api", "django",
  "flask", "c++", "c#", ".net", "angular", "vue",
];

function extractSkillsFromText(text) {
  const lower = text.toLowerCase();
  return COMMON_SKILLS.filter((s) => lower.includes(s)).map((s) =>
    s.replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export async function checkCompany(companyId) {
  const company = await Company.findById(companyId);
  if (!company) throw new Error("Company not found");

  company.lastCheckStatus = "checking";
  await company.save();

  try {
    const rawJobs = await fetchJobsForCompany(company);
    const normalized = rawJobs.map((j) => normalize(j, company));

    const newlyCreated = [];

    for (const job of normalized) {
      job.dedupeHash = dedupeHash(job);
      const exists = await Job.findOne({ dedupeHash: job.dedupeHash });
      if (exists) continue;

      const { matchScore, matchingSkills, missingSkills } = await scoreJobAgainstProfile(job);

      const created = await Job.create({
        ...job,
        matchScore,
        matchingSkills,
        missingSkills,
        isNew: true,
      });
      newlyCreated.push(created);
    }

    company.lastCheckedAt = new Date();
    company.lastCheckStatus = "success";
    company.lastCheckError = undefined;
    company.jobsFound = await Job.countDocuments({ company: company._id });
    await company.save();

    for (const job of newlyCreated) {
      await notifyNewMatch(job);
    }

    return { company: company.name, newJobs: newlyCreated.length, jobs: newlyCreated };
  } catch (err) {
    company.lastCheckStatus = "error";
    company.lastCheckError = err.message;
    company.lastCheckedAt = new Date();
    await company.save();
    throw err;
  }
}

export async function checkAllEnabledCompanies() {
  const companies = await Company.find({ enabled: true });
  const results = [];
  for (const c of companies) {
    try {
      const res = await checkCompany(c._id);
      results.push(res);
    } catch (err) {
      results.push({ company: c.name, error: err.message });
    }
  }
  return results;
}
