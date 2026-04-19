/**
 * Komponen drag-and-drop upload gambar dengan preview.
 * Mendukung: klik untuk pilih file, drag & drop, dan capture kamera (mobile).
 */
import { useRef, useState } from "react";

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

export default function ImageUploader({ onFileSelect, disabled }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Format tidak didukung. Gunakan JPEG, PNG, atau WebP.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${MAX_SIZE_MB}MB.`);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelect(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleReset() {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="w-full">
      {preview ? (
        /* Preview gambar yang sudah dipilih */
        <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 bg-gray-50">
          <img
            src={preview}
            alt="Preview tanaman"
            className="w-full max-h-72 object-contain"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleReset}
              className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 rounded-full w-8 h-8 flex items-center justify-center shadow transition-colors text-sm font-bold"
              title="Ganti foto"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        /* Area drop / klik */
        <div
          role="button"
          tabIndex={0}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`
            w-full rounded-2xl border-2 border-dashed py-14 px-6 text-center cursor-pointer
            transition-colors select-none
            ${dragOver ? "border-primary bg-primary-50" : "border-gray-300 bg-gray-50 hover:border-primary/60 hover:bg-primary-50/40"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="text-5xl mb-3">📷</div>
          <p className="text-gray-700 font-medium mb-1">
            Seret foto ke sini, atau <span className="text-primary underline">pilih dari galeri</span>
          </p>
          <p className="text-gray-400 text-xs">JPEG, PNG, atau WebP · Maks {MAX_SIZE_MB}MB</p>
        </div>
      )}

      {/* Input tersembunyi — menerima file dan kamera */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
