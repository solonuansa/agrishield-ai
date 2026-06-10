"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MapPin, TriangleAlert, Compass } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { StatCard } from "@/components/ui/StatCard";

interface MapStatsProps {
  allPointsLength: number;
  highRisk: number;
  uniqueLocations: number;
}

export function MapStats({ allPointsLength, highRisk, uniqueLocations }: MapStatsProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-4 border-y border-cream-darker py-6 sm:grid-cols-3"
    >
      <motion.div variants={staggerItem}>
        <StatCard
          label={t("map.reportPoints")}
          value={allPointsLength}
          icon={<MapPin size={18} />}
        />
      </motion.div>
      <motion.div variants={staggerItem}>
        <StatCard
          label={t("map.highRisk")}
          value={highRisk}
          icon={
            <TriangleAlert
              size={18}
              className={highRisk > 0 ? "text-clay" : ""}
            />
          }
          className={highRisk > 0 ? "border-l-4 border-l-clay" : ""}
        />
      </motion.div>
      <motion.div variants={staggerItem}>
        <StatCard
          label={t("map.uniqueClusters")}
          value={uniqueLocations}
          icon={<Compass size={18} />}
        />
      </motion.div>
    </motion.div>
  );
}
