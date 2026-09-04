import React, { useEffect, useRef, useState } from "react";
import client from "../api/client.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useToast } from "../components/Toast.jsx";

export default function ResumePage() {
  const { showToast } = useToast();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const res = await client.get("/resumes");
      setResumes(res.data);
    } catch {
      showToast("Couldn't load resumes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (e) => {
    e.preventDefault();
    const file = fileRef.current.files[0];
    if (!file) return showToast("Choose a file first", "error");

    const form = new FormData();
    form.append("resume", file);
    form.append("label", label || file.name);
    form.append("isDefault", resumes.length === 0 ? "true" : "false");

    try {
      await client.post("/resumes", form, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("Resume uploaded", "success");
      setLabel("");
      fileRef.current.value = "";
      load();
    } catch (err) {
      showToast(err.response?.data?.error || "Upload failed", "error");
    }
  };

  const setDefault = async (id) => {
    const form = new FormData();
    form.append("isDefault", "true");
    await client.put(`/resumes/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this resume?")) return;
    await client.delete(`/resumes/${id}`);
    load();
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={upload}
        className="border border-paper-line dark:border-ink-line rounded-lg p-5 bg-paper-soft dark:bg-ink-soft
        flex flex-col sm:flex-row gap-3"
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Full Stack Resume)"
          className="flex-1 px-3 py-2 rounded-md border border-paper-line dark:border-ink-line bg-transparent text-sm outline-none focus:border-signal"
        />
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="flex-1 text-sm file:mr-3 file:px-3 file:py-2 file:rounded-md file:border-0 file:bg-signal file:text-ink file:font-medium file:cursor-pointer"
        />
        <button className="px-4 py-2 rounded-md bg-signal text-ink font-medium text-sm hover:bg-signal-dark transition-colors">
          Upload
        </button>
      </form>

      {loading ? (
        <Loader />
      ) : resumes.length === 0 ? (
        <EmptyState title="No resumes yet" message="Upload your first resume above." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {resumes.map((r) => (
            <div
              key={r._id}
              className="border border-paper-line dark:border-ink-line rounded-lg p-5 bg-paper-soft dark:bg-ink-soft
              flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium flex items-center gap-2">
                  {r.isDefault && <span className="text-signal">✓</span>}
                  {r.label}
                </p>
                <p className="text-xs text-ink/50 dark:text-paper/50">{r.originalName}</p>
              </div>
              <div className="flex gap-2 text-xs">
                <a
                  href={`/api/resumes/${r._id}/download`}
                  className="px-3 py-1.5 rounded-md border border-paper-line dark:border-ink-line hover:border-signal"
                >
                  Download
                </a>
                {!r.isDefault && (
                  <button
                    onClick={() => setDefault(r._id)}
                    className="px-3 py-1.5 rounded-md border border-paper-line dark:border-ink-line hover:border-signal"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => remove(r._id)}
                  className="px-3 py-1.5 rounded-md border border-bad/30 text-bad hover:bg-bad/10"
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
