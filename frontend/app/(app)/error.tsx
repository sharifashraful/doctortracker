"use client";

import { Button } from "@/components/ui";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-3xl border border-line bg-card px-6 py-16 text-center">
      <h1 className="text-3xl">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">{error.message || "The page failed to render. You can try it again."}</p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
