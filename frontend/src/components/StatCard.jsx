import React from "react";

export default function StatCard({ label, value, accent }) {
  return (
    <div className="border border-paper-line dark:border-ink-line rounded-lg px-5 py-4 bg-paper-soft dark:bg-ink-soft">
      <p className="text-xs uppercase tracking-wide text-ink/50 dark:text-paper/50">{label}</p>
      <p
        className={`font-display font-semibold text-3xl mt-1 tabular ${
          accent ? "text-signal" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
