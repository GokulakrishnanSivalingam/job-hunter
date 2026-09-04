import React from "react";
import MatchBadge from "./MatchBadge.jsx";

export default function JobCard({ job, onView, onPrepare }) {
  return (
    <div className="border border-paper-line dark:border-ink-line rounded-lg p-5 bg-paper-soft dark:bg-ink-soft
      hover:border-signal/60 transition-colors flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          {job.isNew && (
            <span className="text-[11px] font-semibold text-signal-dark dark:text-signal mb-1 inline-block">
              🆕 NEW
            </span>
          )}
          <h3 className="font-display font-semibold text-base leading-snug">{job.title}</h3>
          <p className="text-sm text-ink/60 dark:text-paper/60">
            {job.companyName} · {job.location || "Location N/A"}
          </p>
        </div>
        <MatchBadge score={job.matchScore} />
      </div>

      {job.matchingSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.matchingSkills.slice(0, 6).map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded border border-good/30 text-good bg-good/10"
            >
              {s} ✓
            </span>
          ))}
          {job.missingSkills?.slice(0, 2).map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded border border-bad/30 text-bad bg-bad/10"
            >
              {s} ⚠
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onView?.(job)}
          className="flex-1 text-sm font-medium px-3 py-2 rounded-md border border-paper-line dark:border-ink-line
          hover:border-signal transition-colors"
        >
          View Job
        </button>
        <button
          onClick={() => onPrepare?.(job)}
          className="flex-1 text-sm font-medium px-3 py-2 rounded-md bg-signal text-ink hover:bg-signal-dark transition-colors"
        >
          Prepare Application
        </button>
      </div>
    </div>
  );
}
