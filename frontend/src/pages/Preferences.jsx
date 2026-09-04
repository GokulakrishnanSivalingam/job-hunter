import React, { useEffect, useState } from "react";
import client from "../api/client.js";
import Loader from "../components/Loader.jsx";
import { useToast } from "../components/Toast.jsx";

const empty = {
  preferredRoles: [],
  locations: [],
  experienceRange: "",
  minSalary: "",
  requiredSkills: [],
  excludeKeywords: [],
  autoApplyEnabled: false,
  minMatchScoreForNotification: 60,
};

function ListField({ label, values, onChange, placeholder }) {
  const [text, setText] = useState((values || []).join(", "));
  return (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean));
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md border border-paper-line dark:border-ink-line bg-transparent text-sm outline-none focus:border-signal"
      />
    </div>
  );
}

export default function Preferences() {
  const { showToast } = useToast();
  const [pref, setPref] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client
      .get("/preferences")
      .then((res) => res.data && setPref({ ...empty, ...res.data }))
      .catch(() => showToast("Couldn't load preferences", "error"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await client.put("/preferences", pref);
      showToast("Preferences saved", "success");
    } catch {
      showToast("Couldn't save preferences", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl space-y-6">
      <ListField
        label="Preferred roles"
        values={pref.preferredRoles}
        onChange={(v) => setPref((p) => ({ ...p, preferredRoles: v }))}
        placeholder="Full Stack Developer, MERN Developer, React Developer"
      />
      <ListField
        label="Locations"
        values={pref.locations}
        onChange={(v) => setPref((p) => ({ ...p, locations: v }))}
        placeholder="Chennai, Bangalore, Remote, India"
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Experience range</label>
          <input
            value={pref.experienceRange}
            onChange={(e) => setPref((p) => ({ ...p, experienceRange: e.target.value }))}
            placeholder="0-2 years"
            className="w-full px-3 py-2 rounded-md border border-paper-line dark:border-ink-line bg-transparent text-sm outline-none focus:border-signal"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Minimum salary</label>
          <input
            value={pref.minSalary}
            onChange={(e) => setPref((p) => ({ ...p, minSalary: e.target.value }))}
            placeholder="₹5 LPA"
            className="w-full px-3 py-2 rounded-md border border-paper-line dark:border-ink-line bg-transparent text-sm outline-none focus:border-signal"
          />
        </div>
      </div>
      <ListField
        label="Required skills"
        values={pref.requiredSkills}
        onChange={(v) => setPref((p) => ({ ...p, requiredSkills: v }))}
        placeholder="React, JavaScript, Node.js, MongoDB, Express"
      />
      <ListField
        label="Exclude keywords"
        values={pref.excludeKeywords}
        onChange={(v) => setPref((p) => ({ ...p, excludeKeywords: v }))}
        placeholder="Senior, Lead, Manager, Director, 5+ years"
      />

      <div>
        <label className="text-sm font-medium block mb-1">
          Notify me for matches above: {pref.minMatchScoreForNotification}%
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={pref.minMatchScoreForNotification}
          onChange={(e) =>
            setPref((p) => ({ ...p, minMatchScoreForNotification: Number(e.target.value) }))
          }
          className="w-full accent-signal"
        />
      </div>

      <label className="flex items-center gap-3 border border-paper-line dark:border-ink-line rounded-md p-4">
        <input
          type="checkbox"
          checked={pref.autoApplyEnabled}
          onChange={(e) => setPref((p) => ({ ...p, autoApplyEnabled: e.target.checked }))}
          className="w-4 h-4 accent-signal"
        />
        <div>
          <p className="text-sm font-medium">Enable Automatic Apply</p>
          <p className="text-xs text-ink/60 dark:text-paper/60">
            Only for flows without login/CAPTCHA/MFA. Automation stops and hands control back to you
            the moment any of those appear.
          </p>
        </div>
      </label>

      <button
        onClick={save}
        disabled={saving}
        className="px-5 py-2.5 rounded-md bg-signal text-ink font-medium text-sm hover:bg-signal-dark transition-colors disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Preferences"}
      </button>
    </div>
  );
}
