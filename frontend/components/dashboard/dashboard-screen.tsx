"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useResource } from "@/components/hooks";
import { ConditionBadge, EmptyState, PageHeader, PageLoader, Panel } from "@/components/ui";
import { formatDate, formatLongDate } from "@/lib/format";
import type { StatsDTO } from "@/types";

const CensusChart = dynamic(() => import("@/components/dashboard/charts").then((mod) => mod.CensusChart), { ssr: false });
const DoctorLoadChart = dynamic(() => import("@/components/dashboard/charts").then((mod) => mod.DoctorLoadChart), { ssr: false });
const ConditionChart = dynamic(() => import("@/components/dashboard/charts").then((mod) => mod.ConditionChart), { ssr: false });

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardScreen() {
  const { data, failure, loading, reload } = useResource<{ data: StatsDTO }>("/api/stats");
  const stats = data?.data;

  return (
    <div>
      <PageHeader
        eyebrow={formatLongDate()}
        title={`${greeting()}.`}
        description="A live reading of the registry: who is on staff, who is in their care, and how the last month has moved."
      />
      {failure ? (
        <Panel>
          <EmptyState title={failure.label} body={failure.message} />
          <div className="pb-8 text-center">
            <button className="text-sm font-medium text-pine" onClick={reload}>
              Try again
            </button>
          </div>
        </Panel>
      ) : null}
      {!stats && loading ? <PageLoader /> : null}
      {stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Doctors" value={stats.totals.doctors} caption="Across every hospital" />
            <Stat label="Patients" value={stats.totals.patients} caption="Assigned to a doctor" />
            <Stat label="Critical" value={stats.totals.critical} caption="Marked for closer attention" accent />
            <Stat label="New this week" value={stats.totals.addedThisWeek} caption="Patients added in 7 days" />
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-5">
            <Panel className="p-5 xl:col-span-3">
              <h2 className="text-2xl">New patients</h2>
              <p className="mb-4 text-sm text-muted">Records created over the last 30 days.</p>
              <CensusChart data={stats.timeline} />
            </Panel>
            <Panel className="p-5 xl:col-span-2">
              <h2 className="text-2xl">By condition</h2>
              <p className="mb-4 text-sm text-muted">Current mix of the patient roster.</p>
              <ConditionChart data={stats.byCondition} />
            </Panel>
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-5">
            <Panel className="p-5 xl:col-span-3">
              <h2 className="text-2xl">Patients per doctor</h2>
              <p className="mb-4 text-sm text-muted">Every doctor is included, including those with an empty roster.</p>
              {stats.patientsPerDoctor.length ? (
                <DoctorLoadChart data={stats.patientsPerDoctor} />
              ) : (
                <EmptyState title="No doctors yet" body="Add a doctor to start the roster." />
              )}
            </Panel>
            <Panel className="xl:col-span-2">
              <div className="border-b border-line px-5 py-4">
                <h2 className="text-2xl">Latest patients</h2>
              </div>
              {stats.recentPatients.length === 0 ? (
                <EmptyState title="No patients yet" body="New records will appear here." />
              ) : (
                <ul>
                  {stats.recentPatients.map((patient) => (
                    <li key={patient.id} className="border-b border-line px-5 py-3 last:border-b-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{patient.fullName}</p>
                          <p className="text-sm text-muted">
                            {patient.doctor ? (
                              <Link href={`/doctors/${patient.doctor.id}`} className="hover:text-pine">
                                {patient.doctor.name}
                              </Link>
                            ) : (
                              "Unassigned"
                            )}
                            {" · "}
                            {formatDate(patient.visitDate)}
                          </p>
                        </div>
                        <ConditionBadge condition={patient.condition} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  caption,
  accent = false,
}: {
  label: string;
  value: number;
  caption: string;
  accent?: boolean;
}) {
  return (
    <article className="rounded-3xl border border-line bg-card px-5 py-4 shadow-[0_12px_40px_rgba(20,36,31,0.04)]">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 font-display text-4xl ${accent ? "text-danger" : "text-ink"}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{caption}</p>
    </article>
  );
}
