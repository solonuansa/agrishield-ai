import Link from "next/link";
import { Sprout } from "lucide-react";

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
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Link href="/" className="group inline-block">
              <span className="font-serif text-2xl font-semibold text-forest-700 transition-colors group-hover:text-forest-600">
                AgriShield
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              Platform pendamping kesehatan tanaman untuk petani Indonesia.
            </p>
            <div className="mt-4 space-y-1 text-sm text-ink-muted">
              <p>halo@agrishield.id</p>
              <p>Yogyakarta, Indonesia</p>
            </div>
          </div>

          <div className="sm:col-span-1 lg:col-span-7">
            <div className="grid grid-cols-3 gap-6 sm:gap-8">
              {cols.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                    {col.title}
                  </h3>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="group/link relative inline-block text-sm text-ink-muted transition-colors duration-200 hover:text-forest-700"
                        >
                          <span>{link.label}</span>
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-forest-400/40 transition-all duration-300 group-hover/link:w-full" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-12">
          <div className="flex items-center gap-3 pb-5">
            <span className="editorial-line text-cream-darker" />
            <Sprout size={12} strokeWidth={1.5} className="text-forest-400/60 shrink-0" />
            <span className="editorial-line text-cream-darker" />
          </div>
          <div className="flex flex-col gap-1.5 border-t border-cream-darker/40 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink-muted">
              &copy; {new Date().getFullYear()} AgriShield AI
            </p>
            <p className="text-xs text-ink-muted">Dibuat untuk ketahanan pangan Indonesia</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
