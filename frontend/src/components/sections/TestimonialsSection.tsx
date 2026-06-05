"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import { fadeUp, easing, duration } from "@/lib/motion";

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
  const { t } = useTranslation();

  const testimonials = [
    { quote: t("testimonials.quote1"), name: t("testimonials.author1"), role: t("testimonials.role1") },
    { quote: t("testimonials.quote2"), name: t("testimonials.author2"), role: t("testimonials.role2") },
    { quote: t("testimonials.quote3"), name: t("testimonials.author3"), role: t("testimonials.role3") },
  ];

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

  const activeTestimonial = testimonials[currentIndex];

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
            {t("testimonials.sectionTitle")}
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-forest-700 leading-[1.05] max-w-lg">
            {t("testimonials.title")} <span className="italic">{t("testimonials.titleEmphasis")}</span>{t("testimonials.title2")}
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
                {activeTestimonial.quote}
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-forest-700 text-sm font-semibold text-cream">
                  {getInitials(activeTestimonial.name)}
                </div>
                <div>
                  <p className="text-base font-medium text-ink-soft">
                    {activeTestimonial.name}
                  </p>
                  <p className="text-sm text-ink-muted">{activeTestimonial.role}</p>
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
                aria-label={`${t("testimonials.slideLabel")} ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
