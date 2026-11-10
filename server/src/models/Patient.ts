import mongoose, { Schema } from "mongoose";
import { CONDITIONS, GENDERS } from "../constants.js";

const patientSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 120 },
    gender: { type: String, required: true, enum: GENDERS },
    condition: { type: String, required: true, enum: CONDITIONS },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    notes: { type: String, default: "", trim: true, maxlength: 500 },
    visitDate: { type: Date, required: true },
  },
  { timestamps: true },
);

patientSchema.index({ doctor: 1, visitDate: -1 });
patientSchema.index({ condition: 1, visitDate: -1 });
patientSchema.index({ visitDate: -1 });
patientSchema.index({ createdAt: -1 });
patientSchema.index({ fullName: 1 });

export const Patient = mongoose.models.Patient || mongoose.model("Patient", patientSchema);
