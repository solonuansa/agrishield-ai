"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-forest-900 text-cream">
      {/* Warm grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8 pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pt-40 lg:pb-48">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-end">
          {/* Text - asymmetric left-heavy */}
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-xs font-semibold uppercase tracking-[0.25em] text-clay-light mb-6"
            >
              EfficientNet-B3 AI Model
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[0.95] tracking-tight"
            >
              Deteksi penyakit
              <br />
              <span className="italic text-clay-light">tanaman</span>
              <br />
              dalam detik.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-8 max-w-md text-base leading-relaxed text-cream/60"
            >
              Bantu petani Indonesia mengidentifikasi penyakit padi dan jagung
              secara cepat dan akurat langsung dari ponsel.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/scan"
                className="inline-flex items-center justify-center bg-clay hover:bg-clay-dark text-cream px-7 py-3 text-sm font-semibold tracking-wide transition-colors"
              >
                Coba Scan Gratis
              </Link>
              <Link
                href="#fitur"
                className="inline-flex items-center justify-center border border-cream/20 hover:border-cream/40 text-cream/80 hover:text-cream px-7 py-3 text-sm font-medium tracking-wide transition-colors"
              >
                Pelajari Lebih Lanjut
              </Link>
            </motion.div>
          </div>

          {/* Decorative right side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="hidden lg:block lg:col-span-5"
          >
            <div className="relative">
              {/* Abstract organic shape */}
              <div className="w-full aspect-[4/5] bg-forest-800 organic-blob relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-forest-700/50 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="font-serif text-4xl italic text-cream/20 leading-none">
                    Melindungi
                    <br />
                    panen
                    <br />
                    Indonesia
                  </p>
                </div>
              </div>
              {/* Floating stat pill */}
              <div className="absolute -bottom-4 -left-4 bg-cream text-forest-800 px-5 py-3 shadow-sm">
                <p className="text-2xl font-serif font-semibold">85%+</p>
                <p className="text-[10px] uppercase tracking-wider text-ink-muted">Akurasi Model</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


