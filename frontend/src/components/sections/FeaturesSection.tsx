"use client";

import { motion } from "framer-motion";

const features = [
  {
    num: "01",
    title: "Deteksi Instan",
    desc: "Upload foto daun, hasil diagnosis tampil dalam hitungan detik dengan model AI terbaru.",
  },
  {
    num: "02",
    title: "Rekomendasi Penanganan",
    desc: "Langkah praktis berbasis AI yang disusun agar mudah dipahami oleh petani.",
  },
  {
    num: "03",
    title: "Peta Penyebaran",
    desc: "Pantau wabah penyakit di wilayah Anda secara real-time melalui peta interaktif.",
  },
  {
    num: "04",
    title: "Peringatan Dini",
    desc: "Terima notifikasi sebelum wabah menyebar ke lahan berdasarkan data cuaca dan geografi.",
  },
  {
    num: "05",
    title: "Data Analitik",
    desc: "Dashboard tren penyakit untuk membantu pemerintah, peneliti, dan stakeholder.",
  },
  {
    num: "06",
    title: "Komunitas Petani",
    desc: "Berbagi pengalaman dan belajar dari sesama petani di seluruh Indonesia.",
  },
];

function FeatureItem({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group border-t border-cream-darker/40 py-8"
    >
      <div className="flex items-start gap-6 sm:gap-10">
        <span className="font-serif text-2xl sm:text-3xl font-medium text-clay/40 group-hover:text-clay transition-colors shrink-0 w-10">
          {feature.num}
        </span>
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-medium text-forest-700 mb-2">
            {feature.title}
          </h3>
          <p className="text-sm leading-relaxed text-ink-muted max-w-md">{feature.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="fitur" className="bg-cream fluid-py">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay mb-4">Fitur</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-forest-700 leading-[1.05]">
              Semua yang
              <br />
              <span className="italic">dibutuhkan</span>
              <br />
              dalam satu tempat.
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-ink-muted max-w-xs">
              Platform lengkap untuk melindungi tanaman Anda dari ancaman penyakit.
            </p>
          </div>

          <div className="lg:col-span-8">
            {features.map((feature, index) => (
              <FeatureItem key={feature.num} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

