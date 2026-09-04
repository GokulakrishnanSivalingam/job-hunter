import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    careerPageUrl: { type: String, required: true },
    connectorType: {
      type: String,
      enum: ["greenhouse", "lever", "generic", "external_api"],
      default: "generic",
    },
    // for greenhouse/lever, this is the org's board token/slug
    boardToken: String,
    enabled: { type: Boolean, default: true },
    lastCheckedAt: Date,
    lastCheckStatus: {
      type: String,
      enum: ["idle", "success", "error", "checking"],
      default: "idle",
    },
    lastCheckError: String,
    jobsFound: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Company", CompanySchema);
