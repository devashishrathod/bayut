"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ApiError, apiPost } from "../../src/lib/api";

type ResetPasswordResponse = { reset: boolean };

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();

  const emailFromUrl = useMemo(() => params.get("email") ?? "", [params]);
  const tokenFromUrl = useMemo(() => params.get("token") ?? "", [params]);

  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    router.prefetch("/login");
  }, [router]);

  useEffect(() => {
    setEmail(emailFromUrl);
  }, [emailFromUrl, tokenFromUrl]);

  function toUserMessage(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.status >= 500)
        return err.message || "Server is unavailable. Please try again.";
      return err.message || "Reset failed.";
    }
    return err instanceof Error ? err.message : "Reset failed.";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!email.trim() || !tokenFromUrl.trim()) {
      setSubmitting(false);
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    const tokenTrimmed = tokenFromUrl.trim();
    if (tokenTrimmed.length !== 64 || !/^[0-9a-f]+$/i.test(tokenTrimmed)) {
      setSubmitting(false);
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    if (password.length < 8 || password.length > 64) {
      setSubmitting(false);
      setError("Password must be 8-64 characters");
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password)) {
      setSubmitting(false);
      setError("Password must contain at least 1 letter and 1 number");
      return;
    }

    try {
      await apiPost<
        ResetPasswordResponse,
        { email: string; token: string; password: string }
      >("/auth/password/reset", { email, token: tokenTrimmed, password });

      setSuccess("Password updated. You can now log in.");
      setTimeout(() => router.push("/login"), 900);
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
                Reset password
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Choose a new password for your account.
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

            <label className="mt-4 block text-sm font-medium text-zinc-800">
              New password
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-12 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
                  placeholder="At least 8 chars (letter + number)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
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
              {submitting ? "Updating…" : "Update password"}
            </button>

            <div className="mt-5 text-center text-sm text-zinc-600">
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}
