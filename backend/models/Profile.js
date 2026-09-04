import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    phone: String,
    currentLocation: String,
    preferredLocations: [String],
    education: [
      {
        degree: String,
        institution: String,
        year: String,
      },
    ],
    skills: [String],
    experience: [
      {
        title: String,
        company: String,
        duration: String,
        description: String,
      },
    ],
    projects: [
      {
        name: String,
        description: String,
        link: String,
      },
    ],
    certifications: [String],
    preferredJobRoles: [String],
    expectedSalary: String,
    noticePeriod: String,
    totalExperience: String,
  },
  { timestamps: true }
);

// Single-user app: always one profile document.
export default mongoose.model("Profile", ProfileSchema);
