import React from "react";

export default function EmptyState({ title, message, action }) {
  return (
    <div className="text-center py-16 border border-dashed border-paper-line dark:border-ink-line rounded-lg">
      <p className="font-display font-semibold text-lg">{title}</p>
      <p className="text-sm text-ink/60 dark:text-paper/60 mt-1 max-w-sm mx-auto">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
