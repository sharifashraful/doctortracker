"use client";

import { useRouter } from "next/navigation";
import { DoctorForm } from "@/components/doctors/doctor-form";
import { useResource } from "@/components/hooks";
import { pushToast } from "@/components/layout/toast";
import { Breadcrumb, ErrorNote, PageHeader, Panel, Skeleton } from "@/components/ui";
import { api } from "@/lib/client";
import type { DoctorInput } from "@/lib/validators";
import type { MetaDTO } from "@/types";

export function AddDoctorScreen() {
  const router = useRouter();
  const meta = useResource<{ data: MetaDTO }>("/api/meta");

  async function save(values: DoctorInput) {
    await api("/api/doctors", { method: "POST", body: JSON.stringify(values) });
    pushToast({ title: "Doctor added" });
    router.push("/doctors");
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Doctors", href: "/doctors" }, { label: "Add doctor" }]} />
      <PageHeader eyebrow="Registry" title="Add doctor" description="Name, specialty, hospital, and contact details." />
      {meta.failure ? (
        <div className="mb-4">
          <ErrorNote error={meta.failure} />
        </div>
      ) : null}
      {meta.loading && !meta.data && !meta.failure ? (
        <Skeleton className="h-80" />
      ) : (
        <Panel className="max-w-3xl p-5 sm:p-6">
          <DoctorForm
            specializations={meta.data?.data.specializations ?? []}
            hospitals={meta.data?.data.hospitals ?? []}
            onSubmit={save}
            onCancel={() => router.push("/doctors")}
          />
        </Panel>
      )}
    </div>
  );
}
