"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiGetSafe, clearAuthToken, getAuthToken } from "../lib/api";

type MeResponse = {
  user: {
    userId: string;
    email: string;
    name?: string | null;
  };
};

export function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<MeResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const displayName = useMemo(() => {
    const name = (me?.name ?? "").trim();
    if (name) return name;
    return (me?.email ?? "").trim();
  }, [me?.email, me?.name]);

  const initials = useMemo(() => {
    const name = (me?.name ?? "").trim();
    if (name) {
      const parts = name.split(/\s+/).filter(Boolean);
      const first = parts[0]?.[0]?.toUpperCase() ?? "";
      const last =
        parts.length > 1
          ? (parts[parts.length - 1]?.[0]?.toUpperCase() ?? "")
          : "";
      return first + last || first || "U";
    }

    const email = (me?.email ?? "").trim();
    const first = email.charAt(0).toUpperCase();
    return first || "U";
  }, [me?.email, me?.name]);

  async function refreshMe() {
    const token = getAuthToken();
    if (!token) {
      setMe(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const res = await apiGetSafe<MeResponse>("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setMe(res?.user ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void refreshMe();

    function onAuthChanged() {
      void refreshMe();
    }

    function onStorage(e: StorageEvent) {
      if (e.key === "accessToken") {
        void refreshMe();
      }
    }

    window.addEventListener("auth-changed", onAuthChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth-changed", onAuthChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!open) return;
      const el = containerRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  function logout() {
    clearAuthToken();
    setMe(null);
    setOpen(false);
    router.push("/");
  }

  if (loading) {
    return (
      <div className="hidden md:flex">
        <div className="h-9 w-9 rounded-full border border-zinc-200 bg-white" />
      </div>
    );
  }

  if (!me) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Link
          href="/login"
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
          {initials}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
          <div className="px-4 py-3">
            <div className="text-xs text-zinc-500">Signed in as</div>
            <div className="mt-1 truncate text-sm font-semibold text-zinc-900">
              {displayName}
            </div>
          </div>
          <div className="h-px bg-zinc-100" />
          <div className="p-2">
            <Link
              href="#"
              className="block rounded-xl px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
            >
              Favourite Properties
            </Link>
            <Link
              href="#"
              className="block rounded-xl px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
            >
              Saved Searches
            </Link>
            <Link
              href="#"
              className="block rounded-xl px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
            >
              Account Settings
            </Link>
          </div>
          <div className="h-px bg-zinc-100" />
          <div className="p-2">
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
