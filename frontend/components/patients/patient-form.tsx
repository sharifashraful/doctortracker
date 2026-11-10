"use client";

import { FormEvent, useState } from "react";
import { CONDITIONS, GENDERS } from "@/lib/constants";
import { ClientError } from "@/lib/client";
import { Button, ErrorNote, Field, controlClass } from "@/components/ui";
import { todayInput } from "@/lib/format";
import { patientSchema, zodFields, type PatientInput } from "@/lib/validators";
import type { DoctorRef } from "@/types";

export function PatientForm({
  initial,
  doctors,
  lockDoctor,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<PatientInput> | null;
  doctors: DoctorRef[];
  lockDoctor?: boolean;
  onSubmit: (values: PatientInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState({
    fullName: initial?.fullName ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    age: initial?.age?.toString() ?? "",
    gender: initial?.gender ?? "Female",
    condition: initial?.condition ?? "Stable",
    doctorId: initial?.doctorId ?? doctors[0]?.id ?? "",
    visitDate: initial?.visitDate ?? todayInput(),
    notes: initial?.notes ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  function set(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = patientSchema.safeParse({ ...values, age: values.age });
    if (!parsed.success) {
      const fields = zodFields(parsed.error);
      setErrors(fields);
      setFailure(new ClientError("Check the highlighted fields.", 422, "VALIDATION_ERROR", fields));
      return;
    }
    setBusy(true);
    setErrors({});
    setFailure(null);
    try {
      await onSubmit(parsed.data);
    } catch (error) {
      if (error instanceof ClientError) setErrors(error.fields ?? {});
      setFailure(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field label="Full name" error={errors.fullName}>
        <input className={controlClass} value={values.fullName} onChange={(event) => set("fullName", event.target.value)} autoFocus />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" error={errors.email}>
          <input className={controlClass} type="email" value={values.email} onChange={(event) => set("email", event.target.value)} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input className={controlClass} value={values.phone} onChange={(event) => set("phone", event.target.value)} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Age" error={errors.age}>
          <input className={controlClass} inputMode="numeric" value={values.age} onChange={(event) => set("age", event.target.value)} />
        </Field>
        <Field label="Gender" error={errors.gender}>
          <select className={controlClass} value={values.gender} onChange={(event) => set("gender", event.target.value)}>
            {GENDERS.map((gender) => (
              <option key={gender}>{gender}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Condition" error={errors.condition}>
          <select className={controlClass} value={values.condition} onChange={(event) => set("condition", event.target.value)}>
            {CONDITIONS.map((condition) => (
              <option key={condition}>{condition}</option>
            ))}
          </select>
        </Field>
        <Field label="Visit date" error={errors.visitDate}>
          <input className={controlClass} type="date" max={todayInput()} value={values.visitDate} onChange={(event) => set("visitDate", event.target.value)} />
        </Field>
      </div>
      <Field label="Doctor" error={errors.doctorId}>
        <select
          className={controlClass}
          value={values.doctorId}
          disabled={lockDoctor || doctors.length === 0}
          onChange={(event) => set("doctorId", event.target.value)}
        >
          {doctors.length === 0 ? <option value="">Add a doctor first</option> : null}
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} · {doctor.specialization}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Notes" error={errors.notes}>
        <textarea className={`${controlClass} min-h-24 resize-y`} value={values.notes} onChange={(event) => set("notes", event.target.value)} />
      </Field>
      {failure ? <ErrorNote error={failure} fallback="Could not save this patient." /> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy || doctors.length === 0}>
          {busy ? "Saving…" : "Save patient"}
        </Button>
      </div>
    </form>
  );
}
