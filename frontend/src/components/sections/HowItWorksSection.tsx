"use client";

import { motion } from "framer-motion";
import { Camera, Brain, ClipboardCheck } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Foto Daun",
    desc: "Ambil gambar daun tanaman yang menunjukkan gejala sakit menggunakan kamera smartphone Anda.",
  },
  {
    icon: Brain,
    title: "Analisis AI",
    desc: "Sistem AgriShield membaca gejala dari foto dan menampilkan hasil diagnosis dalam hitungan detik.",
  },
  {
    icon: ClipboardCheck,
    title: "Tangani",
    desc: "Dapatkan rekomendasi penanganan yang tepat dan terukur untuk menyelamatkan tanaman Anda.",
  },
];

function StepCard({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-start gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-forest-700 text-cream">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">
            Langkah {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-serif text-xl font-medium text-forest-700 mt-1 mb-2">{step.title}</h3>
          <p className="max-w-xs text-base leading-relaxed text-ink-muted">{step.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="bg-cream-dark fluid-py">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-clay">Cara Kerja</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-forest-700 leading-[1.05]">
              Semudah
              <br />
              <span className="italic">tiga langkah</span>.
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-10">
            {steps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

