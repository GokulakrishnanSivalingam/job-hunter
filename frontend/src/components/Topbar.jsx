import React from "react";

export default function Topbar({ title, onMenuClick, right }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 md:px-8 py-4
      border-b border-paper-line dark:border-ink-line bg-paper/90 dark:bg-ink/90 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-md
          border border-paper-line dark:border-ink-line"
          aria-label="Open menu"
        >
          ☰
        </button>
        <h1 className="font-display font-semibold text-xl md:text-2xl tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">{right}</div>
    </header>
  );
}
