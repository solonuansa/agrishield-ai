"use client";

import { Leaf, Shield, Sprout } from "lucide-react";
import type { TFunction } from "i18next";

export default function DecorativePanel({ t }: { t: TFunction }) {
  return (
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
  );
}
