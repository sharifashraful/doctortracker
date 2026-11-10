"use client";

import { FormEvent, useState } from "react";
import { doctorSchema, zodFields, type DoctorInput } from "@/lib/validators";
import { ClientError } from "@/lib/client";
import { Button, ErrorNote, Field, controlClass } from "@/components/ui";

const suggestions = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Oncology",
  "General Medicine",
];

export function DoctorForm({
  initial,
  specializations,
  hospitals,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<DoctorInput> | null;
  specializations: string[];
  hospitals: string[];
  onSubmit: (values: DoctorInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState({
    name: initial?.name ?? "",
    specialization: initial?.specialization ?? "",
    hospital: initial?.hospital ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = doctorSchema.safeParse(values);
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
      <Field label="Name" error={errors.name}>
        <input className={controlClass} value={values.name} onChange={(event) => set("name", event.target.value)} autoFocus />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Specialization" error={errors.specialization}>
          <input
            className={controlClass}
            list="specializations"
            value={values.specialization}
            onChange={(event) => set("specialization", event.target.value)}
          />
          <datalist id="specializations">
            {[...new Set([...suggestions, ...specializations])].map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </Field>
        <Field label="Hospital" error={errors.hospital}>
          <input className={controlClass} list="hospitals" value={values.hospital} onChange={(event) => set("hospital", event.target.value)} />
          <datalist id="hospitals">
            {hospitals.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" error={errors.phone}>
          <input className={controlClass} value={values.phone} onChange={(event) => set("phone", event.target.value)} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className={controlClass} type="email" value={values.email} onChange={(event) => set("email", event.target.value)} />
        </Field>
      </div>
      {failure ? <ErrorNote error={failure} fallback="Could not save this doctor." /> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save doctor"}
        </Button>
      </div>
    </form>
  );
}
