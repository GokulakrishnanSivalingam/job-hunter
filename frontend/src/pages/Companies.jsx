import React, { useEffect, useState } from "react";
import client from "../api/client.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useToast } from "../components/Toast.jsx";

function timeAgo(dateStr) {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} day(s) ago`;
}

export default function Companies() {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [checkingId, setCheckingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await client.get("/companies");
      setCompanies(res.data);
    } catch {
      showToast("Couldn't load companies", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addCompany = async (e) => {
    e.preventDefault();
    if (!name || !url) return;
    try {
      const company = await client.post("/companies", { name, careerPageUrl: url });
      setName("");
      setUrl("");
      try {
        const result = await client.post(`/companies/${company.data._id}/check-now`);
        showToast(`Company added: ${result.data.newJobs} job(s) found`, "success");
      } catch (err) {
        showToast(err.response?.data?.error || "Company added, but fetching failed", "error");
      }
      load();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't add company", "error");
    }
  };

  const toggleCompany = async (id) => {
    await client.patch(`/companies/${id}/toggle`);
    load();
  };

  const deleteCompany = async (id) => {
    if (!confirm("Remove this company and its saved jobs?")) return;
    await client.delete(`/companies/${id}`);
    load();
  };

  const checkNow = async (id) => {
    setCheckingId(id);
    try {
      const res = await client.post(`/companies/${id}/check-now`);
      showToast(`${res.data.newJobs} new job(s) found`, "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.error || "Check failed", "error");
    } finally {
      setCheckingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={addCompany}
        className="border border-paper-line dark:border-ink-line rounded-lg p-5 bg-paper-soft dark:bg-ink-soft
        flex flex-col sm:flex-row gap-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Company name (e.g. Zoho)"
          className="flex-1 px-3 py-2 rounded-md border border-paper-line dark:border-ink-line bg-transparent text-sm outline-none focus:border-signal"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Career page URL (Greenhouse/Lever/other)"
          className="flex-[2] px-3 py-2 rounded-md border border-paper-line dark:border-ink-line bg-transparent text-sm outline-none focus:border-signal"
        />
        <button className="px-4 py-2 rounded-md bg-signal text-ink font-medium text-sm hover:bg-signal-dark transition-colors">
          Add Company
        </button>
      </form>

      {loading ? (
        <Loader />
      ) : companies.length === 0 ? (
        <EmptyState
          title="No companies yet"
          message="Add a company's career page above — Greenhouse and Lever links connect automatically."
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {companies.map((c) => (
            <div
              key={c._id}
              className="border border-paper-line dark:border-ink-line rounded-lg p-5 bg-paper-soft dark:bg-ink-soft space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-semibold text-base">{c.name}</h3>
                  <p className="text-xs text-ink/50 dark:text-paper/50 uppercase tracking-wide mt-0.5">
                    {c.connectorType}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    c.enabled
                      ? "bg-good/15 text-good"
                      : "bg-ink/10 dark:bg-paper/10 text-ink/50 dark:text-paper/50"
                  }`}
                >
                  {c.enabled ? "Active" : "Disabled"}
                </span>
              </div>

              <div className="text-sm text-ink/70 dark:text-paper/70 space-y-1">
                <p>Last checked: {timeAgo(c.lastCheckedAt)}</p>
                <p>Jobs found: {c.jobsFound || 0}</p>
                {c.lastCheckStatus === "error" && (
                  <p className="text-bad text-xs">⚠ {c.lastCheckError}</p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => checkNow(c._id)}
                  disabled={checkingId === c._id}
                  className="flex-1 text-xs font-medium px-3 py-2 rounded-md border border-paper-line dark:border-ink-line
                  hover:border-signal transition-colors disabled:opacity-50"
                >
                  {checkingId === c._id ? "Checking…" : "Check Now"}
                </button>
                <button
                  onClick={() => toggleCompany(c._id)}
                  className="flex-1 text-xs font-medium px-3 py-2 rounded-md border border-paper-line dark:border-ink-line hover:border-signal transition-colors"
                >
                  {c.enabled ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => deleteCompany(c._id)}
                  className="text-xs font-medium px-3 py-2 rounded-md border border-bad/30 text-bad hover:bg-bad/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
