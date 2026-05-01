import Link from "next/link";

const cols = [
  {
    title: "Produk",
    links: [
      { label: "Home", href: "/" },
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
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-semibold text-forest-700">AgriShield</span>
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
              Platform pendamping kesehatan tanaman untuk petani Indonesia.
            </p>
            <div className="mt-3 space-y-1 text-sm text-ink-muted">
              <p>halo@agrishield.id</p>
              <p>Yogyakarta, Indonesia</p>
            </div>
          </div>

          {/* Links */}
          <div className="sm:col-span-1 lg:col-span-7">
            <div className="grid grid-cols-3 gap-6">
              {cols.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                    {col.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-ink-muted transition-colors hover:text-forest-700"
                        >
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

        {/* Copyright */}
        <div className="mt-8 flex items-center justify-between border-t border-cream-darker/40 pt-5">
          <p className="text-xs text-warm-gray">
            &copy; {new Date().getFullYear()} AgriShield AI
          </p>
          <p className="text-xs text-warm-gray">Dibuat untuk ketahanan pangan Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
