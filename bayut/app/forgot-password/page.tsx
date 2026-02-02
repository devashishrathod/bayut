"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, apiPost } from "../../src/lib/api";

type ForgotPasswordResponse = { requested: boolean };

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    router.prefetch("/login");
  }, [router]);

  function toUserMessage(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.status >= 500)
        return err.message || "Server is unavailable. Please try again.";
      return err.message || "Request failed.";
    }
    return err instanceof Error ? err.message : "Request failed.";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiPost<ForgotPasswordResponse, { email: string }>(
        "/auth/password/forgot",
        { email },
      );
      setSuccess("Reset link sent. Please check your inbox.");
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-zinc-950">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2400&q=80"
          alt="City skyline"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/95 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
            <div>
              <h1 className="text-lg font-semibold text-zinc-900">
                Forgot password
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                We’ll email you a secure reset link.
              </p>
            </div>
            <Link
              href="/"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              bayut
            </Link>
          </div>

          <form onSubmit={onSubmit} className="px-6 py-6">
            <label className="block text-sm font-medium text-zinc-800">
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
                placeholder="Enter email"
              />
            </label>

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Sending…" : "Send reset link"}
            </button>

            <div className="mt-5 text-center text-sm text-zinc-600">
              Remembered your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
