"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  BellRing,
  Camera,
  Compass,
  FileText,
  Users,
} from "lucide-react";

const features = [
  {
    id: "deteksi",
    num: "01",
    title: "Deteksi Cepat",
    summary: "Foto daun, hasil analisis muncul dalam hitungan detik.",
    detail:
      "Petani bisa mengenali gejala penyakit lebih dini dari foto sederhana. Hasilnya disajikan dengan bahasa praktis sehingga mudah langsung ditindaklanjuti di lapangan.",
    points: ["Cocok untuk pemakaian harian", "Alur pemeriksaan singkat", "Hasil ringkas dan jelas"],
    icon: Camera,
  },
  {
    id: "saran",
    num: "02",
    title: "Panduan Tindakan",
    summary: "Setiap hasil disertai langkah awal penanganan yang terstruktur.",
    detail:
      "AgriShield menampilkan rekomendasi tindakan prioritas agar pengguna tahu langkah paling aman yang perlu dilakukan lebih dulu sebelum kondisi tanaman memburuk.",
    points: ["Prioritas tindakan", "Mudah diterapkan", "Mengurangi keputusan yang terlambat"],
    icon: FileText,
  },
  {
    id: "peta",
    num: "03",
    title: "Peta Persebaran",
    summary: "Pantau pola penyakit tanaman berdasarkan area.",
    detail:
      "Visual peta membantu komunitas tani dan penyuluh memahami area yang perlu perhatian lebih tinggi, sehingga koordinasi penanganan dapat dilakukan lebih cepat.",
    points: ["Wawasan berbasis wilayah", "Membantu koordinasi", "Mempermudah prioritas monitoring"],
    icon: Compass,
  },
  {
    id: "peringatan",
    num: "04",
    title: "Peringatan Dini",
    summary: "Notifikasi saat ada indikasi peningkatan risiko.",
    detail:
      "Pengguna mendapat sinyal lebih awal agar dapat menyiapkan pencegahan. Pendekatan ini membantu menjaga kualitas panen melalui tindakan yang tidak terlambat.",
    points: ["Respon lebih cepat", "Mencegah penyebaran", "Mendukung perencanaan lahan"],
    icon: BellRing,
  },
  {
    id: "analitik",
    num: "05",
    title: "Ringkasan Tren",
    summary: "Lihat perkembangan kasus dari waktu ke waktu.",
    detail:
      "Data perkembangan membantu mengambil keputusan jangka menengah, termasuk evaluasi pola penyakit dan efektivitas tindakan yang sudah dilakukan.",
    points: ["Evaluasi lebih terukur", "Mudah dibagikan", "Mendukung keputusan berkelanjutan"],
    icon: Activity,
  },
  {
    id: "komunitas",
    num: "06",
    title: "Ruang Komunitas",
    summary: "Belajar dari pengalaman petani lain di berbagai daerah.",
    detail:
      "Forum komunitas mempercepat transfer pengalaman praktis antarpengguna, dari gejala awal sampai strategi lapangan yang relevan.",
    points: ["Belajar lintas wilayah", "Diskusi solusi nyata", "Memperkuat jejaring petani"],
    icon: Users,
  },
];

export default function FeaturesSection() {
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
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.17em] text-clay">Fitur Utama</p>
          <h2 className="max-w-2xl font-serif text-4xl font-semibold leading-[1.03] text-forest-700 sm:text-5xl">
            Dirancang untuk membantu keputusan
            <span className="italic text-forest-600"> lebih cepat di lapangan</span>.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted lg:text-lg">
            Pilih fitur yang ingin kamu lihat. Setiap bagian dibuat agar alur kerja pengguna tetap sederhana dari deteksi hingga tindak lanjut.
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
                    Fitur {activeFeature.num}
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
                    Mulai dari Scan
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
