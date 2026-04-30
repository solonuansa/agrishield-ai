"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const highlights = [
  "Praktis dipakai langsung dari ponsel",
  "Bahasa sederhana, mudah dipahami petani",
  "Mendukung keputusan sebelum panen terdampak",
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-forest-900 text-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,163,142,0.18),_transparent_35%),radial-gradient(circle_at_left,_rgba(125,165,144,0.14),_transparent_30%)]" />

      <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-16 sm:pb-16 sm:pt-20 lg:px-8 lg:pb-20 lg:pt-20">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-clay-light"
            >
              Pendamping Cerdas untuk Kesehatan Tanaman
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="font-serif text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-[4.2rem]"
            >
              Kenali gejala
              <span className="italic text-clay-light"> penyakit tanaman </span>
              lebih awal,
              <br />
              jaga panen tetap aman.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-5 max-w-xl text-base leading-relaxed text-cream/80 lg:text-lg"
            >
              AgriShield membantu petani, penyuluh, dan komunitas tani mengenali
              kondisi tanaman lebih cepat melalui foto daun, lalu memberikan
              panduan langkah awal yang jelas dan mudah diikuti.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <Link
                href="/scan"
                className="inline-flex items-center justify-center bg-clay px-6 py-2.5 text-base font-semibold tracking-wide text-cream transition-colors hover:bg-clay-dark"
              >
                Coba Scan Gratis
              </Link>
              <Link
                href="#fitur"
                className="inline-flex items-center justify-center border border-cream/20 px-6 py-2.5 text-base font-medium tracking-wide text-cream/85 transition-colors hover:border-cream/40 hover:text-cream"
              >
                Pelajari Lebih Lanjut
              </Link>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.42, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-6 grid max-w-xl gap-1.5 text-sm text-cream/75 lg:text-base"
            >
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-light" />
                  <span>{item}</span>
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-[31rem] lg:mx-0">
              <div className="overflow-hidden border border-cream/15 bg-forest-800/40 p-2.5 shadow-[0_24px_80px_-34px_rgba(0,0,0,0.55)]">
                <Image
                  src="/hero-farm-illustration.svg"
                  alt="Ilustrasi petani menggunakan ponsel untuk memeriksa kesehatan tanaman"
                  width={960}
                  height={720}
                  priority
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-3 max-w-[15rem] border border-cream/15 bg-forest-700/95 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.17em] text-clay-light">
                  Alur Sederhana
                </p>
                <div className="mt-3 space-y-1.5 text-sm leading-relaxed text-cream/90">
                  <p>1. Ambil foto daun</p>
                  <p>2. Lihat analisis gejala</p>
                  <p>3. Ikuti saran tindakan</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
