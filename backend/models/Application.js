import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    company: String,
    jobTitle: String,
    jobUrl: String,
    matchScore: Number,
    resumeUsed: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
    coverLetter: String,
    suggestedAnswers: [
      {
        question: String,
        answer: String,
      },
    ],
    applyMode: { type: String, enum: ["assisted", "automatic"], default: "assisted" },
    appliedDate: Date,
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
      ],
      default: "New",
    },
    notes: String,
    automationLog: [
      {
        step: String,
        result: String, // success | stopped | error
        message: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Application", ApplicationSchema);
