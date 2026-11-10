"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { PatientForm } from "@/components/patients/patient-form";
import { useResource } from "@/components/hooks";
import { pushToast } from "@/components/layout/toast";
import { Breadcrumb, EmptyState, ErrorNote, PageHeader, Panel, Skeleton } from "@/components/ui";
import { api } from "@/lib/client";
import type { PatientInput } from "@/lib/validators";
import type { DoctorDTO, DoctorRef, MetaDTO, PatientDTO } from "@/types";

function withDoctor(doctors: DoctorRef[], locked: DoctorRef | null) {
  if (!locked || doctors.some((doctor) => doctor.id === locked.id)) return doctors;
  return [locked, ...doctors];
}

function RecordFrame({
  crumbs,
  title,
  description,
  metaFailure,
  loading,
  children,
}: {
  crumbs: { label: string; href?: string }[];
  title: string;
  description: string;
  metaFailure: unknown;
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <Breadcrumb items={crumbs} />
      <PageHeader eyebrow="Care list" title={title} description={description} />
      {metaFailure ? (
        <div className="mb-4">
          <ErrorNote error={metaFailure} />
        </div>
      ) : null}
      {loading ? <Skeleton className="h-80" /> : <Panel className="max-w-3xl p-5 sm:p-6">{children}</Panel>}
    </div>
  );
}

function MissingRecord({
  crumbs,
  title,
  body,
  href,
  label,
}: {
  crumbs: { label: string; href?: string }[];
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <div>
      <Breadcrumb items={crumbs} />
      <Panel>
        <EmptyState title={title} body={body} />
        <div className="pb-8 text-center">
          <Link href={href} className="text-sm font-medium text-pine">
            {label}
          </Link>
        </div>
      </Panel>
    </div>
  );
}

function AddPatientForm({
  crumbs,
  description,
  backHref,
  doctors,
  lockDoctor,
  doctorId,
  metaFailure,
  loading,
}: {
  crumbs: { label: string; href?: string }[];
  description: string;
  backHref: string;
  doctors: DoctorRef[];
  lockDoctor: boolean;
  doctorId?: string;
  metaFailure: unknown;
  loading: boolean;
}) {
  const router = useRouter();

  async function save(values: PatientInput) {
    const payload = doctorId ? { ...values, doctorId } : values;
    await api("/api/patients", { method: "POST", body: JSON.stringify(payload) });
    pushToast({ title: "Patient added" });
    router.push(backHref);
  }

  return (
    <RecordFrame crumbs={crumbs} title="Add patient" description={description} metaFailure={metaFailure} loading={loading}>
      <PatientForm
        initial={doctorId ? { doctorId } : null}
        doctors={doctors}
        lockDoctor={lockDoctor}
        onSubmit={save}
        onCancel={() => router.push(backHref)}
      />
    </RecordFrame>
  );
}

export function AddPatientScreen() {
  const meta = useResource<{ data: MetaDTO }>("/api/meta");
  return (
    <AddPatientForm
      crumbs={[{ label: "Patients", href: "/patients" }, { label: "Add patient" }]}
      description="Condition, visit date, and the responsible doctor."
      backHref="/patients"
      doctors={meta.data?.data.doctors ?? []}
      lockDoctor={false}
      metaFailure={meta.failure}
      loading={meta.loading && !meta.data && !meta.failure}
    />
  );
}

export function AddDoctorPatientScreen({ doctorId }: { doctorId: string }) {
  const meta = useResource<{ data: MetaDTO }>("/api/meta");
  const doctor = useResource<{ data: DoctorDTO }>(`/api/doctors/${doctorId}`);
  const record = doctor.data?.data;
  const backHref = `/doctors/${doctorId}`;
  const locked: DoctorRef | null = record
    ? { id: record.id, name: record.name, specialization: record.specialization, hospital: record.hospital }
    : null;

  if (doctor.failure) {
    return (
      <MissingRecord
        crumbs={[{ label: "Doctors", href: "/doctors" }, { label: "Add patient" }]}
        title={doctor.failure.label}
        body={doctor.failure.message}
        href="/doctors"
        label="Back to doctors"
      />
    );
  }

  return (
    <AddPatientForm
      crumbs={[
        { label: "Doctors", href: "/doctors" },
        { label: record?.name ?? "Doctor", href: backHref },
        { label: "Add patient" },
      ]}
      description={record ? `Assign someone to ${record.name}.` : "Condition, visit date, and the responsible doctor."}
      backHref={backHref}
      doctors={withDoctor(meta.data?.data.doctors ?? [], locked)}
      lockDoctor
      doctorId={doctorId}
      metaFailure={meta.failure}
      loading={(doctor.loading && !record) || (meta.loading && !meta.data && !meta.failure)}
    />
  );
}

function EditPatientForm({
  patientId,
  crumbs,
  description,
  backHref,
  initial,
  doctors,
  lockDoctor,
  doctorId,
  metaFailure,
  loading,
}: {
  patientId: string;
  crumbs: { label: string; href?: string }[];
  description: string;
  backHref: string;
  initial: Partial<PatientInput> | null;
  doctors: DoctorRef[];
  lockDoctor: boolean;
  doctorId?: string;
  metaFailure: unknown;
  loading: boolean;
}) {
  const router = useRouter();

  async function save(values: PatientInput) {
    const payload = doctorId ? { ...values, doctorId } : values;
    await api(`/api/patients/${patientId}`, { method: "PATCH", body: JSON.stringify(payload) });
    pushToast({ title: "Patient updated" });
    router.push(backHref);
  }

  return (
    <RecordFrame crumbs={crumbs} title="Edit patient" description={description} metaFailure={metaFailure} loading={loading}>
      {initial ? (
        <PatientForm
          key={patientId}
          initial={initial}
          doctors={doctors}
          lockDoctor={lockDoctor}
          onSubmit={save}
          onCancel={() => router.push(backHref)}
        />
      ) : null}
    </RecordFrame>
  );
}

function toInitial(record: PatientDTO, doctorId?: string): Partial<PatientInput> {
  return {
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    age: record.age,
    gender: record.gender,
    condition: record.condition,
    doctorId: doctorId ?? record.doctor?.id ?? "",
    visitDate: record.visitDate,
    notes: record.notes,
  };
}

export function EditPatientScreen({ patientId }: { patientId: string }) {
  const meta = useResource<{ data: MetaDTO }>("/api/meta");
  const patient = useResource<{ data: PatientDTO }>(`/api/patients/${patientId}`);
  const record = patient.data?.data;

  if (patient.failure) {
    return (
      <MissingRecord
        crumbs={[{ label: "Patients", href: "/patients" }, { label: "Edit patient" }]}
        title={patient.failure.label}
        body={patient.failure.message}
        href="/patients"
        label="Back to patients"
      />
    );
  }

  return (
    <EditPatientForm
      patientId={patientId}
      crumbs={[
        { label: "Patients", href: "/patients" },
        { label: record?.fullName ?? "Patient" },
        { label: "Edit" },
      ]}
      description={record ? `${record.fullName} · ${record.condition}` : "Condition, visit date, and the responsible doctor."}
      backHref="/patients"
      initial={record ? toInitial(record) : null}
      doctors={meta.data?.data.doctors ?? []}
      lockDoctor={false}
      metaFailure={meta.failure}
      loading={(!record && patient.loading) || (meta.loading && !meta.data && !meta.failure)}
    />
  );
}

export function EditDoctorPatientScreen({ doctorId, patientId }: { doctorId: string; patientId: string }) {
  const meta = useResource<{ data: MetaDTO }>("/api/meta");
  const patient = useResource<{ data: PatientDTO }>(`/api/patients/${patientId}`);
  const doctor = useResource<{ data: DoctorDTO }>(`/api/doctors/${doctorId}`);
  const record = patient.data?.data;
  const profile = doctor.data?.data;
  const backHref = `/doctors/${doctorId}`;
  const doctorCrumb = { label: profile?.name ?? record?.doctor?.name ?? "Doctor", href: backHref };

  if (doctor.failure) {
    return (
      <MissingRecord
        crumbs={[{ label: "Doctors", href: "/doctors" }, { label: "Edit patient" }]}
        title={doctor.failure.label}
        body={doctor.failure.message}
        href="/doctors"
        label="Back to doctors"
      />
    );
  }

  if (patient.failure) {
    return (
      <MissingRecord
        crumbs={[{ label: "Doctors", href: "/doctors" }, doctorCrumb, { label: "Edit patient" }]}
        title={patient.failure.label}
        body={patient.failure.message}
        href={backHref}
        label="Back to doctor"
      />
    );
  }

  if (record && record.doctor?.id !== doctorId) {
    return (
      <MissingRecord
        crumbs={[{ label: "Doctors", href: "/doctors" }, doctorCrumb, { label: "Edit patient" }]}
        title="Patient is on another roster"
        body="Open the doctor this patient is assigned to, or edit the record from the patient list."
        href={backHref}
        label="Back to doctor"
      />
    );
  }

  return (
    <EditPatientForm
      patientId={patientId}
      crumbs={[
        { label: "Doctors", href: "/doctors" },
        doctorCrumb,
        { label: record?.fullName ?? "Patient" },
        { label: "Edit" },
      ]}
      description={record ? `${record.fullName} · ${record.condition}` : "Condition, visit date, and the responsible doctor."}
      backHref={backHref}
      initial={record ? toInitial(record, doctorId) : null}
      doctors={withDoctor(meta.data?.data.doctors ?? [], record?.doctor ?? null)}
      lockDoctor
      doctorId={doctorId}
      metaFailure={meta.failure}
      loading={(!record && patient.loading) || (doctor.loading && !profile) || (meta.loading && !meta.data && !meta.failure)}
    />
  );
}
