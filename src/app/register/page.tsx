"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CircuitBoard } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email") || "",
          password: form.get("password"),
          terms: form.get("terms") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/dashboard/student");
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
            Create your free account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Phone + password — no OTP required for now.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-muted" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                name="name"
                required
                className="input-field"
                placeholder="Your name"
              />
            </div>
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
              <label className="mb-1.5 block text-sm text-muted" htmlFor="email">
                Email <span className="text-muted/60">(optional)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
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
                minLength={6}
                className="input-field"
                placeholder="Min. 6 characters"
              />
            </div>
            <label className="flex items-start gap-2 text-sm text-muted">
              <input
                type="checkbox"
                name="terms"
                required
                className="mt-1 accent-[var(--trace)]"
              />
              I agree to the Terms & Conditions and consent to storage of my
              phone number under DPDP guidelines.
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
              {loading ? "Creating account…" : "Register Free"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-trace hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
