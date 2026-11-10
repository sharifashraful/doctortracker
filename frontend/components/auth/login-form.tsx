"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClientError, api } from "@/lib/client";
import { Button, ErrorNote, controlClass } from "@/components/ui";

export function LoginForm({
  showDemo,
  demoEmail,
  demoPassword,
}: {
  showDemo: boolean;
  demoEmail: string;
  demoPassword: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failure, setFailure] = useState<unknown>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFailure(null);
    setFields({});
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const next = searchParams.get("next");
      const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      router.replace(destination);
      router.refresh();
    } catch (err) {
      setFailure(err);
      setFields(err instanceof ClientError ? err.fields ?? {} : {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-sidebar text-[#f6f1e8] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f3efe6] font-display text-xl text-sidebar">+</span>
            <span className="font-display text-2xl">Doctor Tracker</span>
          </div>
          <h1 className="mt-16 max-w-md text-5xl leading-[1.05]">The clinic registry, kept in order.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-[#d5ddd8]">
            Doctors, their patients, and the daily census live in one authenticated workspace. Search, filter, and read the numbers without leaving the record.
          </p>
        </div>
        <p className="text-sm text-[#b7c4be]">Private administrative access. Sessions stay in an httpOnly cookie.</p>
        <div className="pointer-events-none absolute -right-16 -bottom-20 h-64 w-64 rounded-full bg-copper/30 blur-3xl" />
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <p className="text-xs font-semibold tracking-[0.16em] text-copper uppercase lg:hidden">Doctor Tracker</p>
          <h2 className="text-4xl">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Use your clinic administrator account to open the portal.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Email</span>
              <input
                className={controlClass}
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              {fields.email ? <span className="mt-1 block text-xs text-danger">{fields.email}</span> : null}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Password</span>
              <input
                className={controlClass}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {fields.password ? <span className="mt-1 block text-xs text-danger">{fields.password}</span> : null}
            </label>
            {failure ? <ErrorNote error={failure} fallback="Could not sign in." /> : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Enter the portal"}
            </Button>
          </form>
          {showDemo && demoEmail ? (
            <div className="mt-6 rounded-2xl border border-line bg-card p-4 text-sm">
              <p className="font-medium">Reviewer access</p>
              <p className="mt-1 text-muted">
                {demoEmail}
                <br />
                {demoPassword}
              </p>
              <button
                type="button"
                className="mt-3 text-sm font-medium text-pine underline-offset-2 hover:underline"
                onClick={() => {
                  setEmail(demoEmail);
                  setPassword(demoPassword);
                }}
              >
                Use this account
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
