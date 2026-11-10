import { CONDITIONS } from "@/lib/constants";

const conditionStyles: Record<string, string> = {
  Critical: "bg-[#f8e8e4] text-[#7a2424]",
  Chronic: "bg-[#f8efd8] text-[#7a5410]",
  Observation: "bg-[#e7eef6] text-[#2c4668]",
  Recovering: "bg-[#e5f3ee] text-[#0e6b56]",
  Stable: "bg-[#e7f2e4] text-[#2c5a34]",
};

export function ConditionBadge({ condition }: { condition: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${conditionStyles[condition] ?? "bg-paper text-ink"}`}>
      {condition}
    </span>
  );
}

export const conditionColors: Record<(typeof CONDITIONS)[number], string> = {
  Critical: "#9d2c2c",
  Chronic: "#9a6412",
  Observation: "#3d5a80",
  Recovering: "#0e6b56",
  Stable: "#3f7d4e",
};
