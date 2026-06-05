"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="text-center"
      >
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
          className="font-serif text-7xl font-semibold text-forest-700 mb-4"
        >
          404
        </motion.p>
        <EmptyState
          icon={<Sprout size={36} strokeWidth={1.5} />}
          title={t("notFound.title")}
          description={t("notFound.description")}
          actionLabel={t("notFound.action")}
          onAction={() => router.push("/")}
        />
      </motion.div>
    </div>
  );
}
