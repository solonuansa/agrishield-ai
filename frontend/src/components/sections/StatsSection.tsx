"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { fadeUp, staggerFadeUp } from "@/lib/motion";

function useCountUp(target: number, isInView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView || reduceMotion) return;

    let raf: number;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 4;
      setCount(Math.round(eased * target));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, isInView, duration, reduceMotion]);

  if (reduceMotion && isInView) return target;
  return count;
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const count = useCountUp(value, isInView);

  return (
    <motion.div ref={ref} variants={fadeUp} className="text-left">
      <p className="font-serif text-4xl font-semibold leading-none text-forest-700 sm:text-5xl lg:text-6xl">
        {count.toLocaleString("id-ID")}
        {suffix}
      </p>
      <p className="mt-2 text-sm uppercase tracking-[0.13em] text-ink-muted">{label}</p>
    </motion.div>
  );
}

export default function StatsSection() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-b border-cream-darker/40 bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12 lg:px-8">
        <motion.div
          variants={staggerFadeUp}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "visible"}
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          <Stat value={10000} suffix="+" label={t("stats.farmers")} />
          <Stat value={9} suffix="" label={t("stats.diseases")} />
          <Stat value={34} suffix="" label={t("stats.provinces")} />
          <Stat value={85} suffix="%+" label={t("stats.accuracy")} />
        </motion.div>
      </div>
    </section>
  );
}
