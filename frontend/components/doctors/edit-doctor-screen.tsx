"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DoctorForm } from "@/components/doctors/doctor-form";
import { useResource } from "@/components/hooks";
import { pushToast } from "@/components/layout/toast";
import { Breadcrumb, EmptyState, ErrorNote, PageHeader, PageLoader, Panel } from "@/components/ui";
import { api } from "@/lib/client";
import type { DoctorInput } from "@/lib/validators";
import type { DoctorDTO, MetaDTO } from "@/types";

export function EditDoctorScreen({ id }: { id: string }) {
  const router = useRouter();
  const doctor = useResource<{ data: DoctorDTO }>(`/api/doctors/${id}`);
  const meta = useResource<{ data: MetaDTO }>("/api/meta");
  const record = doctor.data?.data;
  const profileHref = `/doctors/${id}`;

  async function save(values: DoctorInput) {
    await api(`/api/doctors/${id}`, { method: "PATCH", body: JSON.stringify(values) });
    pushToast({ title: "Doctor updated" });
    router.push(profileHref);
  }

  if (doctor.failure) {
    return (
      <div>
        <Breadcrumb items={[{ label: "Doctors", href: "/doctors" }, { label: "Edit" }]} />
        <Panel>
          <EmptyState title={doctor.failure.label} body={doctor.failure.message} />
          <div className="pb-8 text-center">
            <Link href="/doctors" className="text-sm font-medium text-pine">
              Back to doctors
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Doctors", href: "/doctors" },
          { label: record?.name ?? "Doctor", href: profileHref },
          { label: "Edit" },
        ]}
      />
      <PageHeader
        eyebrow="Registry"
        title="Edit doctor"
        description={record ? `${record.name} · ${record.specialization}` : "Name, specialty, hospital, and contact details."}
      />
      {meta.failure ? (
        <div className="mb-4">
          <ErrorNote error={meta.failure} />
        </div>
      ) : null}
      {doctor.loading && !record ? (
        <PageLoader />
      ) : record ? (
        <Panel className="max-w-3xl p-5 sm:p-6">
          <DoctorForm
            key={record.id}
            initial={record}
            specializations={meta.data?.data.specializations ?? []}
            hospitals={meta.data?.data.hospitals ?? []}
            onSubmit={save}
            onCancel={() => router.push(profileHref)}
          />
        </Panel>
      ) : null}
    </div>
  );
}
