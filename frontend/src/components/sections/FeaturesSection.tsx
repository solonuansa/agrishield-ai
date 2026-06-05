"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  BellRing,
  Camera,
  Compass,
  FileText,
  Users,
} from "lucide-react";

function useFeatures(t: (key: string) => string) {
  return [
    {
      id: "deteksi",
      num: t("features.detection.num"),
      title: t("features.detection.title"),
      summary: t("features.detection.summary"),
      detail: t("features.detection.detail"),
      points: [
        t("features.detection.points.0"),
        t("features.detection.points.1"),
        t("features.detection.points.2"),
      ],
      icon: Camera,
    },
    {
      id: "saran",
      num: t("features.guidance.num"),
      title: t("features.guidance.title"),
      summary: t("features.guidance.summary"),
      detail: t("features.guidance.detail"),
      points: [
        t("features.guidance.points.0"),
        t("features.guidance.points.1"),
        t("features.guidance.points.2"),
      ],
      icon: FileText,
    },
    {
      id: "peta",
      num: t("features.map.num"),
      title: t("features.map.title"),
      summary: t("features.map.summary"),
      detail: t("features.map.detail"),
      points: [
        t("features.map.points.0"),
        t("features.map.points.1"),
        t("features.map.points.2"),
      ],
      icon: Compass,
    },
    {
      id: "peringatan",
      num: t("features.alert.num"),
      title: t("features.alert.title"),
      summary: t("features.alert.summary"),
      detail: t("features.alert.detail"),
      points: [
        t("features.alert.points.0"),
        t("features.alert.points.1"),
        t("features.alert.points.2"),
      ],
      icon: BellRing,
    },
    {
      id: "analitik",
      num: t("features.analytics.num"),
      title: t("features.analytics.title"),
      summary: t("features.analytics.summary"),
      detail: t("features.analytics.detail"),
      points: [
        t("features.analytics.points.0"),
        t("features.analytics.points.1"),
        t("features.analytics.points.2"),
      ],
      icon: Activity,
    },
    {
      id: "komunitas",
      num: t("features.community.num"),
      title: t("features.community.title"),
      summary: t("features.community.summary"),
      detail: t("features.community.detail"),
      points: [
        t("features.community.points.0"),
        t("features.community.points.1"),
        t("features.community.points.2"),
      ],
      icon: Users,
    },
  ];
}

export default function FeaturesSection() {
  const { t } = useTranslation();
  const features = useFeatures(t);
  const [activeId, setActiveId] = useState(features[0].id);
  const reduceMotion = useReducedMotion();

  const activeFeature = useMemo(
    () => features.find((item) => item.id === activeId) ?? features[0],
    [activeId],
  );

  return (
    <section id="fitur" className="bg-cream py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-10 lg:mb-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.17em] text-clay">{t("features.sectionTitle")}</p>
          <h2 className="max-w-2xl font-serif text-4xl font-semibold leading-[1.03] text-forest-700 sm:text-5xl">
            {t("features.sectionHeading")}
            <span className="italic text-forest-600"> {t("features.sectionHeadingEmphasis")}</span>.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted lg:text-lg">
            {t("features.sectionDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="grid gap-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                const isActive = feature.id === activeFeature.id;

                return (
                  <button
                    key={feature.id}
                    type="button"
                    onFocus={() => setActiveId(feature.id)}
                    onClick={() => setActiveId(feature.id)}
                    className={`group flex w-full items-start justify-between gap-4 border px-4 py-4 text-left transition-colors sm:px-5 ${
                      isActive
                        ? "border-forest-300 bg-forest-50/70"
                        : "border-cream-darker/70 bg-cream hover:border-forest-200 hover:bg-forest-50/30"
                    }`}
                    aria-pressed={isActive}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 inline-flex h-8 w-8 items-center justify-center border text-xs font-semibold ${
                          isActive
                            ? "border-forest-200 bg-forest-600 text-cream"
                            : "border-cream-darker/80 bg-cream text-ink-muted"
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.8} />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-clay">{feature.num}</p>
                        <p className="mt-1 text-lg font-semibold text-forest-700">{feature.title}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{feature.summary}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="relative min-h-[21rem] overflow-hidden border border-cream-darker/70 bg-forest-700 p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-clay/18" />
              <div className="pointer-events-none absolute -left-12 bottom-2 h-40 w-40 rounded-full bg-forest-300/12" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
                  className="relative"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-light">
                    {t("features.sectionTitle")} {activeFeature.num}
                  </p>
                  <h3 className="mt-3 max-w-lg font-serif text-4xl font-semibold leading-[0.98] text-cream sm:text-5xl">
                    {activeFeature.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-cream/85 sm:text-lg">
                    {activeFeature.detail}
                  </p>

                  <ul className="mt-6 grid gap-2">
                    {activeFeature.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm text-cream/85 sm:text-base">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-clay-light" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/scan"
                    className="mt-7 inline-flex items-center justify-center border border-cream/35 px-5 py-2.5 text-sm font-semibold tracking-[0.06em] text-cream transition-colors hover:border-cream hover:bg-cream/10"
                  >
                    {t("features.cta")}
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
