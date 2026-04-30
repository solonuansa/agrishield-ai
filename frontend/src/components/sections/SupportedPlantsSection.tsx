"use client";

import { motion } from "framer-motion";
import { Wheat, Sprout } from "lucide-react";

const crops = [
  {
    name: "Padi",
    icon: Wheat,
    diseases: [
      { name: "Blast Padi", sci: "Magnaporthe oryzae" },
      { name: "Hawar Daun Bakteri", sci: "Xanthomonas oryzae" },
      { name: "Bercak Cokelat", sci: "Bipolaris oryzae" },
      { name: "Tungro", sci: "Virus" },
      { name: "Hispa", sci: "Dicladispa armigera" },
    ],
  },
  {
    name: "Jagung",
    icon: Sprout,
    diseases: [
      { name: "Hawar Daun Utara", sci: "Exserohilum turcicum" },
      { name: "Hawar Daun Selatan", sci: "Bipolaris maydis" },
      { name: "Karat Jagung", sci: "Puccinia sorghi" },
      { name: "Busuk Tongkol", sci: "Fusarium spp." },
      { name: "Bercak Daun Abu-abu", sci: "Cercospora spp." },
    ],
  },
];

function CropColumn({ crop, index }: { crop: (typeof crops)[number]; index: number }) {
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
        <span className="text-xs text-ink-muted">{crop.diseases.length} penyakit</span>
      </div>
      <div>
        {crop.diseases.map((disease) => (
          <div
            key={disease.name}
            className="flex items-baseline justify-between gap-4 py-3 border-b border-cream-darker/30"
          >
            <span className="text-sm text-ink-soft">{disease.name}</span>
            <span className="text-xs italic text-ink-muted shrink-0">{disease.sci}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function SupportedPlantsSection() {
  return (
    <section className="bg-cream fluid-py">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay mb-4">
            Tanaman Didukung
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-forest-700 leading-[1.05] max-w-lg">
            Model dilatih khusus untuk <span className="italic">dua tanaman utama</span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {crops.map((crop, index) => (
            <CropColumn key={crop.name} crop={crop} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

