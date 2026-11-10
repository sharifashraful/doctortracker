"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; title: string; tone: "success" | "danger" };

let toasts: Toast[] = [];
const listeners = new Set<() => void>();
let nextId = 1;

function emit() {
  listeners.forEach((listener) => listener());
}

export function pushToast(toast: { title: string; tone?: Toast["tone"] }) {
  const item: Toast = { id: nextId++, title: toast.title, tone: toast.tone ?? "success" };
  toasts = [...toasts, item].slice(-4);
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((entry) => entry.id !== item.id);
    emit();
  }, 3400);
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>(toasts);

  useEffect(() => {
    const listener = () => setItems([...toasts]);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[80] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          role="status"
          className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-lg ${
            item.tone === "danger"
              ? "border-[#f0c9c4] bg-[#fff6f4] text-danger"
              : "border-[#cfe4db] bg-card text-pine-deep"
          }`}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
}
