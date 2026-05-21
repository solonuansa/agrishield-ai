"use client";

import { useCallback, useRef, useState, type DragEvent, type ChangeEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import { Upload, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onFile: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: string | null;
  onClear?: () => void;
  error?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFile,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 10,
  preview,
  onClear,
  error,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayError = error || localError;

  const validateFile = (file: File): boolean => {
    setLocalError(null);

    const acceptedTypes = accept.split(",").map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      setLocalError("Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.");
      return false;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setLocalError(`Ukuran file maksimal ${maxSizeMB} MB.`);
      return false;
    }

    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (disabled) return;
      if (validateFile(file)) {
        onFile(file);
      }
    },
    [disabled, onFile]
  );

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClear = () => {
    setLocalError(null);
    onClear?.();
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative group rounded-lg overflow-hidden border border-cream-300"
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain bg-cream-100/50"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-ink/50 text-white hover:bg-ink/70 transition-colors opacity-0 group-hover:opacity-100"
              type="button"
            >
              <X size={18} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload gambar"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !disabled && inputRef.current?.click()}
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!disabled) inputRef.current?.click();
                }
              }}
              className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer select-none ${
                isDragging
                  ? "border-forest-400 bg-forest-50/60 scale-[1.01]"
                  : disabled
                  ? "border-cream-200 bg-cream-50/40 cursor-not-allowed opacity-60"
                  : displayError
                  ? "border-error-300 bg-error-50/20"
                  : "border-cream-300 bg-cream-50/30 hover:border-forest-300 hover:bg-forest-50/30"
              }`}
            >
              <motion.div
                animate={isDragging ? { y: -4 } : { y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-500">
                  {isDragging ? (
                    <Upload size={28} strokeWidth={1.5} />
                  ) : (
                    <ImageIcon size={28} strokeWidth={1.5} />
                  )}
                </div>
              </motion.div>
              <p className="text-body text-ink font-medium mb-1">
                {isDragging ? "Lepaskan gambar di sini" : "Seret & lepas gambar di sini"}
              </p>
              <p className="text-caption text-ink-muted">
                atau klik untuk pilih file — JPEG, PNG, WebP (maks {maxSizeMB} MB)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {displayError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-1.5 text-sm text-error-600"
        >
          <AlertCircle size={14} />
          {displayError}
        </motion.p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
