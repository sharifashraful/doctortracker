"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import { presentError, type PresentedError } from "@/lib/errors";

export function useQueryState() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      const resetPage = !Object.prototype.hasOwnProperty.call(patch, "page");
      for (const [key, value] of Object.entries(patch)) {
        if (!value) next.delete(key);
        else next.set(key, value);
      }
      if (resetPage) next.delete("page");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, sp],
  );

  return { sp, setParams };
}

export function useDebouncedValue(external: string, onCommit: (value: string) => void, delay = 300) {
  const [value, setValue] = useState(external);
  const externalRef = useRef(external);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    externalRef.current = external;
    setValue(external);
  }, [external]);

  useEffect(() => {
    if (value === externalRef.current) return;
    const timer = window.setTimeout(() => {
      if (value !== externalRef.current) onCommitRef.current(value);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return [value, setValue] as const;
}

export function useResource<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [failure, setFailure] = useState<PresentedError | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setFailure(null);
    api<T>(url, { signal: controller.signal })
      .then((body) => {
        if (!controller.signal.aborted) setData(body);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError" || controller.signal.aborted) return;
        setFailure(presentError(err, "The request failed."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [tick, url]);

  return { data, error: failure?.message ?? null, failure, loading, reload };
}
