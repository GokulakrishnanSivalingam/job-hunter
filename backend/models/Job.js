import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    companyName: String,
    title: String,
    jobId: String, // external id from source
    location: String,
    description: String,
    skills: [String],
    experience: String,
    salary: String,
    postedDate: String,
    applicationUrl: String,
    source: String, // greenhouse | lever | generic | external_api
    dedupeHash: { type: String, index: true, unique: true },

    matchScore: { type: Number, default: 0 },
    matchingSkills: [String],
    missingSkills: [String],

    isNew: { type: Boolean, default: true },
    seenAt: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: [
        "New",
        "Interested",
        "Ready to Apply",
        "Applied",
        "Assessment",
        "Interview",
        "Offer",
        "Rejected",
        "Ignored",
      ],
      default: "New",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", JobSchema);
