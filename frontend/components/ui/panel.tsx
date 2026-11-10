import type { ReactNode } from "react";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-3xl border border-line bg-card shadow-[0_12px_40px_rgba(20,36,31,0.04)] ${className}`}>
      {children}
    </section>
  );
}
