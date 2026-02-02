"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, apiPost, setAuthToken } from "../../src/lib/api";

type LoginResponse = {
  user: { id: string; email: string; createdAt: string };
  accessToken: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getNextUrl(): string | null {
    if (typeof window === "undefined") return null;
    const sp = new URLSearchParams(window.location.search);
    const next = sp.get("next");
    if (!next) return null;
    const trimmed = next.trim();
    if (!trimmed.startsWith("/")) return null;
    return trimmed;
  }

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/signup");
  }, [router]);

  function toUserMessage(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        if ((err.message ?? "").toLowerCase().includes("not verified")) {
          return "Email not verified. Please complete verification from Sign up.";
        }
        return "Invalid email or password.";
      }
      if (err.status === 429)
        return "Too many attempts. Please try again later.";
      if (err.status >= 500)
        return err.message || "Server is unavailable. Please try again.";
      return err.message || "Login failed.";
    }
    return err instanceof Error ? err.message : "Login failed.";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (password.length < 8 || password.length > 64) {
        throw new Error("Password must be 8-64 characters");
      }
      if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password)) {
        throw new Error("Password must contain at least 1 letter and 1 number");
      }
      const res = await apiPost<
        LoginResponse,
        { email: string; password: string }
      >("/auth/login", { email, password });
      setAuthToken(res.accessToken);
      const nextUrl = getNextUrl();
      router.push(nextUrl ?? "/");
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
                Log in with Email
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Access saved searches and manage listings.
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
              Password
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-12 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
                  placeholder="Enter password"
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

            <div className="mt-3 text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Forgot password?
              </Link>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Logging in…" : "Log in"}
            </button>

            <div className="mt-5 text-center text-sm text-zinc-600">
              New to bayut?{" "}
              <Link
                href="/signup"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
