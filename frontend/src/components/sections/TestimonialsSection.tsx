"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Sejak pakai AgriShield, saya bisa deteksi hawar daun lebih awal. Tanaman saya terselamatkan dan hasil panen malah naik 20%.",
    name: "Pak Sutrisno",
    role: "Petani Padi, Jawa Tengah",
  },
  {
    quote:
      "Aplikasi ini sangat membantu kami di daerah terpencil. Tidak perlu jauh-jauh ke pusat pertanian cuma untuk tanya penyakit tanaman.",
    name: "Bu Maria",
    role: "Petani Jagung, NTT",
  },
  {
    quote:
      "Fitur peta sebarannya luar biasa. Kami bisa koordinasi dengan petani lain di desa sekitar untuk cegah wabah menyebar.",
    name: "Pak Ahmad",
    role: "Ketua Kelompok Tani, Sumatera Selatan",
  },
];

function Testimonial({ t, index }: { t: (typeof testimonials)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Quote className="h-6 w-6 text-clay/30 mb-4" strokeWidth={1} />
      <blockquote className="font-serif text-xl sm:text-2xl text-forest-700 leading-snug mb-6">
        {t.quote}
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center bg-forest-700 text-sm font-semibold text-cream">
          {t.name
            .split(" ")
            .map((chunk) => chunk[0])
            .join("")}
        </div>
        <div>
          <p className="text-base font-medium text-ink-soft">{t.name}</p>
          <p className="text-sm text-ink-muted">{t.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="bg-cream-dark fluid-py">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-clay">Testimoni</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-forest-700 leading-[1.05] max-w-lg">
            Apa kata <span className="italic">petani</span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:gap-12">
          {testimonials.map((t, index) => (
            <Testimonial key={t.name} t={t} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

