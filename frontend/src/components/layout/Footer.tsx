import Link from "next/link";

const cols = [
  {
    title: "Produk",
    links: [
      { label: "Scan Penyakit", href: "/scan" },
      { label: "Peta Sebaran", href: "/map" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Komunitas", href: "/community" },
    ],
  },
  {
    title: "Akses Cepat",
    links: [
      { label: "Masuk", href: "/login" },
      { label: "Daftar", href: "/login?mode=register" },
      { label: "Riwayat Scan", href: "/history" },
    ],
  },
  {
    title: "Lainnya",
    links: [
      { label: "Lahan", href: "/fields" },
      { label: "Admin", href: "/admin" },
      { label: "Peta", href: "/map" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-cream-darker/50 bg-cream-dark">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="mb-4 inline-block">
              <span className="font-serif text-3xl font-semibold text-forest-700">AgriShield</span>
            </Link>
            <p className="max-w-sm text-base leading-relaxed text-ink-muted">
              Platform deteksi penyakit tanaman berbasis AI untuk petani Indonesia.
            </p>
            <div className="mt-6 space-y-1.5 text-sm text-ink-muted">
              <p>halo@agrishield.id</p>
              <p>Yogyakarta, Indonesia</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {cols.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-ink-soft">
                    {col.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-forest-700">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream-darker/40 pt-7 sm:flex-row">
          <p className="text-xs text-warm-gray">&copy; {new Date().getFullYear()} AgriShield AI</p>
          <p className="text-xs text-warm-gray">Dibuat untuk ketahanan pangan Indonesia</p>
        </div>
      </div>
    </footer>
  );
}

