import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["new_match", "new_job", "system", "application"], default: "new_job" },
    title: String,
    message: String,
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
