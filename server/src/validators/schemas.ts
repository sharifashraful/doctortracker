import { z } from "zod";
import { CONDITIONS, GENDERS } from "../config/constants.js";
import { clinicToday, parseCalendarDate } from "../lib/dates.js";

const phone = z
  .string()
  .trim()
  .min(7, "Enter a phone number")
  .max(20, "Phone number is too long")
  .regex(/^[0-9+().\-\s]+$/, "Use digits, spaces, and + ( ) - only");

export const doctorSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  specialization: z.string().trim().min(2, "Enter a specialization").max(80),
  hospital: z.string().trim().min(2, "Enter a hospital").max(120),
  phone,
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(120)
    .transform((value) => value.toLowerCase()),
});

export const patientSchema = z
  .object({
    fullName: z.string().trim().min(2, "Name is too short").max(80),
    email: z
      .string()
      .trim()
      .max(120)
      .transform((value) => value.toLowerCase())
      .refine((value) => value === "" || z.string().email().safeParse(value).success, "Enter a valid email"),
    phone,
    age: z.coerce.number().int().min(0, "Age cannot be negative").max(120, "Age is too high"),
    gender: z.enum(GENDERS),
    condition: z.enum(CONDITIONS),
    doctorId: z.string().regex(/^[a-f\d]{24}$/i, "Choose a doctor"),
    visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a visit date"),
    notes: z.string().trim().max(500, "Notes are limited to 500 characters").optional().default(""),
  })
  .superRefine((value, ctx) => {
    if (!parseCalendarDate(value.visitDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visitDate"],
        message: "Choose a real visit date",
      });
      return;
    }
    if (value.visitDate > clinicToday()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visitDate"],
        message: "Visit date cannot be in the future",
      });
    }
  });

export type DoctorInput = z.infer<typeof doctorSchema>;
export type PatientInput = z.infer<typeof patientSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Enter your password").max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;

export function zodFields(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fields[key]) fields[key] = issue.message;
  }
  return fields;
}
