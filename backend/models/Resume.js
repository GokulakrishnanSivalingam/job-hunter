import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "Full Stack Resume"
    fileName: String,
    originalName: String,
    filePath: String,
    mimeType: String,
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", ResumeSchema);
