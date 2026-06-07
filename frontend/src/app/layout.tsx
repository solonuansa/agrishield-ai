import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import "@/lib/animations.css";
import Providers from "@/components/Providers";
import I18nProvider from "@/lib/i18n/I18nProvider";
import { ToastContainer } from "@/components/ui/Toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AgriShield AI",
    template: "%s - AgriShield AI",
  },
  description:
    "Deteksi penyakit tanaman padi dan jagung menggunakan AI. Cepat, akurat, dan gratis untuk petani Indonesia.",
  keywords: [
    "deteksi penyakit tanaman",
    "AI pertanian",
    "padi",
    "jagung",
    "petani Indonesia",
  ],
  openGraph: {
    title: "AgriShield AI",
    description: "Deteksi penyakit tanaman menggunakan AI untuk petani Indonesia.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[9999] focus:bg-forest-700 focus:text-cream focus:px-4 focus:py-2 focus:rounded">
          Lewati ke konten utama
        </a>
        <Providers>
          <I18nProvider>
            <Navbar />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
            <ToastContainer />
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
