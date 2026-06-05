"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Leaf, Shield, Sprout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost, ApiError } from "@/lib/api";
import { writeSession } from "@/lib/auth";
import type { TokenResponse } from "@/types/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/useToast";
import { fadeUp } from "@/lib/motion";

type AuthMode = "login" | "register";

function getSearchParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function tabClass(active: boolean): string {
  return `flex-1 text-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
    active
      ? "bg-white shadow-sm text-forest-800"
      : "text-ink-muted hover:text-ink"
  }`;
}

export default function LoginPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mode: AuthMode =
    getSearchParam("mode") === "register" ? "register" : "login";

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
    setFieldErrors({});

    if (mode === "register" && fullName.trim().length < 3) {
      setFieldErrors({ fullName: t("login.nameTooShort") });
      return;
    }

    if (password.length < 8) {
      setFieldErrors({ password: t("login.passwordTooShort") });
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

      toast.success(
        mode === "login" ? t("login.loginSuccess") : t("login.registerSuccess"),
      );

      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.replace(nextPath);
        }, 800);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t("common.error"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ---------- LEFT: Form ---------- */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-[60%]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* ---- Tab Pill Toggle ---- */}
          <div className="mb-10 flex gap-1 rounded-full bg-cream-200/60 p-1">
            <Link href="/login" className={tabClass(mode === "login")}>
              {t("login.login")}
            </Link>
            <Link href="/login?mode=register" className={tabClass(mode === "register")}>
              {t("login.register")}
            </Link>
          </div>

          {/* ---- Heading ---- */}
          <div className="mb-8 space-y-2">
            <AnimatePresence mode="wait">
              <motion.p
                key={`kicker-${mode}`}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="section-kicker"
              >
                {mode === "login" ? t("login.login") : t("login.register")}
              </motion.p>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${mode}`}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="page-title max-w-[18ch]"
              >
                {mode === "login"
                  ? t("login.loginTitle")
                  : t("login.registerTitle")}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* ---- Form ---- */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="name-field"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                    <Input
                      id="fullName"
                      label={t("login.fullName")}
                      type="text"
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder={t("login.fullNamePlaceholder")}
                      error={fieldErrors.fullName}
                    />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              id="email"
              label={t("login.email")}
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("login.emailPlaceholder")}
              error={fieldErrors.email}
            />

            <div className="relative">
              <Input
                id="password"
                label={t("login.password")}
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("login.passwordPlaceholder")}
                className="pr-10"
                error={fieldErrors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-[2.8rem] -translate-y-1/2 rounded p-1 text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-600"
                aria-label={
                  showPassword ? t("login.hidePassword") : t("login.showPassword")
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === "login" && (
                <motion.div
                  key="remember-row"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex items-center justify-between pt-1"
                >
                  <label className="flex items-center gap-2 text-sm text-ink-muted cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-cream-darker text-forest-600 focus:ring-forest-500"
                    />
                    {t("login.rememberMe")}
                  </label>
                  <Link
                    href="#"
                    className="text-sm text-ink-muted hover:text-forest-700 transition-colors"
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {errorMessage && (
              <p className="rounded border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay-dark">
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="mt-2 w-full"
            >
              {mode === "login" ? t("login.loginButton") : t("login.registerButton")}
            </Button>
          </form>

          {/* ---- Mode Switch Link ---- */}
          <div className="mt-8 border-t border-cream-darker/40 pt-6 text-base text-ink-muted">
            {mode === "login" ? (
              <>
                {t("login.noAccount")}{" "}
                <Link
                  href="/login?mode=register"
                  className="font-medium text-forest-700 hover:text-forest-800 transition-colors"
                >
                  {t("login.registerLink")}
                </Link>
              </>
            ) : (
              <>
                {t("login.hasAccount")}{" "}
                <Link
                  href="/login"
                  className="font-medium text-forest-700 hover:text-forest-800 transition-colors"
                >
                  {t("login.loginLink")}
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* ---------- RIGHT: Decorative Panel ---------- */}
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-forest-800 lg:flex lg:w-[40%]">
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -left-12 top-1/4 h-64 w-64 rounded-full bg-forest-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-1/4 h-80 w-80 rounded-full bg-forest-500/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest-400/10 blur-3xl" />

        {/* Decorative icons */}
        <div className="relative mb-10">
          <Sprout className="h-24 w-24 text-cream-100/80" strokeWidth={1.5} />
          <Leaf className="absolute -right-6 -top-3 h-10 w-10 text-forest-300/50" strokeWidth={1.5} />
          <Shield className="absolute -bottom-1 -left-4 h-8 w-8 text-forest-400/40" strokeWidth={1.5} />
        </div>

        {/* Brand name */}
        <h2 className="mb-3 font-serif text-3xl font-bold tracking-wide text-cream-100">
          AgriShield
        </h2>

        {/* Tagline */}
        <p className="text-lg text-cream-200/80">
          {t("login.decorativeTagline")}
        </p>
      </div>
    </div>
  );
}
