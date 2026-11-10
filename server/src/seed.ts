import mongoose from "mongoose";
import { pathToFileURL } from "node:url";
import { connectDB, disconnectDB } from "./db.js";
import { hashPassword } from "./password.js";
import { Doctor } from "./models/Doctor.js";
import { Patient } from "./models/Patient.js";
import { User } from "./models/User.js";

const doctors = [
  ["Amira Hassan", "Cardiology", "City General Hospital", "+1 415 555 0142", "amira.hassan@citygeneral.example"],
  ["Julian Okonkwo", "Neurology", "St. Mary's Medical", "+1 415 555 0177", "julian.okonkwo@stmarys.example"],
  ["Priya Raman", "Pediatrics", "Riverside Medical", "+1 628 555 0118", "priya.raman@riverside.example"],
  ["Elena Vasquez", "Dermatology", "Northwell Clinic", "+1 510 555 0194", "elena.vasquez@northwell.example"],
  ["Hiroshi Tanaka", "Orthopedics", "City General Hospital", "+1 415 555 0160", "hiroshi.tanaka@citygeneral.example"],
  ["Noah Bergstrom", "Oncology", "St. Mary's Medical", "+1 415 555 0133", "noah.bergstrom@stmarys.example"],
  ["Fatima Al-Najjar", "General Medicine", "Riverside Medical", "+1 628 555 0186", "fatima.alnajjar@riverside.example"],
  ["Claire Dubois", "Cardiology", "Northwell Clinic", "+1 510 555 0125", "claire.dubois@northwell.example"],
  ["Samuel Adeyemi", "Neurology", "City General Hospital", "+1 415 555 0199", "samuel.adeyemi@citygeneral.example"],
  ["Mei Lin", "Pediatrics", "St. Mary's Medical", "+1 415 555 0108", "mei.lin@stmarys.example"],
] as const;

const firstNames = ["Maya", "Jonah", "Leila", "Hugo", "Sofia", "Kenji", "Amina", "Lars", "Chloe", "Ibrahim", "Nora", "Felix", "Aisha", "Mateo", "Hana", "Owen", "Yara", "Leo", "Ines", "Samir", "Freya", "Andre", "Mina", "Theo", "Zara", "Nico", "Esme", "Ravi", "Noor", "Idris", "Pia", "Omar", "Lina", "Soren", "Ada", "Hassan"];
const lastNames = ["Bennett", "Rahman", "Okeke", "Silva", "Nguyen", "Kowalski", "Adler", "Mensah", "Ito", "Costa", "Farouk", "Berg", "Diallo", "Petrov", "Shah", "Moreau", "Abebe", "Rossi", "Khan", "Walsh"];
const conditions = ["Stable", "Recovering", "Chronic", "Observation", "Stable", "Critical", "Recovering", "Stable"] as const;
const genders = ["Female", "Male", "Female", "Male", "Other", "Prefer not to say"] as const;
const notes = [
  "Follow-up in two weeks. Blood pressure is trending down.",
  "Post-procedure check. Pain is controlled with the current plan.",
  "Annual review. No medication changes today.",
  "New referral. Baseline labs ordered.",
  "Symptoms improved since the last visit.",
  "Family history noted. Monitoring continues.",
  "Cleared for routine activity with a return visit next month.",
  "",
];

function daysAgo(days: number) {
  const date = new Date();
  date.setUTCHours(15, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

export async function seedDatabase() {
  const email = (process.env.ADMIN_EMAIL || "admin@doctortracker.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_NAME || "Avery Cole";
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters.");

  const passwordHash = await hashPassword(password);
  await User.findOneAndUpdate(
    { email },
    { email, name, passwordHash, role: "admin" },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  const existing = await Doctor.countDocuments();
  if (existing > 0) {
    console.log(`Admin ready at ${email}. Demo records already exist, so they were left in place.`);
    return;
  }

  const createdDoctors = await Doctor.create(
    doctors.map(([doctorName, specialization, hospital, phone, doctorEmail]) => ({
      name: doctorName,
      specialization,
      hospital,
      phone,
      email: doctorEmail,
    })),
  );

  await Promise.all(
    createdDoctors.map((doctor: { _id: unknown }, index: number) =>
      Doctor.collection.updateOne(
        { _id: doctor._id as mongoose.Types.ObjectId },
        { $set: { createdAt: daysAgo(40 - index), updatedAt: daysAgo(40 - index) } },
      ),
    ),
  );

  const patients = firstNames.map((first, index) => {
    const doctor = createdDoctors[index % createdDoctors.length];
    const age = 6 + ((index * 7) % 78);
    const visited = daysAgo(index % 29);
    return {
      fullName: `${first} ${lastNames[index % lastNames.length]}`,
      email: `${first}.${lastNames[index % lastNames.length]}@mail.example`.toLowerCase(),
      phone: `+1 415 555 ${String(2000 + index).padStart(4, "0")}`,
      age,
      gender: genders[index % genders.length],
      condition: conditions[index % conditions.length],
      doctor: doctor._id,
      notes: notes[index % notes.length],
      visitDate: visited,
      createdAt: visited,
    };
  });

  const createdPatients = await Patient.create(patients);
  await Promise.all(
    createdPatients.map((patient: { _id: unknown }, index: number) =>
      Patient.collection.updateOne(
        { _id: patient._id as mongoose.Types.ObjectId },
        { $set: { createdAt: patients[index].createdAt, visitDate: patients[index].visitDate } },
      ),
    ),
  );
  console.log(`Seeded ${email}, ${createdDoctors.length} doctors, and ${patients.length} patients.`);
}

export async function seedIfEmpty() {
  if ((await User.countDocuments()) > 0) return;
  await seedDatabase();
}

const isDirect = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirect) {
  connectDB()
    .then(() => seedDatabase())
    .then(() => disconnectDB())
    .then(() => process.exit(0))
    .catch(async (error) => {
      console.error(error);
      await disconnectDB().catch(() => undefined);
      process.exit(1);
    });
}
