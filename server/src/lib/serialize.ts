import type { Condition, Gender } from "../config/constants.js";

type DoctorLike = {
  _id: unknown;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: Date | string;
};

type PatientLike = {
  _id: unknown;
  fullName: string;
  email?: string;
  phone: string;
  age: number;
  gender: Gender;
  condition: Condition;
  notes?: string;
  visitDate: Date | string;
  createdAt: Date | string;
  doctor?: { _id: unknown; name: string; specialization: string; hospital: string } | null;
};

export function serializeDoctor(doc: DoctorLike, patientCount = 0) {
  return {
    id: String(doc._id),
    name: doc.name,
    specialization: doc.specialization,
    hospital: doc.hospital,
    phone: doc.phone,
    email: doc.email,
    patientCount,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export function serializePatient(doc: PatientLike) {
  const doctor =
    doc.doctor && doc.doctor.name
      ? {
          id: String(doc.doctor._id),
          name: doc.doctor.name,
          specialization: doc.doctor.specialization,
          hospital: doc.doctor.hospital,
        }
      : null;

  return {
    id: String(doc._id),
    fullName: doc.fullName,
    email: doc.email ?? "",
    phone: doc.phone,
    age: doc.age,
    gender: doc.gender,
    condition: doc.condition,
    notes: doc.notes ?? "",
    visitDate: new Date(doc.visitDate).toISOString().slice(0, 10),
    createdAt: new Date(doc.createdAt).toISOString(),
    doctor,
  };
}
