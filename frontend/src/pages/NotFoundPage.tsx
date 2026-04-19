import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-6xl font-bold text-primary mb-4">404</p>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Halaman tidak ditemukan</h1>
        <p className="text-gray-500 mb-8">Halaman yang Anda cari tidak tersedia.</p>
        <Link
          to="/"
          className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
