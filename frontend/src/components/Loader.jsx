import React from "react";

export default function Loader({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink/60 dark:text-paper/60 py-10 justify-center">
      <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
      {label}
    </div>
  );
}
