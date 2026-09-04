import mongoose from "mongoose";

const PreferenceSchema = new mongoose.Schema(
  {
    preferredRoles: [String],
    locations: [String],
    experienceRange: String, // e.g. "0-2 years"
    minSalary: String,
    requiredSkills: [String],
    excludeKeywords: [String],
    autoApplyEnabled: { type: Boolean, default: false },
    minMatchScoreForNotification: { type: Number, default: 60 },
  },
  { timestamps: true }
);

export default mongoose.model("Preference", PreferenceSchema);
