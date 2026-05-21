"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import { fadeUp, easing, duration } from "@/lib/motion";

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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((chunk) => chunk[0])
    .join("");
}

const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  }, []);

  useEffect(() => {
    if (!shouldAnimate) return;
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [next, shouldAnimate]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resume = useCallback(() => {
    if (!shouldAnimate) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 5000);
  }, [next, shouldAnimate]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } },
  ) => {
    if (info.offset.x < -50) next();
    else if (info.offset.x > 50) prev();
  };

  const t = testimonials[currentIndex];

  return (
    <section className="bg-cream-dark py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          className="mb-6"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-clay">
            Testimoni
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-forest-700 leading-[1.05] max-w-lg">
            Apa kata <span className="italic">petani</span>.
          </h2>
        </motion.div>

        <div
          className="max-w-2xl mx-auto overflow-hidden"
          onMouseEnter={pause}
          onMouseLeave={resume}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: duration.normal,
                ease: easing.gentle,
              }}
              drag={shouldAnimate ? "x" : undefined}
               dragConstraints={{ left: -150, right: 150 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
            >
              <Quote className="h-6 w-6 text-clay/30 mb-3" strokeWidth={1} />
              <blockquote className="font-serif text-xl sm:text-2xl text-forest-700 leading-snug mb-4">
                {t.quote}
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-forest-700 text-sm font-semibold text-cream">
                  {getInitials(t.name)}
                </div>
                <div>
                  <p className="text-base font-medium text-ink-soft">
                    {t.name}
                  </p>
                  <p className="text-sm text-ink-muted">{t.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-2 mt-5">
            {testimonials.map((item, index) => (
              <button
                key={item.name}
                onClick={() => goTo(index)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  index === currentIndex ? "bg-clay-500" : "bg-cream-300"
                }`}
                aria-label={`Testimoni ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
