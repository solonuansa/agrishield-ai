"use client";

import { motion } from "framer-motion";
import { Camera, Brain, ClipboardCheck } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Ambil Foto",
    desc: "Foto daun yang menunjukkan gejala menggunakan ponsel.",
  },
  {
    icon: Brain,
    title: "Analisis AI",
    desc: "Model membaca pola visual dan menampilkan diagnosis.",
  },
  {
    icon: ClipboardCheck,
    title: "Tindak Lanjut",
    desc: "Dapatkan rekomendasi spesifik dan estimasi biaya.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="fitur" className="bg-cream-dark">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-clay">Cara Kerja</p>
          <h2 className="font-serif text-2xl font-semibold text-forest-700 sm:text-3xl">
            Tiga langkah <span className="italic">sederhana</span>
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
                    Langkah {index + 1}
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
