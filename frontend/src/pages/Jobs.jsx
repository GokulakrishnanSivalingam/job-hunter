import React, { useEffect, useState } from "react";
import client from "../api/client.js";
import JobCard from "../components/JobCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loader from "../components/Loader.jsx";
import { useToast } from "../components/Toast.jsx";

const STATUS_FILTERS = ["All", "New", "Interested", "Ready to Apply", "Applied", "Interview", "Rejected"];

export default function Jobs() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [minMatch, setMinMatch] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status !== "All") params.status = status;
      if (search) params.search = search;
      if (minMatch > 0) params.minMatch = minMatch;
      const res = await client.get("/jobs", { params });
      setJobs(res.data);
    } catch {
      showToast("Couldn't load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [status, search, minMatch]);

  const prepareApplication = async (job) => {
    try {
      await client.post(`/applications/prepare/${job._id}`);
      showToast("Application prepared — see Applications tab", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't prepare application", "error");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or company…"
          className="flex-1 px-3 py-2 rounded-md border border-paper-line dark:border-ink-line
          bg-transparent text-sm focus:border-signal outline-none"
        />
        <select
          value={minMatch}
          onChange={(e) => setMinMatch(Number(e.target.value))}
          className="px-3 py-2 rounded-md border border-paper-line dark:border-ink-line bg-transparent text-sm"
        >
          <option value={0}>Any match</option>
          <option value={50}>50%+</option>
          <option value={70}>70%+</option>
          <option value={85}>85%+</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
            ${
              status === s
                ? "bg-signal text-ink border-signal"
                : "border-paper-line dark:border-ink-line text-ink/70 dark:text-paper/70 hover:border-signal"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          message="Try a different filter, or add more companies to monitor."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onView={(j) => window.open(j.applicationUrl, "_blank")}
              onPrepare={prepareApplication}
            />
          ))}
        </div>
      )}
    </div>
  );
}
