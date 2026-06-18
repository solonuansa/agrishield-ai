"use client";

import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface PageErrorProps {
  reset: () => void;
}

export function PageError({ reset }: PageErrorProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
      <AlertTriangle className="h-12 w-12 text-clay-dark" />
      <h2 className="mt-4 font-serif text-2xl font-semibold text-forest-700">
        Terjadi Kesalahan
      </h2>
      <p className="mt-2 text-sm text-ink-muted">
        Silakan coba lagi atau kembali ke halaman utama.
      </p>
      <Button
        variant="primary"
        className="mt-6"
        onClick={reset}
      >
        Coba Lagi
      </Button>
    </div>
  );
}
