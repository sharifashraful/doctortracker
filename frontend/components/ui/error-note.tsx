import { presentError } from "@/lib/errors";

export function ErrorNote({ error, fallback }: { error: unknown; fallback?: string }) {
  const presented = presentError(error, fallback);
  const same = presented.message.trim().toLowerCase() === presented.label.trim().toLowerCase();
  return (
    <div role="alert" className="rounded-2xl border border-[#f0c9c4] bg-[#fff6f4] px-4 py-3 text-sm text-danger">
      <p className="font-medium">{presented.label}</p>
      {same ? null : <p className="mt-1 leading-6">{presented.message}</p>}
    </div>
  );
}
