import mongoose, { Schema } from "mongoose";

const doctorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    hospital: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true },
);

doctorSchema.index({ createdAt: -1 });
doctorSchema.index({ name: 1 });
doctorSchema.index({ specialization: 1, createdAt: -1 });
doctorSchema.index({ hospital: 1, createdAt: -1 });

export const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
