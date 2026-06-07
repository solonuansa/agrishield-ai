"use client";

import { motion } from "framer-motion";
import { Leaf, Sprout } from "lucide-react";

type CropType = "rice" | "corn";
type IconComponent = typeof Sprout;

interface CropTypeSelectorProps {
  cropType: CropType;
  onChange: (crop: CropType) => void;
  t: (key: string) => string;
}

function cropIcon(value: CropType): IconComponent {
  return value === "rice" ? Leaf : Sprout;
}

export function CropTypeSelector({ cropType, onChange, t }: CropTypeSelectorProps) {
  function cropLabel(value: CropType) {
    return value === "rice" ? t("crop.rice") : t("crop.corn");
  }

  return (
    <div>
      <label className="mb-3 block text-sm font-semibold text-ink">{t("scan.cropType")}</label>
      <div className="grid grid-cols-2 gap-4">
        {(["rice", "corn"] as const).map((crop) => {
          const CropIcon = cropIcon(crop);
          return (
            <motion.button
              key={crop}
              type="button"
              onClick={() => onChange(crop)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-5 transition-colors ${
                crop === cropType
                  ? "border-forest-500 bg-forest-50 shadow-sm"
                  : "border-cream-300 bg-white/60 hover:border-cream-400"
              }`}
            >
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border ${
                  crop === cropType
                    ? "border-forest-200 bg-forest-100 text-forest-700"
                    : "border-cream-300 bg-cream-100 text-ink-muted"
                }`}
              >
                <CropIcon className="h-5 w-5" />
              </span>
              <span
                className={`text-sm font-semibold ${
                  crop === cropType ? "text-forest-700" : "text-ink-muted"
                }`}
              >
                {cropLabel(crop)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
