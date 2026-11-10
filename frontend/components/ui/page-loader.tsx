export function PageLoader() {
  return (
    <div className="grid min-h-[42vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-sm text-muted">
        <span
          className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-pine motion-reduce:animate-none"
          aria-hidden
        />
        Loading
      </div>
    </div>
  );
}
