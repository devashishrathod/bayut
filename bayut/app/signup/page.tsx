"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiPost, setAuthToken } from "../../src/lib/api";

type RegisterResponse = {
  user: { id: string; email: string; createdAt: string };
  accessToken: string;
};

type RegisterStartResponse = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    phone?: string | null;
  };
  otpSent: boolean;
};

type RegisterVerifyResponse = {
  user: { id: string; email: string; name?: string | null; createdAt: string };
  accessToken: string;
  verified: boolean;
};

type Step = "account" | "details" | "otp";

const DRAFT_KEY = "bayut-signup-draft-v1";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("account");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/login");
  }, [router]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        step?: Step;
        email?: string;
        password?: string;
        name?: string;
        phone?: string;
        otpSentTo?: string;
      };
      if (draft.email) setEmail(draft.email);
      if (draft.password) {
        setPassword(draft.password);
        setConfirmPassword(draft.password);
      }
      if (draft.name) setName(draft.name);
      if (draft.phone) setPhone(draft.phone);
      if (draft.otpSentTo) setOtpSentTo(draft.otpSentTo);
      if (draft.step) setStep(draft.step);
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  const draft = useMemo(
    () => ({ step, email, password, name, phone, otpSentTo }),
    [step, email, password, name, phone, otpSentTo],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [draft]);

  function toUserMessage(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.status === 409)
        return "Email already registered. Try logging in.";
      if (err.status === 429)
        return "Too many attempts. Please try again later.";
      if (err.status >= 500)
        return err.message || "Server is unavailable. Please try again.";
      return err.message || "Signup failed.";
    }
    return err instanceof Error ? err.message : "Signup failed.";
  }

  async function startSignup() {
    setSubmitting(true);
    setError(null);

    try {
      if (!name.trim()) throw new Error("Please enter your name");
      if (!phone.trim()) throw new Error("Please enter your mobile number");
      const phoneTrimmed = phone.trim();
      if (!/^\+?[0-9]{9,15}$/.test(phoneTrimmed)) {
        throw new Error(
          "Mobile number must be 9-15 digits (optionally starting with +country code)",
        );
      }
      const res = await apiPost<
        RegisterStartResponse,
        { email: string; password: string; name: string; phone: string }
      >("/auth/register/start", {
        email,
        password,
        name: name.trim(),
        phone: phoneTrimmed,
      });
      if (!res?.otpSent) throw new Error("Failed to send OTP");
      setOtpSentTo(res.user.email);
      setStep("otp");
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyOtp() {
    setSubmitting(true);
    setError(null);
    try {
      const cleaned = otp.replace(/\s+/g, "");
      if (cleaned.length < 4) throw new Error("Please enter the OTP");
      const res = await apiPost<
        RegisterVerifyResponse,
        { email: string; otp: string }
      >("/auth/register/verify", { email, otp: cleaned });
      setAuthToken(res.accessToken);
      window.localStorage.removeItem(DRAFT_KEY);
      router.push("/");
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function resendOtp() {
    setSubmitting(true);
    setError(null);
    try {
      await apiPost<{ otpSent: boolean }, { email: string }>(
        "/auth/register/resend",
        { email },
      );
      setOtpSentTo(email);
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
                Create an account
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Save favourites and manage listings.
              </p>
            </div>
            <Link
              href="/"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              bayut
            </Link>
          </div>

          <div className="px-6 py-6">
            {step === "account" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setError(null);
                  const trimmedPassword = password;
                  if (
                    trimmedPassword.length < 8 ||
                    trimmedPassword.length > 64
                  ) {
                    setError("Password must be 8-64 characters");
                    return;
                  }
                  if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(trimmedPassword)) {
                    setError(
                      "Password must contain at least 1 letter and 1 number",
                    );
                    return;
                  }
                  if (password !== confirmPassword) {
                    setError("Passwords do not match");
                    return;
                  }
                  setStep("details");
                }}
              >
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
                      placeholder="Create password"
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

                <label className="mt-4 block text-sm font-medium text-zinc-800">
                  Confirm password
                  <div className="relative mt-2">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-12 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
                      placeholder="Repeat password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

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
                  Next
                </button>

                <div className="mt-5 text-center text-sm text-zinc-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Log in
                  </Link>
                </div>
              </form>
            ) : null}

            {step === "details" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void startSignup();
                }}
              >
                <div className="text-sm font-semibold text-zinc-900">
                  Almost there
                </div>
                <div className="mt-1 text-sm text-zinc-600">
                  To ensure a personalised experience, we just need a few more
                  details.
                </div>

                <label className="mt-4 block text-sm font-medium text-zinc-800">
                  Full name
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
                    placeholder="Devashish Rathod"
                  />
                </label>

                <label className="mt-4 block text-sm font-medium text-zinc-800">
                  Mobile number
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
                    placeholder="+971..."
                  />
                </label>

                <div className="mt-4 text-xs text-zinc-600">
                  By tapping Submit and Create Account, you agree to
                  Bayut&apos;s Terms &amp; Conditions and Privacy Policy.
                </div>

                {error ? (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep("account");
                    }}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? "Sending OTP…" : "Submit and Create Account"}
                  </button>
                </div>

                <div className="mt-5 text-center text-sm text-zinc-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Log in
                  </Link>
                </div>
              </form>
            ) : null}

            {step === "otp" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void verifyOtp();
                }}
              >
                <div className="text-sm font-semibold text-zinc-900">
                  Verify your email
                </div>
                <div className="mt-1 text-sm text-zinc-600">
                  Enter the OTP sent to{" "}
                  <span className="font-semibold text-zinc-900">
                    {otpSentTo ?? email}
                  </span>
                </div>

                <label className="mt-5 block text-sm font-medium text-zinc-800">
                  OTP
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-center text-lg font-semibold tracking-[0.6em] text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
                    placeholder="_ _ _ _"
                    maxLength={6}
                  />
                </label>

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
                  {submitting ? "Verifying…" : "Verify"}
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void resendOtp()}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Resend OTP
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep("details");
                  }}
                  className="mt-3 w-full text-center text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Edit details
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
