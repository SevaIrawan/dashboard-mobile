"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, User2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string; redirectTo?: string }
        | null;
      if (!response.ok || !result?.ok) {
        setErrorMessage(result?.message || "Login gagal. Coba lagi.");
        return;
      }

      router.refresh();
      router.replace(
        typeof result.redirectTo === "string" && result.redirectTo.startsWith("/")
          ? result.redirectTo
          : "/myr",
      );
    } catch {
      setErrorMessage("Terjadi kendala saat login. Coba lagi beberapa saat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <label className="block">
        <div className="flex items-center gap-2 rounded-xl border border-[#b8c1d1] bg-[#d0d7e4] px-3 py-3 shadow-sm">
          <User2 className="h-4 w-4 text-[#5b2c86]" aria-hidden />
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-700/60"
            disabled={loading}
          />
        </div>
      </label>

      <label className="block">
        <div className="flex items-center gap-2 rounded-xl border border-[#b8c1d1] bg-[#d0d7e4] px-3 py-3 shadow-sm">
          <Lock className="h-4 w-4 text-amber-500" aria-hidden />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-700/60"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-white/40 hover:text-slate-800"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </label>

      {errorMessage ? (
        <p className="rounded-lg border border-red-300/70 bg-red-100/95 px-3 py-2 text-xs font-medium text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3469d6] px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-md shadow-[#1f3f8f]/35 transition hover:bg-[#2d5ec1] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            PROSES...
          </>
        ) : (
          "LOGIN"
        )}
      </button>
    </form>
  );
}
