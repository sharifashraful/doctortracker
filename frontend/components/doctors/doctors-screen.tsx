"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Pencil, SlidersHorizontal, Trash2 } from "lucide-react";
import { useDebouncedValue, useQueryState, useResource } from "@/components/hooks";
import { pushToast } from "@/components/layout/toast";
import { ConfirmDialog, EmptyState, ErrorNote, PageHeader, Pagination, Panel, Skeleton, controlClass } from "@/components/ui";
import { api } from "@/lib/client";
import { errorTitle } from "@/lib/errors";
import { colorFromName, formatDate, initials } from "@/lib/format";
import type { DoctorDTO, MetaDTO } from "@/types";

type ListBody = {
  data: DoctorDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export function DoctorsScreen() {
  const { sp, setParams } = useQueryState();
  const commitQuery = useCallback((value: string) => setParams({ q: value || null }), [setParams]);
  const [query, setQuery] = useDebouncedValue(sp.get("q") ?? "", commitQuery);
  const list = useResource<ListBody>(`/api/doctors?${sp.toString()}`);
  const meta = useResource<{ data: MetaDTO }>("/api/meta");
  const [filtersOpen, setFiltersOpen] = useState(
    () => ["specialization", "hospital", "from", "to", "sort"].some((key) => sp.get(key)),
  );
  const [removing, setRemoving] = useState<DoctorDTO | null>(null);
  const [removeError, setRemoveError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!removing) return;
    setBusy(true);
    setRemoveError(null);
    try {
      await api(`/api/doctors/${removing.id}`, { method: "DELETE" });
      pushToast({ title: "Doctor removed" });
      setRemoving(null);
      list.reload();
      meta.reload();
    } catch (error) {
      setRemoveError(error);
      pushToast({ tone: "danger", title: errorTitle(error, "Could not remove this doctor.") });
    } finally {
      setBusy(false);
    }
  }

  const doctors = list.data?.data ?? [];
  const filtersActive = ["q", "specialization", "hospital", "from", "to", "sort"].some((key) => sp.get(key));
  const filtersNarrowed = ["specialization", "hospital", "from", "to", "sort"].some((key) => sp.get(key));
  const filterField = `${controlClass} ${filtersOpen ? "col-span-2" : "hidden"} lg:col-span-1 lg:block`;

  return (
    <div>
      <PageHeader
        eyebrow="Registry"
        title="Doctors"
        description="Search the staff list, narrow it by hospital or specialty, and open a doctor to see the patients in their care."
        action={
          <Link
            href="/doctors/new"
            className="inline-flex items-center justify-center rounded-xl bg-pine px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-pine-deep"
          >
            Add doctor
          </Link>
        }
      />
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-2 xl:grid-cols-6">
        <input
          className={`${controlClass} lg:col-span-2`}
          placeholder="Search name, hospital, email, phone"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search doctors"
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
        <select
          className={filterField}
          value={sp.get("specialization") ?? ""}
          onChange={(event) => setParams({ specialization: event.target.value || null })}
          aria-label="Filter by specialization"
        >
          <option value="">All specializations</option>
          {meta.data?.data.specializations.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          className={filterField}
          value={sp.get("hospital") ?? ""}
          onChange={(event) => setParams({ hospital: event.target.value || null })}
          aria-label="Filter by hospital"
        >
          <option value="">All hospitals</option>
          {meta.data?.data.hospitals.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <input className={filterField} type="date" value={sp.get("from") ?? ""} onChange={(event) => setParams({ from: event.target.value || null })} aria-label="Added from" />
        <input className={filterField} type="date" value={sp.get("to") ?? ""} onChange={(event) => setParams({ to: event.target.value || null })} aria-label="Added to" />
      </div>
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <label className={`${filtersOpen ? "flex" : "hidden"} items-center gap-2 lg:flex`}>
          Sort
          <select className={`${controlClass} w-auto`} value={sp.get("sort") ?? "newest"} onChange={(event) => setParams({ sort: event.target.value === "name" ? "name" : null })}>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </select>
        </label>
        {filtersActive ? (
          <button className="ml-auto font-medium text-pine" onClick={() => setParams({ q: null, specialization: null, hospital: null, from: null, to: null, sort: null, page: null })}>
            Clear filters
          </button>
        ) : (
          <span className="ml-auto">{list.data ? `${list.data.total} on record` : ""}</span>
        )}
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
        {list.data && doctors.length === 0 ? (
          <EmptyState title="No doctors match" body="Try another search, or add the first doctor to this registry." />
        ) : null}
        {doctors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Doctor</th>
                  <th className="px-4 py-3 font-medium">Hospital</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Patients</th>
                  <th className="px-4 py-3 font-medium">Added</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                          style={{ background: colorFromName(doctor.name) }}
                        >
                          {initials(doctor.name)}
                        </span>
                        <div>
                          <Link href={`/doctors/${doctor.id}`} className="font-medium hover:text-pine">
                            {doctor.name}
                          </Link>
                          <p className="text-muted">{doctor.specialization}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{doctor.hospital}</td>
                    <td className="px-4 py-3">
                      <p>{doctor.email}</p>
                      <p className="text-muted">{doctor.phone}</p>
                    </td>
                    <td className="px-4 py-3">{doctor.patientCount}</td>
                    <td className="px-4 py-3">{formatDate(doctor.createdAt.slice(0, 10))}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/doctors/${doctor.id}/edit`} className="rounded-lg p-2 hover:bg-paper" aria-label={`Edit ${doctor.name}`}>
                          <Pencil size={16} />
                        </Link>
                        <button className="rounded-lg p-2 text-danger hover:bg-[#f8e8e4]" aria-label={`Delete ${doctor.name}`} onClick={() => setRemoving(doctor)}>
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
        title={`Remove ${removing?.name ?? "this doctor"}?`}
        body="Doctors who still have patients stay on record until those patients are reassigned or removed."
        confirmLabel="Remove doctor"
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
