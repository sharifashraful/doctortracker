"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { LayoutDashboard, LogOut, Menu, Stethoscope, Users, X } from "lucide-react";
import { api, ClientError } from "@/lib/client";
import { errorTitle } from "@/lib/errors";
import { colorFromName, initials } from "@/lib/format";
import { pushToast } from "@/components/layout/toast";
import { Button, ErrorNote } from "@/components/ui";
import { PageShimmer } from "@/components/ui/page-shimmer";
import type { SessionUser } from "@/types";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/patients", label: "Patients", icon: Users },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [gateError, setGateError] = useState<unknown>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api<{ data: SessionUser }>("/api/auth/me")
      .then((body) => {
        if (!active) return;
        setUser(body.data);
        setReady(true);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ClientError && error.code === "UNAUTHORIZED") {
          router.replace("/login");
          return;
        }
        setGateError(error);
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    setOpen(false);
    setPendingPath(null);
  }, [pathname]);

  function onNavigateClick(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
    let url: URL;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin || url.pathname === pathname) return;
    setPendingPath(url.pathname);
  }

  async function logout() {
    try {
      await api("/api/auth/logout", { method: "POST" });
      pushToast({ title: "Signed out" });
      window.location.href = "/login";
    } catch (error) {
      pushToast({ tone: "danger", title: errorTitle(error, "Could not sign out.") });
    }
  }

  if (gateError) {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="w-full max-w-md">
          <ErrorNote error={gateError} fallback="The registry could not be opened." />
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!ready || !user) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted">Opening the registry…</div>;
  }

  return (
    <div className="min-h-screen" onClickCapture={onNavigateClick}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[90] focus:rounded-lg focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      {open ? (
        <button className="fixed inset-0 z-40 bg-[#101c19]/50 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)} />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] flex-col bg-sidebar text-[#f4efe6] lg:flex ${
          open ? "flex" : "hidden"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f3efe6] text-lg font-semibold text-sidebar">
              +
            </span>
            <span>
              <span className="block font-display text-lg leading-none">Doctor Tracker</span>
              <span className="mt-1 block text-[11px] tracking-[0.14em] text-[#c8d5cf] uppercase">Clinical admin</span>
            </span>
          </Link>
          <button className="rounded-lg p-2 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                  active ? "bg-white/10 text-white" : "text-[#d5ddd8] hover:bg-white/6"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
              style={{ background: colorFromName(user?.name ?? "Admin") }}
            >
              {initials(user?.name ?? "Admin")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name ?? "Loading…"}</p>
              <p className="truncate text-xs text-[#b7c4be]">{user?.email ?? " "}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-[#f4efe6] hover:bg-white/8"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0 lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line/80 bg-paper/85 px-4 py-3 backdrop-blur lg:hidden">
          <button className="rounded-xl border border-line bg-card p-2" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu size={18} />
          </button>
          <p className="font-display text-lg">Doctor Tracker</p>
          <span className="w-9" />
        </header>
        <main id="main" aria-busy={pendingPath ? true : undefined} className="mx-auto w-full min-w-0 max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {pendingPath ? (
            <>
              <p className="sr-only">Loading page</p>
              <PageShimmer path={pendingPath} />
            </>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
