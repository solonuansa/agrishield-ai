"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Wheat, Sprout } from "lucide-react";

function CropColumn({ crop, index, t }: { crop: { name: string; icon: typeof Wheat; diseases: { name: string; sci: string }[] }; index: number; t: (key: string, vars?: Record<string, unknown>) => string }) {
  const Icon = crop.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Icon className="h-5 w-5 text-forest-600" strokeWidth={1.5} />
        <h3 className="font-serif text-2xl font-medium text-forest-700">{crop.name}</h3>
        <span className="text-sm text-ink-muted">{t("supportedPlants.diseaseCount", { count: crop.diseases.length })}</span>
      </div>
      <div>
        {crop.diseases.map((disease) => (
          <div
            key={disease.name}
            className="flex items-baseline justify-between gap-4 py-3 border-b border-cream-darker/30"
          >
            <span className="text-base text-ink-soft">{disease.name}</span>
            <span className="shrink-0 text-sm italic text-ink-muted">{disease.sci}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function SupportedPlantsSection() {
  const { t } = useTranslation();

  const crops = [
    {
      name: t("supportedPlants.rice.name"),
      icon: Wheat,
      diseases: [
        { name: t("supportedPlants.rice.blast"), sci: "Magnaporthe oryzae" },
        { name: t("supportedPlants.rice.blight"), sci: "Xanthomonas oryzae" },
        { name: t("supportedPlants.rice.brownSpot"), sci: "Bipolaris oryzae" },
        { name: t("supportedPlants.rice.tungro"), sci: "Virus" },
        { name: t("supportedPlants.rice.hispa"), sci: "Dicladispa armigera" },
      ],
    },
    {
      name: t("supportedPlants.corn.name"),
      icon: Sprout,
      diseases: [
        { name: t("supportedPlants.corn.northernBlight"), sci: "Exserohilum turcicum" },
        { name: t("supportedPlants.corn.southernBlight"), sci: "Bipolaris maydis" },
        { name: t("supportedPlants.corn.rust"), sci: "Puccinia sorghi" },
        { name: t("supportedPlants.corn.earRot"), sci: "Fusarium spp." },
        { name: t("supportedPlants.corn.grayLeafSpot"), sci: "Cercospora spp." },
      ],
    },
  ];

  return (
    <section className="bg-cream py-12 sm:py-16 lg:py-18">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-clay">
            {t("supportedPlants.kicker")}
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-forest-700 leading-[1.05] max-w-lg">
            {t("supportedPlants.title")} <span className="italic">{t("supportedPlants.titleEmphasis")}</span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">
          {crops.map((crop, index) => (
            <CropColumn key={crop.name} crop={crop} index={index} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

