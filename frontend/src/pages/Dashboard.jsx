import React, { useEffect, useState } from "react";
import client from "../api/client.js";
import StatCard from "../components/StatCard.jsx";
import JobCard from "../components/JobCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loader from "../components/Loader.jsx";
import { useToast } from "../components/Toast.jsx";

export default function Dashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, matchesRes] = await Promise.all([
        client.get("/dashboard/stats"),
        client.get("/dashboard/new-matches"),
      ]);
      setStats(statsRes.data);
      setMatches(matchesRes.data);
    } catch (err) {
      showToast("Couldn't load dashboard data. Is the backend running?", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const checkAll = async () => {
    setChecking(true);
    try {
      const res = await client.post("/dashboard/check-all");
      const totalNew = res.data.results.reduce((s, r) => s + (r.newJobs || 0), 0);
      showToast(`Check complete — ${totalNew} new job(s) found`, "success");
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || "Check failed", "error");
    } finally {
      setChecking(false);
    }
  };

  const prepareApplication = async (job) => {
    try {
      await client.post(`/applications/prepare/${job._id}`);
      showToast("Application prepared — see Applications tab", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't prepare application", "error");
    }
  };

  if (loading) return <Loader label="Loading your dashboard…" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink/60 dark:text-paper/60 text-sm max-w-md">
          Your companies, your criteria, checked automatically. Here's what's new.
        </p>
        <button
          onClick={checkAll}
          disabled={checking}
          className="px-4 py-2 rounded-md bg-signal text-ink font-medium text-sm hover:bg-signal-dark
          transition-colors disabled:opacity-50"
        >
          {checking ? "Checking…" : "Check All Companies Now"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Monitoring" value={stats.companiesMonitoring} />
        <StatCard label="Total Jobs" value={stats.totalJobs} />
        <StatCard label="New Today" value={stats.newJobsToday} accent />
        <StatCard label="Strong Matches" value={stats.strongMatches} accent />
        <StatCard label="Applications" value={stats.applications} />
        <StatCard label="Interviews" value={stats.interviews} />
      </div>

      <section>
        <h2 className="font-display font-semibold text-lg mb-3">🔥 New Matches</h2>
        {matches.length === 0 ? (
          <EmptyState
            title="No new matches yet"
            message="Add companies to monitor and run a check — new roles that fit your profile will show up here."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onView={(j) => window.open(j.applicationUrl, "_blank")}
                onPrepare={prepareApplication}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
