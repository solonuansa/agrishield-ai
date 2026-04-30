"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="text-center max-w-sm">
        <p className="font-serif text-7xl font-semibold text-forest-700 mb-4">404</p>
        <h1 className="font-serif text-2xl text-forest-700 mb-3">
          Halaman tidak ditemukan
        </h1>
        <p className="text-sm text-ink-muted mb-8">
          Maaf, halaman yang Anda cari tidak tersedia.
        </p>
        <Link
          href="/"
          className="inline-block bg-forest-700 hover:bg-forest-800 text-cream px-6 py-2.5 text-sm font-medium transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
