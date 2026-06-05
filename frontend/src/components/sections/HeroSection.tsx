"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Scan, Leaf, Shield } from "lucide-react";

export default function HeroSection() {
  const { t } = useTranslation();

  const highlights = [
    t("hero.highlight1"),
    t("hero.highlight2"),
    t("hero.highlight3"),
  ];

  return (
    <section className="relative overflow-hidden bg-forest-900 text-cream">
      {/* Grain noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-clay/12 blur-[100px]" />
      <div className="pointer-events-none absolute -left-20 top-1/3 h-[20rem] w-[20rem] rounded-full bg-forest-300/10 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[16rem] w-[16rem] rounded-full bg-clay/8 blur-[80px]" />

      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left content */}
          <div className="lg:col-span-6">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-clay-light"
            >
              {t("hero.kicker")}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="font-serif text-[2.8rem] font-semibold leading-[0.98] tracking-tight sm:text-5xl lg:text-[3.4rem]"
            >
              {t("hero.title1")}{" "}
              <span className="italic text-clay-light">{t("hero.titleEmphasis")}</span>{" "}
              {t("hero.title2")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-5 max-w-lg text-base leading-relaxed text-cream/85 lg:text-[1.05rem]"
            >
              {t("hero.description")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/scan"
                className="inline-flex items-center justify-center rounded-full bg-clay px-6 py-2.5 text-sm font-semibold tracking-wide text-cream transition-colors hover:bg-clay-dark"
              >
                {t("hero.ctaScan")}
              </Link>
              <Link
                href="#fitur"
                className="inline-flex items-center justify-center rounded-full border border-cream/25 px-6 py-2.5 text-sm font-medium tracking-wide text-cream/80 transition-colors hover:border-cream/45 hover:text-cream"
              >
                {t("hero.ctaLearn")}
              </Link>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.42, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-7 grid max-w-lg gap-1.5 text-sm text-cream/80"
            >
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-2 h-[5px] w-[5px] shrink-0 rounded-full bg-clay-light" />
                  <span>{item}</span>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Right visual composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative lg:col-span-6"
          >
            <div className="relative mx-auto max-w-[22rem] lg:mx-0 lg:ml-auto">
              {/* Phone frame */}
              <div className="relative overflow-hidden rounded-[2.2rem] border-[3px] border-cream/10 bg-forest-800 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.6)]">
                {/* Phone notch area */}
                <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-forest-900/90 backdrop-blur-sm" />

                {/* Screen content — scan preview */}
                <div className="p-3 pt-8">
                  <div className="space-y-2.5">
                    {/* Image placeholder — diseased leaf */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-forest-700">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Leaf className="h-16 w-16 text-forest-500/40" strokeWidth={1} />
                      </div>
                      {/* Scan overlay */}
                      <div className="absolute inset-x-4 top-4 flex items-center gap-2 rounded-full bg-forest-900/70 px-3 py-1.5 backdrop-blur-md">
                        <Scan className="h-3.5 w-3.5 text-clay-light" />
                        <span className="text-[0.7rem] font-semibold text-cream/90">{t("hero.phoneScanning")}</span>
                      </div>
                      {/* Corner markers */}
                      <div className="absolute inset-3 border border-cream/20" />
                      <div className="absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-clay-light" />
                      <div className="absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-clay-light" />
                      <div className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-clay-light" />
                      <div className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-clay-light" />
                    </div>

                    {/* Result card */}
                    <div className="rounded-xl border border-cream/10 bg-forest-700/60 p-3.5 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-cream/60">{t("hero.phoneResult")}</p>
                          <p className="mt-0.5 font-serif text-lg font-semibold text-cream">Blast Padi</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-clay-light/40">
                          <span className="text-xs font-bold text-clay-light">87%</span>
                        </div>
                      </div>
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-forest-900/50">
                        <div className="h-full w-[87%] rounded-full bg-clay-light" />
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-cream/10 bg-forest-700/40 px-3 py-2">
                        <p className="text-[0.6rem] uppercase tracking-wider text-cream/55">{t("hero.phoneCrop")}</p>
                        <p className="mt-0.5 text-xs font-semibold text-cream/90">{t("crop.rice")}</p>
                      </div>
                      <div className="rounded-lg border border-cream/10 bg-forest-700/40 px-3 py-2">
                        <p className="text-[0.6rem] uppercase tracking-wider text-cream/55">{t("hero.phoneStatus")}</p>
                        <p className="mt-0.5 text-xs font-semibold text-clay-light">{t("hero.phoneDisease")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge — top right */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute -right-4 top-8 z-20 rounded-xl border border-cream/10 bg-forest-800/95 px-3.5 py-2.5 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-clay/20">
                    <Shield className="h-3.5 w-3.5 text-clay-light" />
                  </div>
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-wider text-cream/60">{t("hero.phoneProtected")}</p>
                    <p className="text-[0.75rem] font-semibold text-cream">AgriShield AI</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating stat — bottom left */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute -bottom-3 -left-6 z-20 rounded-xl border border-cream/10 bg-forest-800/95 px-4 py-3 shadow-lg backdrop-blur-md"
              >
                <p className="text-[0.6rem] font-bold uppercase tracking-wider text-cream/60">{t("hero.phoneScans")}</p>
                <p className="mt-0.5 font-serif text-xl font-semibold text-cream">12.450+</p>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  <span className="text-[0.65rem] text-cream/60">{t("hero.phoneActive")}</span>
                </div>
              </motion.div>

              {/* Decorative ring */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full border border-cream/5" />
              <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full border border-cream/5" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
