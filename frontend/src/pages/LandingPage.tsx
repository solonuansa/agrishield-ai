/**
 * Landing page publik AgriShield AI.
 * Sections: Hero → Stats → Fitur → Cara Kerja → Tanaman → CTA → Footer
 */
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-500 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Deteksi Penyakit Tanaman<br />dalam Hitungan Detik
          </h1>
          <p className="text-lg md:text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Platform AI untuk membantu petani Indonesia mendeteksi penyakit padi dan jagung
            secara cepat dan akurat — langsung dari smartphone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/scan"
              className="bg-secondary text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-secondary-dark transition-colors"
            >
              Coba Sekarang — Gratis
            </a>
            <a
              href="#fitur"
              className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-white hover:text-primary transition-colors"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-800 text-white py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10.000+", label: "Petani Terbantu" },
            { value: "9", label: "Penyakit Terdeteksi" },
            { value: "34", label: "Provinsi Terjangkau" },
            { value: "85%+", label: "Akurasi Model AI" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">{stat.value}</div>
              <div className="text-primary-200 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Fitur Unggulan</h2>
          <p className="text-center text-gray-600 mb-12">Semua yang dibutuhkan untuk melindungi tanaman Anda</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🔍", title: "Deteksi Instan", desc: "Upload foto daun, hasil diagnosis tampil dalam hitungan detik." },
              { icon: "💊", title: "Rekomendasi Penanganan", desc: "Langkah penanganan praktis berbasis AI, mudah dipahami petani." },
              { icon: "🗺️", title: "Peta Penyebaran", desc: "Pantau wabah penyakit di wilayahmu secara real-time." },
              { icon: "⚠️", title: "Peringatan Dini", desc: "Notifikasi sebelum wabah menyebar ke lahan Anda." },
              { icon: "📊", title: "Data Analitik", desc: "Dashboard tren penyakit untuk pemerintah dan peneliti." },
              { icon: "👥", title: "Komunitas Petani", desc: "Berbagi pengalaman dan belajar dari sesama petani." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Semudah 3 Langkah</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            {[
              { step: "1", icon: "📷", title: "Foto", desc: "Ambil gambar daun tanaman yang menunjukkan gejala sakit." },
              { step: "2", icon: "🤖", title: "Analisis", desc: "AI mendeteksi penyakit dan mengidentifikasi jenisnya dalam detik." },
              { step: "3", icon: "✅", title: "Tangani", desc: "Ikuti rekomendasi penanganan yang tepat dan terukur." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 text-primary font-bold text-xl flex items-center justify-center mb-4">
                  {item.step}
                </div>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20 px-6 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Mulai Lindungi Tanamanmu Sekarang</h2>
        <p className="text-primary-100 mb-8">Tidak perlu kartu kredit. Gratis selamanya untuk petani.</p>
        <a
          href="/login?mode=register"
          className="bg-secondary hover:bg-secondary-dark text-white font-semibold px-10 py-4 rounded-xl text-lg inline-block transition-colors"
        >
          Daftar Gratis
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6 text-center text-sm">
        <p className="font-semibold text-white mb-1">AgriShield AI</p>
        <p className="mb-4">Platform deteksi penyakit tanaman berbasis AI untuk petani Indonesia.</p>
        <p>© 2026 AgriShield AI. Hak cipta dilindungi.</p>
      </footer>
    </main>
  );
}
