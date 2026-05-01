"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { apiPost, ApiError } from "@/lib/api";
import { writeSession } from "@/lib/auth";
import type { TokenResponse } from "@/types/api";

type AuthMode = "login" | "register";

function getSearchParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const mode: AuthMode = getSearchParam("mode") === "register" ? "register" : "login";

  const nextPath = useMemo(() => {
    const rawNext = getSearchParam("next");
    if (!rawNext) return "/dashboard";

    try {
      const decodedNext = decodeURIComponent(rawNext);
      return decodedNext.startsWith("/") ? decodedNext : "/dashboard";
    } catch {
      return rawNext.startsWith("/") ? rawNext : "/dashboard";
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (mode === "register" && fullName.trim().length < 3) {
      setErrorMessage("Nama minimal 3 karakter.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password minimal 8 karakter.");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { email, password, full_name: fullName.trim() };

      const data = await apiPost<TokenResponse>(endpoint, payload);

      writeSession({
        token: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user,
      });

      if (typeof window !== "undefined") {
        window.location.replace(nextPath);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Terjadi kesalahan. Coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-20 sm:py-24">
      <div className="mb-10 space-y-3">
        <p className="section-kicker">{mode === "login" ? "Masuk" : "Daftar"}</p>
        <h1 className="page-title max-w-[18ch]">
          {mode === "login" ? "Selamat datang kembali." : "Bergabung dengan AgriShield."}
        </h1>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {mode === "register" && (
          <div className="space-y-2">
            <label className="field-label" htmlFor="fullName">
              Nama Lengkap
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nama Anda"
              className="field-input"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            className="field-input"
          />
        </div>

        <div className="space-y-2">
          <label className="field-label" htmlFor="password">
            Kata Sandi
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
              className="field-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-600"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mode === "login" && (
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-cream-darker text-forest-600 focus:ring-forest-500"
              />
              Ingat saya
            </label>
            <Link href="#" className="text-sm text-ink-muted hover:text-forest-700 transition-colors">
              Lupa sandi?
            </Link>
          </div>
        )}

        {errorMessage && (
          <p className="rounded border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay-dark">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Memproses..."
            : mode === "login"
              ? "Masuk"
              : "Daftar Gratis"}
        </button>
      </form>

      <div className="mt-8 border-t border-cream-darker/40 pt-6 text-base text-ink-muted">
        {mode === "login" ? (
          <>
            Belum punya akun?{" "}
            <Link href="/login?mode=register" className="font-medium text-forest-700 hover:text-forest-800 transition-colors">
              Daftar gratis
            </Link>
          </>
        ) : (
          <>
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-forest-700 hover:text-forest-800 transition-colors">
              Masuk
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
