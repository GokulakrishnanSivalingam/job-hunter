import React, { useEffect, useState } from "react";
import client from "../api/client.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import MatchBadge from "../components/MatchBadge.jsx";
import { useToast } from "../components/Toast.jsx";

const STATUSES = ["New", "Interested", "Ready to Apply", "Applied", "Assessment", "Interview", "Offer", "Rejected"];

export default function Applications() {
  const { showToast } = useToast();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await client.get("/applications");
      setApps(res.data);
    } catch {
      showToast("Couldn't load applications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await client.patch(`/applications/${id}/status`, { status });
    load();
  };

  if (loading) return <Loader />;
  if (apps.length === 0) {
    return (
      <EmptyState
        title="No applications yet"
        message="Prepare an application from the Jobs tab and it will show up here for tracking."
      />
    );
  }

  return (
    <div className="space-y-4">
      {apps.map((a) => (
        <div
          key={a._id}
          className="border border-paper-line dark:border-ink-line rounded-lg p-5 bg-paper-soft dark:bg-ink-soft"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display font-semibold text-base">{a.jobTitle}</h3>
              <p className="text-sm text-ink/60 dark:text-paper/60">{a.company}</p>
            </div>
            <div className="flex items-center gap-3">
              {a.matchScore != null && <MatchBadge score={a.matchScore} />}
              <select
                value={a.status}
                onChange={(e) => updateStatus(a._id, e.target.value)}
                className="text-xs px-2 py-1.5 rounded-md border border-paper-line dark:border-ink-line bg-transparent"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-3 text-xs">
            {a.jobUrl && (
              <a
                href={a.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="text-signal-dark dark:text-signal underline underline-offset-2"
              >
                Open application page
              </a>
            )}
            <button
              onClick={() => setExpanded(expanded === a._id ? null : a._id)}
              className="text-ink/60 dark:text-paper/60 underline underline-offset-2"
            >
              {expanded === a._id ? "Hide details" : "View cover letter & notes"}
            </button>
          </div>

          {expanded === a._id && (
            <div className="mt-4 space-y-3 text-sm border-t border-paper-line dark:border-ink-line pt-4">
              {a.coverLetter ? (
                <div>
                  <p className="font-medium mb-1">Cover letter (edit before sending)</p>
                  <textarea
                    defaultValue={a.coverLetter}
                    rows={6}
                    className="w-full px-3 py-2 rounded-md border border-paper-line dark:border-ink-line bg-transparent text-sm"
                  />
                </div>
              ) : (
                <p className="text-ink/50 dark:text-paper/50 text-xs">
                  No AI cover letter generated (LLM not configured, or generation skipped).
                </p>
              )}
              {a.suggestedAnswers?.map((qa, i) => (
                <div key={i}>
                  <p className="font-medium mb-1">{qa.question}</p>
                  <p className="text-ink/70 dark:text-paper/70 whitespace-pre-line">{qa.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
