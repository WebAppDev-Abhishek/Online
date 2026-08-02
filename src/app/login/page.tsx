"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CircuitBoard } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.get("phone"),
          password: form.get("password"),
          remember: form.get("remember") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      const dest =
        data.user?.role === "ADMIN"
          ? "/dashboard/admin"
          : "/dashboard/student";
      router.push(dest);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg pcb-grid">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <CircuitBoard className="h-7 w-7 text-trace" />
          <span className="font-[family-name:var(--font-display)] text-xl font-bold">
            PCB<span className="text-trace">Online</span>
          </span>
        </Link>

        <div className="card-surface p-6 sm:p-8">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted">
            Login with your phone number and password.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-muted" htmlFor="phone">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                required
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                className="input-field"
                placeholder="10-digit mobile"
              />
            </div>
            <div>
              <label
                className="mb-1.5 block text-sm text-muted"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="Your password"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                name="remember"
                className="accent-[var(--trace)]"
              />
              Remember this device
            </label>

            {error && (
              <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            New here?{" "}
            <Link
              href="/register"
              className="font-semibold text-trace hover:underline"
            >
              Register free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
