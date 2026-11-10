"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Pencil, SlidersHorizontal, Trash2 } from "lucide-react";
import { useDebouncedValue, useQueryState, useResource } from "@/components/hooks";
import { pushToast } from "@/components/layout/toast";
import { Button, ConditionBadge, ConfirmDialog, EmptyState, ErrorNote, PageHeader, Pagination, Panel, Skeleton, controlClass } from "@/components/ui";
import { api } from "@/lib/client";
import { errorTitle } from "@/lib/errors";
import { CONDITIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { MetaDTO, PatientDTO } from "@/types";

type ListBody = {
  data: PatientDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export function PatientsScreen({
  lockedDoctorId,
  embedded = false,
  onChanged,
}: {
  lockedDoctorId?: string;
  embedded?: boolean;
  onChanged?: () => void;
}) {
  const { sp, setParams } = useQueryState();
  const commitQuery = useCallback((value: string) => setParams({ q: value || null }), [setParams]);
  const [query, setQuery] = useDebouncedValue(sp.get("q") ?? "", commitQuery);
  const params = new URLSearchParams(sp.toString());
  if (lockedDoctorId) params.set("doctorId", lockedDoctorId);
  const list = useResource<ListBody>(`/api/patients?${params.toString()}`);
  const meta = useResource<{ data: MetaDTO }>("/api/meta");
  const [filtersOpen, setFiltersOpen] = useState(
    () => ["condition", "doctorId", "from", "to"].some((key) => sp.get(key) && !(embedded && key === "doctorId")),
  );
  const [removing, setRemoving] = useState<PatientDTO | null>(null);
  const [removeError, setRemoveError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const doctors = meta.data?.data.doctors ?? [];

  async function remove() {
    if (!removing) return;
    setBusy(true);
    setRemoveError(null);
    try {
      await api(`/api/patients/${removing.id}`, { method: "DELETE" });
      pushToast({ title: "Patient removed" });
      setRemoving(null);
      list.reload();
      onChanged?.();
    } catch (error) {
      setRemoveError(error);
      pushToast({ tone: "danger", title: errorTitle(error, "Could not remove this patient.") });
    } finally {
      setBusy(false);
    }
  }

  const patients = list.data?.data ?? [];
  const filtersNarrowed = ["condition", "from", "to", embedded ? "" : "doctorId"].some((key) => key && sp.get(key));
  const filterField = `${controlClass} ${filtersOpen ? "col-span-2" : "hidden"} lg:col-span-1 lg:block`;
  const addHref = lockedDoctorId ? `/doctors/${lockedDoctorId}/patients/new` : "/patients/new";
  const editHref = (patientId: string) =>
    lockedDoctorId ? `/doctors/${lockedDoctorId}/patients/${patientId}/edit` : `/patients/${patientId}/edit`;
  const addLink = (
    <Link
      href={addHref}
      className="inline-flex items-center justify-center rounded-xl bg-pine px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-pine-deep"
    >
      Add patient
    </Link>
  );

  return (
    <div>
      {embedded ? (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl">Patient roster</h2>
            <p className="text-sm text-muted">People currently assigned to this doctor.</p>
          </div>
          {addLink}
        </div>
      ) : (
        <PageHeader
          eyebrow="Care list"
          title="Patients"
          description="Review the full roster, edit a record, or remove someone who is no longer followed here."
          action={doctors.length === 0 && !meta.loading ? <Button disabled>Add patient</Button> : addLink}
        />
      )}
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-2 xl:grid-cols-6">
        <input
          className={`${controlClass} lg:col-span-2`}
          placeholder="Search name, phone, doctor"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search patients"
        />
        <button
          type="button"
          className={`relative grid h-11 w-11 place-items-center rounded-xl border bg-white text-ink lg:hidden ${filtersOpen ? "border-pine text-pine" : "border-line"}`}
          aria-label={filtersOpen ? "Hide filters" : "Show filters"}
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal size={18} />
          {filtersNarrowed ? <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-pine" aria-hidden /> : null}
        </button>
        <select className={filterField} value={sp.get("condition") ?? ""} onChange={(event) => setParams({ condition: event.target.value || null })} aria-label="Filter by condition">
          <option value="">All conditions</option>
          {CONDITIONS.map((condition) => (
            <option key={condition}>{condition}</option>
          ))}
        </select>
        {embedded ? null : (
          <select className={filterField} value={sp.get("doctorId") ?? ""} onChange={(event) => setParams({ doctorId: event.target.value || null })} aria-label="Filter by doctor">
            <option value="">All doctors</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        )}
        <input className={filterField} type="date" value={sp.get("from") ?? ""} onChange={(event) => setParams({ from: event.target.value || null })} aria-label="Visit from" />
        <input className={filterField} type="date" value={sp.get("to") ?? ""} onChange={(event) => setParams({ to: event.target.value || null })} aria-label="Visit to" />
      </div>
      {meta.failure && !list.failure ? (
        <div className="mb-4">
          <ErrorNote error={meta.failure} />
        </div>
      ) : null}
      <Panel>
        {list.loading && !list.data ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : null}
        {list.failure ? <EmptyState title={list.failure.label} body={list.failure.message} /> : null}
        {list.data && patients.length === 0 ? (
          <EmptyState title="No patients match" body="Adjust the filters, or add a patient to a doctor." />
        ) : null}
        {patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Condition</th>
                  {embedded ? null : <th className="px-4 py-3 font-medium">Doctor</th>}
                  <th className="px-4 py-3 font-medium">Visit</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{patient.fullName}</p>
                      <p className="text-muted">
                        {patient.age} · {patient.gender}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <ConditionBadge condition={patient.condition} />
                    </td>
                    {embedded ? null : (
                      <td className="px-4 py-3">
                        {patient.doctor ? (
                          <Link href={`/doctors/${patient.doctor.id}`} className="hover:text-pine">
                            {patient.doctor.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">{formatDate(patient.visitDate)}</td>
                    <td className="px-4 py-3">
                      <p>{patient.phone}</p>
                      <p className="text-muted">{patient.email || "No email"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={editHref(patient.id)} className="rounded-lg p-2 hover:bg-paper" aria-label={`Edit ${patient.fullName}`}>
                          <Pencil size={16} />
                        </Link>
                        <button className="rounded-lg p-2 text-danger hover:bg-[#f8e8e4]" aria-label={`Delete ${patient.fullName}`} onClick={() => setRemoving(patient)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {list.data ? (
          <Pagination
            page={list.data.page}
            pages={list.data.pages}
            total={list.data.total}
            limit={list.data.limit}
            onPage={(page) => setParams({ page: String(page) })}
          />
        ) : null}
      </Panel>
      <ConfirmDialog
        open={Boolean(removing)}
        title={`Remove ${removing?.fullName ?? "this patient"}?`}
        body="This deletes the patient record from the doctor's roster."
        confirmLabel="Remove patient"
        busy={busy}
        error={removeError}
        onConfirm={remove}
        onClose={() => {
          setRemoving(null);
          setRemoveError(null);
        }}
      />
    </div>
  );
}
