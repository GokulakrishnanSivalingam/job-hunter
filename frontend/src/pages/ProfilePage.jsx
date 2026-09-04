import React, { useEffect, useState } from "react";
import client from "../api/client.js";
import Loader from "../components/Loader.jsx";
import { useToast } from "../components/Toast.jsx";

const empty = {
  fullName: "",
  email: "",
  phone: "",
  currentLocation: "",
  preferredLocations: [],
  skills: [],
  preferredJobRoles: [],
  certifications: [],
  expectedSalary: "",
  noticePeriod: "",
  totalExperience: "",
  experience: [],
  projects: [],
  education: [],
};

function ListInput({ label, values, onChange, placeholder }) {
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
      <p className="text-xs text-ink/40 dark:text-paper/40 mt-1">Comma-separated</p>
    </div>
  );
}

export default function ProfilePage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client
      .get("/profile")
      .then((res) => res.data && setProfile({ ...empty, ...res.data }))
      .catch(() => showToast("Couldn't load profile", "error"))
      .finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await client.put("/profile", profile);
      showToast("Profile saved", "success");
    } catch {
      showToast("Couldn't save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" value={profile.fullName} onChange={set("fullName")} />
        <Field label="Email" value={profile.email} onChange={set("email")} />
        <Field label="Phone" value={profile.phone} onChange={set("phone")} />
        <Field label="Current location" value={profile.currentLocation} onChange={set("currentLocation")} />
        <Field label="Expected salary" value={profile.expectedSalary} onChange={set("expectedSalary")} />
        <Field label="Notice period" value={profile.noticePeriod} onChange={set("noticePeriod")} />
        <Field label="Total experience" value={profile.totalExperience} onChange={set("totalExperience")} />
      </div>

      <ListInput
        label="Preferred locations"
        values={profile.preferredLocations}
        onChange={(v) => setProfile((p) => ({ ...p, preferredLocations: v }))}
        placeholder="Chennai, Bangalore, Remote"
      />
      <ListInput
        label="Skills"
        values={profile.skills}
        onChange={(v) => setProfile((p) => ({ ...p, skills: v }))}
        placeholder="React, JavaScript, Node.js, MongoDB"
      />
      <ListInput
        label="Preferred job roles"
        values={profile.preferredJobRoles}
        onChange={(v) => setProfile((p) => ({ ...p, preferredJobRoles: v }))}
        placeholder="Full Stack Developer, MERN Developer"
      />
      <ListInput
        label="Certifications"
        values={profile.certifications}
        onChange={(v) => setProfile((p) => ({ ...p, certifications: v }))}
        placeholder="AWS Certified Developer"
      />

      <button
        onClick={save}
        disabled={saving}
        className="px-5 py-2.5 rounded-md bg-signal text-ink font-medium text-sm hover:bg-signal-dark transition-colors disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Profile"}
      </button>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      <input
        value={value || ""}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-md border border-paper-line dark:border-ink-line bg-transparent text-sm outline-none focus:border-signal"
      />
    </div>
  );
}
