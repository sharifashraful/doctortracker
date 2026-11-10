import { CONDITIONS } from "../constants.js";
import { BadRequestError, NotFoundError } from "../errors/app-error.js";
import { utcDayStart } from "../dates.js";
import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";
import { escapeRegex, pagesFor, parsePagination, searchTerm, utcDayRange } from "../query.js";
import { serializePatient } from "../serialize.js";
import type { PatientInput } from "../validators.js";

function patientId(value: string) {
  if (!/^[a-f\d]{24}$/i.test(value)) throw new NotFoundError("Patient not found.");
  return value;
}

function toPatient(input: PatientInput) {
  const visitDate = utcDayStart(input.visitDate);
  if (!visitDate) throw new BadRequestError("Choose a real visit date.", { visitDate: "Choose a real visit date" });
  return {
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    age: input.age,
    gender: input.gender,
    condition: input.condition,
    notes: input.notes,
    doctor: input.doctorId,
    visitDate,
  };
}

async function requireDoctor(doctorId: string) {
  const doctor = await Doctor.findById(doctorId).select("_id");
  if (!doctor) {
    throw new NotFoundError("Choose a doctor who is still on record.", { doctorId: "Doctor not found" });
  }
  return doctor;
}

export async function listPatients(searchParams: URLSearchParams) {
  const { page, limit, skip } = parsePagination(searchParams);
  const q = searchTerm(searchParams);
  const filter: Record<string, unknown> = {};

  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    const doctorMatches = await Doctor.find({ name: rx }).select("_id").lean();
    filter.$or = [
      { fullName: rx },
      { email: rx },
      { phone: rx },
      { condition: rx },
      ...(doctorMatches.length ? [{ doctor: { $in: doctorMatches.map((doctor) => doctor._id) } }] : []),
    ];
  }

  const condition = searchParams.get("condition")?.trim();
  if (condition && CONDITIONS.includes(condition as (typeof CONDITIONS)[number])) filter.condition = condition;
  const doctorId = searchParams.get("doctorId")?.trim();
  if (doctorId) {
    if (!/^[a-f\d]{24}$/i.test(doctorId)) throw new NotFoundError("Doctor not found.");
    filter.doctor = doctorId;
  }
  const visited = utcDayRange(searchParams.get("from"), searchParams.get("to"));
  if (visited) filter.visitDate = visited;

  const sort: Record<string, 1 | -1> =
    searchParams.get("sort") === "name" ? { fullName: 1 } : { visitDate: -1, createdAt: -1 };
  const [patients, total] = await Promise.all([
    Patient.find(filter).sort(sort).skip(skip).limit(limit).populate("doctor", "name specialization hospital").lean(),
    Patient.countDocuments(filter),
  ]);

  return {
    data: patients.map((patient) => serializePatient(patient)),
    page,
    limit,
    total,
    pages: pagesFor(total, limit),
  };
}

export async function createPatient(input: PatientInput) {
  await requireDoctor(input.doctorId);
  const patient = await Patient.create(toPatient(input));
  const populated = await patient.populate("doctor", "name specialization hospital");
  return serializePatient(populated.toObject());
}

export async function getPatient(id: string) {
  const patient = await Patient.findById(patientId(id)).populate("doctor", "name specialization hospital").lean();
  if (!patient) throw new NotFoundError("Patient not found.");
  return serializePatient(patient);
}

export async function updatePatient(id: string, input: PatientInput) {
  await requireDoctor(input.doctorId);
  const patient = await Patient.findByIdAndUpdate(patientId(id), toPatient(input), {
    returnDocument: "after",
    runValidators: true,
  })
    .populate("doctor", "name specialization hospital")
    .lean();
  if (!patient) throw new NotFoundError("Patient not found.");
  return serializePatient(patient);
}

export async function deletePatient(id: string) {
  const patient = await Patient.findByIdAndDelete(patientId(id)).lean();
  if (!patient) throw new NotFoundError("Patient not found.");
  return { id, deleted: true };
}
