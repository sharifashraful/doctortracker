import { CONDITIONS } from "../config/constants.js";
import { clinicDayStart, clinicTimeZone, clinicToday, shiftCalendarDate } from "../lib/dates.js";
import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";
import { serializePatient } from "../lib/serialize.js";

function lastDays(count: number, timeZone: string) {
  const today = clinicToday(timeZone);
  const days: string[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const day = shiftCalendarDate(today, -offset);
    if (day) days.push(day);
  }
  return days;
}

function labelFor(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

export async function getMeta() {
  const [specializations, hospitals, doctors] = await Promise.all([
    Doctor.distinct("specialization"),
    Doctor.distinct("hospital"),
    Doctor.find().select("name specialization hospital").sort({ name: 1 }).lean(),
  ]);
  return {
    specializations: specializations.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    hospitals: hospitals.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    doctors: doctors.map((doctor) => ({
      id: String(doctor._id),
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
    })),
  };
}

export async function getStats() {
  const zone = clinicTimeZone();
  const chartDays = lastDays(30, zone);
  const since = clinicDayStart(chartDays[0] ?? clinicToday(zone), zone) ?? new Date(0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [doctorCount, patientCount, critical, addedThisWeek, doctors, perDoctor, perCondition, timelineRows, recent] =
    await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Patient.countDocuments({ condition: "Critical" }),
      Patient.countDocuments({ createdAt: { $gte: weekAgo } }),
      Doctor.find().select("name").lean(),
      Patient.aggregate<{ _id: unknown; count: number }>([{ $group: { _id: "$doctor", count: { $sum: 1 } } }]),
      Patient.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$condition", count: { $sum: 1 } } }]),
      Patient.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: zone } },
            count: { $sum: 1 },
          },
        },
      ]),
      Patient.find().sort({ createdAt: -1 }).limit(6).populate("doctor", "name specialization hospital").lean(),
    ]);

  const doctorCounts = new Map(perDoctor.map((row) => [String(row._id), row.count]));
  const conditionCounts = new Map(perCondition.map((row) => [row._id, row.count]));
  const timelineCounts = new Map(timelineRows.map((row) => [row._id, row.count]));

  return {
    totals: { doctors: doctorCount, patients: patientCount, critical, addedThisWeek },
    patientsPerDoctor: doctors
      .map((doctor) => ({ name: doctor.name, count: doctorCounts.get(String(doctor._id)) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    byCondition: CONDITIONS.map((condition) => ({ condition, count: conditionCounts.get(condition) ?? 0 })),
    timeline: chartDays.map((date) => ({ date, label: labelFor(date), patients: timelineCounts.get(date) ?? 0 })),
    recentPatients: recent.map((patient) => serializePatient(patient)),
  };
}
