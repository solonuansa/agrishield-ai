"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-forest-700 text-cream">
      {/* Grain noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -left-20 top-1/2 h-[24rem] w-[24rem] -translate-y-1/2 rounded-full bg-clay/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[18rem] w-[18rem] rounded-full bg-forest-300/8 blur-[90px]" />

      <div className="relative mx-auto max-w-4xl px-6 py-16 text-center sm:py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-clay-light">
            Bergabung Sekarang
          </p>
          <h2 className="mx-auto font-serif text-[2.8rem] font-semibold leading-[0.95] tracking-tight text-wrap-balance sm:text-5xl lg:text-[3.6rem]">
            Mulai lindungi{" "}
            <span className="italic text-clay-light">tanamanmu</span>{" "}
            sekarang.
          </h2>
          <div className="editorial-line mx-auto mt-6 mb-5" />
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-cream/85">
            Tidak perlu kartu kredit. Gratis selamanya untuk petani. Daftar
            dalam hitungan menit dan langsung mulai scan.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.7,
            delay: 0.15,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/login?mode=register"
            className="inline-flex items-center justify-center rounded-full bg-clay px-8 py-3 text-base font-semibold tracking-wide text-cream shadow-[0_8px_32px_-8px_rgba(184,92,69,0.5)] transition-all hover:-translate-y-0.5 hover:bg-clay-dark hover:shadow-[0_12px_40px_-8px_rgba(184,92,69,0.6)]"
          >
            Daftar Gratis
          </Link>
          <Link
            href="/scan"
            className="inline-flex items-center justify-center rounded-full border border-cream/20 px-8 py-3 text-base font-medium tracking-wide text-cream/85 transition-all hover:-translate-y-0.5 hover:border-cream/40 hover:text-cream"
          >
            Coba Tanpa Daftar
          </Link>
        </motion.div>

        {/* Decorative ring */}
        <div className="pointer-events-none absolute bottom-10 right-1/4 h-20 w-20 rounded-full border border-cream/5" />
      </div>
    </section>
  );
}
