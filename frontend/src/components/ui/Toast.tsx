"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore, type ToastType } from "@/lib/hooks/useToast";

const iconMap: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap: Record<ToastType, string> = {
  success: "text-success-600",
  error: "text-error-600",
  warning: "text-warning-600",
  info: "text-info-600",
};

const bgMap: Record<ToastType, string> = {
  success: "bg-white/95 border-l-4 border-l-success-500",
  error: "bg-white/95 border-l-4 border-l-error-500",
  warning: "bg-white/95 border-l-4 border-l-warning-500",
  info: "bg-white/95 border-l-4 border-l-info-500",
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-lg border border-cream-300 ${bgMap[toast.type]}`}
            >
              <Icon size={20} className={`shrink-0 mt-0.5 ${colorMap[toast.type]}`} />
              <p className="text-sm text-ink flex-1 leading-snug">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-ink-muted hover:text-ink transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
