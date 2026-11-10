"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useResource } from "@/components/hooks";
import { PatientsScreen } from "@/components/patients/patients-screen";
import { pushToast } from "@/components/layout/toast";
import { Button, ConfirmDialog, EmptyState, Panel, Skeleton } from "@/components/ui";
import { api } from "@/lib/client";
import { errorTitle } from "@/lib/errors";
import { colorFromName, formatDate, initials } from "@/lib/format";
import type { DoctorDTO } from "@/types";

export function DoctorDetail({ id }: { id: string }) {
  const router = useRouter();
  const doctor = useResource<{ data: DoctorDTO }>(`/api/doctors/${id}`);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const record = doctor.data?.data;

  async function remove() {
    setBusy(true);
    setRemoveError(null);
    try {
      await api(`/api/doctors/${id}`, { method: "DELETE" });
      pushToast({ title: "Doctor removed" });
      router.push("/doctors");
    } catch (error) {
      setRemoveError(error);
      pushToast({ tone: "danger", title: errorTitle(error, "Could not remove this doctor.") });
      setBusy(false);
    }
  }

  if (doctor.failure) {
    return (
      <Panel>
        <EmptyState title={doctor.failure.label} body={doctor.failure.message} />
        <div className="pb-8 text-center">
          <Link href="/doctors" className="text-sm font-medium text-pine">
            Back to doctors
          </Link>
        </div>
      </Panel>
    );
  }

  return (
    <div>
      <Link href="/doctors" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} />
        All doctors
      </Link>
      {!record ? (
        <Skeleton className="h-40" />
      ) : (
        <Panel className="mb-6 p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span
                className="grid h-14 w-14 place-items-center rounded-2xl text-lg font-semibold text-white"
                style={{ background: colorFromName(record.name) }}
              >
                {initials(record.name)}
              </span>
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-copper uppercase">{record.specialization}</p>
                <h1 className="text-4xl">{record.name}</h1>
                <p className="mt-2 text-sm text-muted">
                  {record.hospital}
                  <br />
                  {record.email} · {record.phone}
                </p>
                <p className="mt-2 text-sm">
                  {`${record.patientCount} ${record.patientCount === 1 ? "patient" : "patients"} · added ${formatDate(record.createdAt.slice(0, 10))}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/doctors/${id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm font-medium text-ink transition hover:bg-[#f7f3ea]"
              >
                Edit
              </Link>
              <Button variant="danger" onClick={() => setRemoving(true)}>
                Delete
              </Button>
            </div>
          </div>
        </Panel>
      )}
      <PatientsScreen lockedDoctorId={id} embedded onChanged={doctor.reload} />
      <ConfirmDialog
        open={removing}
        title={`Remove ${record?.name ?? "this doctor"}?`}
        body="This is only allowed when the patient roster is empty."
        confirmLabel="Remove doctor"
        busy={busy}
        error={removeError}
        onConfirm={remove}
        onClose={() => {
          setRemoving(false);
          setRemoveError(null);
        }}
      />
    </div>
  );
}
