"use client";

import { motion } from "framer-motion";
import { Ban, Ruler, ScanSearch, Sun } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface PhotoTipsCardProps {
  t: (key: string) => string;
}

export function PhotoTipsCard({ t }: PhotoTipsCardProps) {
  const tips = [
    { icon: Sun, text: t("scan.tipLight") },
    { icon: ScanSearch, text: t("scan.tipFocus") },
    { icon: Ruler, text: t("scan.tipDistance") },
    { icon: Ban, text: t("scan.tipShadow") },
  ];

  return (
    <div className="border-t border-cream-200 pt-6">
      <Card variant="flat" className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-forest-700">
          {t("scan.photoTips")}
        </h3>
        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {tips.map((tip, i) => (
            <motion.li
              key={i}
              variants={staggerItem}
              className="flex items-start gap-3 text-sm text-ink-muted"
            >
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-muted">
                <tip.icon className="h-3.5 w-3.5" />
              </span>
              <span>{tip.text}</span>
            </motion.li>
          ))}
        </motion.ul>
      </Card>
    </div>
  );
}
