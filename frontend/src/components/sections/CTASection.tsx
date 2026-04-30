import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-forest-700 text-cream">
      <div className="mx-auto max-w-6xl px-6 lg:px-8 py-20 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[0.95]">
              Mulai lindungi
              <br />
              <span className="italic">tanamanmu</span> sekarang.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-cream/50 max-w-md">
              Tidak perlu kartu kredit. Gratis selamanya untuk petani. Daftar
              dalam hitungan menit dan langsung mulai scan.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
            <Link
              href="/login?mode=register"
              className="inline-flex items-center justify-center bg-clay hover:bg-clay-dark text-cream px-7 py-3 text-sm font-semibold tracking-wide transition-colors w-full sm:w-auto lg:w-full"
            >
              Daftar Gratis
            </Link>
            <Link
              href="/scan"
              className="inline-flex items-center justify-center border border-cream/20 hover:border-cream/40 text-cream/70 hover:text-cream px-7 py-3 text-sm font-medium tracking-wide transition-colors w-full sm:w-auto lg:w-full"
            >
              Coba Tanpa Daftar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
