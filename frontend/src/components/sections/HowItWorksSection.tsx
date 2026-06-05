"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Camera, Brain, ClipboardCheck } from "lucide-react";

export default function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    { icon: Camera, title: t("howItWorks.step1Title"), desc: t("howItWorks.step1Desc") },
    { icon: Brain, title: t("howItWorks.step2Title"), desc: t("howItWorks.step2Desc") },
    { icon: ClipboardCheck, title: t("howItWorks.step3Title"), desc: t("howItWorks.step3Desc") },
  ];

  return (
    <section id="cara-kerja" className="bg-cream-dark">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-clay">{t("howItWorks.kicker")}</p>
          <h2 className="font-serif text-2xl font-semibold text-forest-700 sm:text-3xl">
            {t("howItWorks.title")} <span className="italic">{t("howItWorks.titleEmphasis")}</span>{t("howItWorks.title2")}
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-lg border border-cream-darker bg-cream p-6 transition-colors hover:border-cream-darker/80"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream-darker bg-cream-dark text-forest-700">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-clay">
                    {t("howItWorks.stepLabel")} {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-forest-700">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
