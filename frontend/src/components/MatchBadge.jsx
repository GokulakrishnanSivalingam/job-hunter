import React from "react";

export default function MatchBadge({ score }) {
  const color =
    score >= 80
      ? "bg-good/15 text-good border-good/30"
      : score >= 50
      ? "bg-signal/15 text-signal-dark dark:text-signal border-signal/30"
      : "bg-bad/10 text-bad border-bad/30";

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold border tabular ${color}`}>
      {score}%
    </span>
  );
}
