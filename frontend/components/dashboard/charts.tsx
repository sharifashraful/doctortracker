"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { conditionColors } from "@/components/ui";
import type { StatsDTO } from "@/types";

function Tip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-2 text-sm shadow-lg">
      {label ? <p className="text-muted">{label}</p> : null}
      <p className="font-semibold text-ink">{payload[0]?.value ?? 0}</p>
    </div>
  );
}

export function CensusChart({ data }: { data: StatsDTO["timeline"] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e3dacb" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#5c6a63", fontSize: 12 }} axisLine={false} tickLine={false} interval={4} />
          <YAxis allowDecimals={false} tick={{ fill: "#5c6a63", fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<Tip />} />
          <Area type="monotone" dataKey="patients" stroke="#0e6b56" fill="#0e6b56" fillOpacity={0.16} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DoctorLoadChart({ data }: { data: StatsDTO["patientsPerDoctor"] }) {
  const height = Math.max(240, data.length * 34);
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            interval={0}
            tick={{ fill: "#14241f", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<Tip />} />
          <Bar dataKey="count" fill="#0e6b56" radius={[0, 8, 8, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConditionChart({ data }: { data: StatsDTO["byCondition"] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="condition" innerRadius={48} outerRadius={72} paddingAngle={2} stroke="#fffdf8">
              {data.map((entry) => (
                <Cell key={entry.condition} fill={conditionColors[entry.condition as keyof typeof conditionColors] ?? "#5c6a63"} />
              ))}
            </Pie>
            <Tooltip content={<Tip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2 text-sm">
        {data.map((entry) => (
          <li key={entry.condition} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: conditionColors[entry.condition as keyof typeof conditionColors] }}
              />
              {entry.condition}
            </span>
            <span className="text-muted">
              {entry.count}
              {total ? ` · ${Math.round((entry.count / total) * 100)}%` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
