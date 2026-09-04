import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: "◧" },
  { to: "/jobs", label: "Jobs", icon: "◈" },
  { to: "/companies", label: "Companies", icon: "▤" },
  { to: "/applications", label: "Applications", icon: "▥" },
  { to: "/resume", label: "My Resume", icon: "▦" },
  { to: "/profile", label: "My Profile", icon: "◐" },
  { to: "/preferences", label: "Preferences", icon: "▧" },
  { to: "/settings", label: "Settings", icon: "▩" },
];

export default function Sidebar({ open, onClose }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 shrink-0 border-r border-paper-line dark:border-ink-line
        bg-paper-soft dark:bg-ink-soft flex flex-col transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="px-6 py-6 border-b border-paper-line dark:border-ink-line">
          <p className="font-display font-semibold text-lg tracking-tight">Job Agent</p>
          <p className="text-xs text-ink/50 dark:text-paper/50 mt-0.5">Personal search console</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-signal/15 text-signal-dark dark:text-signal"
                    : "text-ink/70 dark:text-paper/70 hover:bg-paper dark:hover:bg-ink"
                }`
              }
            >
              <span className="w-4 text-center opacity-70">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-paper-line dark:border-ink-line">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm
            border border-paper-line dark:border-ink-line hover:border-signal transition-colors"
          >
            <span>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
            <span className="text-signal">{theme === "dark" ? "●" : "○"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
