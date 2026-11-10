import type { Condition, Gender } from "@/lib/constants";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type DoctorDTO = {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount: number;
  createdAt: string;
};

export type DoctorRef = {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
};

export type PatientDTO = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: Gender;
  condition: Condition;
  notes: string;
  visitDate: string;
  createdAt: string;
  doctor: DoctorRef | null;
};

export type ListMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type MetaDTO = {
  specializations: string[];
  hospitals: string[];
  doctors: DoctorRef[];
};

export type StatsDTO = {
  totals: {
    doctors: number;
    patients: number;
    critical: number;
    addedThisWeek: number;
  };
  patientsPerDoctor: { name: string; count: number }[];
  byCondition: { condition: string; count: number }[];
  timeline: { date: string; label: string; patients: number }[];
  recentPatients: PatientDTO[];
};
