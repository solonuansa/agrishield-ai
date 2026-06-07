"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface ScanProcessingProps {
  steps: string[];
  visible: boolean;
}

export function ScanProcessing({ steps, visible }: ScanProcessingProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="processing"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="default" className="p-6">
            <div className="space-y-4">
              {steps.map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.3 }}
                  className="flex items-center gap-3"
                >
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-forest-500" />
                  <span className="text-sm text-ink-soft">{step}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <Skeleton variant="heading" width="50%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
