function Bar({ className }: { className: string }) {
  return <div className={`shimmer rounded-xl ${className}`} />;
}

function kindFor(path: string) {
  if (path === "/" || path === "") return "dashboard";
  if (/\/(new|edit)$/.test(path)) return "form";
  if (/^\/doctors\/[^/]+$/.test(path)) return "detail";
  return "list";
}

export function PageShimmer({ path = "" }: { path?: string }) {
  const kind = kindFor(path);

  if (kind === "dashboard") {
    return (
      <div aria-hidden>
        <Bar className="mb-3 h-4 w-36" />
        <Bar className="mb-3 h-10 w-64" />
        <Bar className="mb-8 h-4 w-full max-w-xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Bar key={index} className="h-28" />
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Bar className="h-64" />
          <Bar className="h-64" />
        </div>
      </div>
    );
  }

  if (kind === "form") {
    return (
      <div aria-hidden>
        <Bar className="mb-3 h-4 w-28" />
        <Bar className="mb-3 h-10 w-52" />
        <Bar className="mb-8 h-4 w-72" />
        <div className="max-w-3xl space-y-4 rounded-3xl bg-card p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Bar key={index} className="h-11" />
          ))}
        </div>
      </div>
    );
  }

  if (kind === "detail") {
    return (
      <div aria-hidden>
        <Bar className="mb-5 h-4 w-28" />
        <div className="mb-6 rounded-3xl bg-card p-6">
          <div className="flex gap-4">
            <Bar className="h-14 w-14 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Bar className="h-3 w-24" />
              <Bar className="h-8 w-56" />
              <Bar className="h-4 w-72" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Bar key={index} className="h-14" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="flex-1">
          <Bar className="mb-3 h-4 w-24" />
          <Bar className="mb-3 h-10 w-48" />
          <Bar className="h-4 w-full max-w-lg" />
        </div>
        <Bar className="h-11 w-32" />
      </div>
      <Bar className="mb-4 h-11" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Bar key={index} className="h-16" />
        ))}
      </div>
    </div>
  );
}
