import mongoose from "mongoose";
import { ConflictError, NotFoundError } from "../errors/app-error.js";
import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";
import { clinicDayRange, escapeRegex, pagesFor, parsePagination, searchTerm } from "../lib/query.js";
import { serializeDoctor } from "../lib/serialize.js";
import type { DoctorInput } from "../validators/schemas.js";

function doctorId(value: string) {
  if (!mongoose.isValidObjectId(value)) throw new NotFoundError("Doctor not found.");
  return value;
}

export async function listDoctors(searchParams: URLSearchParams) {
  const { page, limit, skip } = parsePagination(searchParams);
  const q = searchTerm(searchParams);
  const filter: Record<string, unknown> = {};

  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { specialization: rx }, { hospital: rx }, { email: rx }, { phone: rx }];
  }
  const specialization = searchParams.get("specialization")?.trim();
  const hospital = searchParams.get("hospital")?.trim();
  if (specialization) filter.specialization = specialization;
  if (hospital) filter.hospital = hospital;
  const created = clinicDayRange(searchParams.get("from"), searchParams.get("to"));
  if (created) filter.createdAt = created;

  const sort: Record<string, 1 | -1> = searchParams.get("sort") === "name" ? { name: 1 } : { createdAt: -1 };
  const [doctors, total] = await Promise.all([
    Doctor.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Doctor.countDocuments(filter),
  ]);
  const ids = doctors.map((doctor) => doctor._id);
  const counts = ids.length
    ? await Patient.aggregate<{ _id: unknown; count: number }>([
        { $match: { doctor: { $in: ids } } },
        { $group: { _id: "$doctor", count: { $sum: 1 } } },
      ])
    : [];
  const countMap = new Map(counts.map((row) => [String(row._id), row.count]));

  return {
    data: doctors.map((doctor) => serializeDoctor(doctor, countMap.get(String(doctor._id)) ?? 0)),
    page,
    limit,
    total,
    pages: pagesFor(total, limit),
  };
}

export async function createDoctor(input: DoctorInput) {
  const doctor = await Doctor.create(input);
  return serializeDoctor(doctor.toObject(), 0);
}

export async function getDoctor(id: string) {
  const doctor = await Doctor.findById(doctorId(id)).lean();
  if (!doctor) throw new NotFoundError("Doctor not found.");
  const patientCount = await Patient.countDocuments({ doctor: doctor._id });
  return serializeDoctor(doctor, patientCount);
}

export async function updateDoctor(id: string, input: DoctorInput) {
  const doctor = await Doctor.findByIdAndUpdate(doctorId(id), input, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
  if (!doctor) throw new NotFoundError("Doctor not found.");
  const patientCount = await Patient.countDocuments({ doctor: doctor._id });
  return serializeDoctor(doctor, patientCount);
}

export async function deleteDoctor(id: string) {
  const removed = await Doctor.findOneAndDelete({ _id: doctorId(id) });
  if (!removed) throw new NotFoundError("Doctor not found.");
  const snapshot = removed.toObject();
  const patientCount = await Patient.countDocuments({ doctor: snapshot._id });
  if (patientCount > 0) {
    await Doctor.collection.insertOne(snapshot);
    throw new ConflictError("Reassign or remove this doctor's patients before deleting the doctor.");
  }
  return { id: String(snapshot._id), deleted: true };
}
