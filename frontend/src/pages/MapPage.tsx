/**
 * Halaman peta persebaran penyakit tanaman.
 * Menggunakan react-leaflet untuk render peta interaktif.
 * Endpoint publik — tidak memerlukan login.
 *
 * Catatan: Leaflet membutuhkan inisialisasi icon secara imperatif
 * (lihat fixLeafletIcon). Ini adalah satu-satunya penggunaan kode
 * non-pure yang diizinkan sesuai CLAUDE.md untuk integrasi Leaflet.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";
import { mapApi, type DiseasePoint, type HeatmapParams } from "@/api/map";
import type { CropType } from "@/api/scans";

// Fix icon Leaflet yang rusak saat di-bundle oleh Vite
// (marker-icon.png tidak ditemukan karena asset path berubah)
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DISEASE_LABELS: Record<string, string> = {
  rice_leaf_blast: "Blast Padi",
  rice_bacterial_leaf_blight: "Hawar Daun Bakteri",
  rice_brown_spot: "Bercak Cokelat Padi",
  rice_hispa: "Hispa Padi",
  corn_northern_leaf_blight: "Hawar Daun Utara Jagung",
  corn_common_rust: "Karat Jagung",
  corn_gray_leaf_spot: "Bercak Daun Abu-abu Jagung",
};

// Warna marker berdasarkan jenis tanaman
const MARKER_COLORS: Record<string, string> = {
  rice: "#22c55e",   // hijau
  corn: "#f59e0b",   // kuning
};

// Semua penyakit untuk dropdown filter
const DISEASE_OPTIONS = Object.entries(DISEASE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

type MonthOption = 1 | 3 | 6 | 12;

// Pusat Indonesia
const INDONESIA_CENTER: [number, number] = [-2.5, 118.0];
const DEFAULT_ZOOM = 5;

export default function MapPage() {
  const [cropFilter, setCropFilter] = useState<CropType | "">("");
  const [diseaseFilter, setDiseaseFilter] = useState<string>("");
  const [monthsFilter, setMonthsFilter] = useState<MonthOption>(3);
  const [selectedPoint, setSelectedPoint] = useState<DiseasePoint | null>(null);

  const params: HeatmapParams = {
    months: monthsFilter,
    ...(cropFilter && { crop_type: cropFilter }),
    ...(diseaseFilter && { disease: diseaseFilter }),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["map", "heatmap", params],
    queryFn: () => mapApi.getHeatmap(params),
    staleTime: 60_000, // data peta tidak perlu refresh terlalu sering
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="text-primary font-bold text-lg">🌿 AgriShield AI</a>
          <nav className="flex gap-4 text-sm text-gray-500">
            <a href="/scan" className="hover:text-primary transition-colors">Scan</a>
            <a href="/history" className="hover:text-primary transition-colors">Riwayat</a>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full px-4 py-6 gap-4">
        {/* Panel filter + info — kiri */}
        <aside className="lg:w-72 flex-shrink-0 space-y-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Peta Persebaran Penyakit</h1>
            <p className="text-sm text-gray-500 mt-1">
              Data dari laporan petani yang membagikan lokasi
            </p>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Filter Data</p>

            {/* Rentang waktu */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Rentang Waktu</label>
              <div className="grid grid-cols-4 gap-1">
                {([1, 3, 6, 12] as MonthOption[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonthsFilter(m)}
                    className={`text-xs py-1.5 rounded-lg transition-colors ${
                      monthsFilter === m
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {m}bl
                  </button>
                ))}
              </div>
            </div>

            {/* Jenis tanaman */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Jenis Tanaman</label>
              <select
                value={cropFilter}
                onChange={(e) => {
                  setCropFilter(e.target.value as CropType | "");
                  setDiseaseFilter(""); // reset disease filter saat tanaman berubah
                }}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
              >
                <option value="">Semua Tanaman</option>
                <option value="rice">🌾 Padi</option>
                <option value="corn">🌽 Jagung</option>
              </select>
            </div>

            {/* Jenis penyakit */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Jenis Penyakit</label>
              <select
                value={diseaseFilter}
                onChange={(e) => setDiseaseFilter(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
              >
                <option value="">Semua Penyakit</option>
                {DISEASE_OPTIONS
                  .filter((d) => !cropFilter || d.value.startsWith(cropFilter === "rice" ? "rice" : "corn"))
                  .map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Statistik */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Ringkasan</p>
            {isLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ) : isError ? (
              <p className="text-xs text-red-500">Gagal memuat data</p>
            ) : (
              <div className="space-y-2">
                <StatRow label="Total laporan" value={String(data?.total ?? 0)} />
                <StatRow
                  label="Padi"
                  value={String(data?.points.filter((p) => p.crop_type === "rice").length ?? 0)}
                  color="text-green-600"
                />
                <StatRow
                  label="Jagung"
                  value={String(data?.points.filter((p) => p.crop_type === "corn").length ?? 0)}
                  color="text-yellow-600"
                />
              </div>
            )}
          </div>

          {/* Detail titik yang diklik */}
          {selectedPoint && (
            <PointDetail
              point={selectedPoint}
              onClose={() => setSelectedPoint(null)}
            />
          )}

          {/* Legend */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">LEGENDA</p>
            <div className="space-y-1.5">
              <LegendItem color="#22c55e" label="Penyakit Padi" />
              <LegendItem color="#f59e0b" label="Penyakit Jagung" />
              <p className="text-xs text-gray-400 mt-2">
                Ukuran lingkaran = tingkat keyakinan diagnosis
              </p>
            </div>
          </div>
        </aside>

        {/* Peta — kanan */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 min-h-[500px] lg:min-h-0 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 z-[1000] flex items-center justify-center rounded-2xl">
              <div className="text-center">
                <div className="text-3xl mb-2 animate-pulse">🗺️</div>
                <p className="text-sm text-gray-500">Memuat data peta...</p>
              </div>
            </div>
          )}

          <MapContainer
            center={INDONESIA_CENTER}
            zoom={DEFAULT_ZOOM}
            className="h-full w-full"
            style={{ minHeight: "500px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {data?.points.map((point) => (
              <CircleMarker
                key={point.scan_id}
                center={[point.lat, point.lng]}
                // Radius 6–14px berdasarkan confidence
                radius={6 + point.confidence * 8}
                pathOptions={{
                  color: MARKER_COLORS[point.crop_type] ?? "#6b7280",
                  fillColor: MARKER_COLORS[point.crop_type] ?? "#6b7280",
                  fillOpacity: 0.65,
                  weight: 1.5,
                }}
                eventHandlers={{
                  click: () => setSelectedPoint(point),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">
                      {DISEASE_LABELS[point.disease] ?? point.disease}
                    </p>
                    <p className="text-gray-500">
                      {point.crop_type === "rice" ? "🌾 Padi" : "🌽 Jagung"} ·{" "}
                      {Math.round(point.confidence * 100)}% keyakinan
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{point.month}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {data && data.total === 0 && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white rounded-xl shadow px-5 py-4 text-center max-w-xs">
                <p className="text-2xl mb-2">🗺️</p>
                <p className="text-sm font-medium text-gray-700">Belum ada data di area ini</p>
                <p className="text-xs text-gray-400 mt-1">
                  Coba perluas rentang waktu atau hapus filter
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-komponen ──────────────────────────────────────────────────────────────

function StatRow({
  label,
  value,
  color = "text-gray-900",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span
        className="inline-block w-3 h-3 rounded-full border border-white shadow-sm"
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  );
}

function PointDetail({
  point,
  onClose,
}: {
  point: DiseasePoint;
  onClose: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-primary/20 p-4 relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
        aria-label="Tutup"
      >
        ×
      </button>
      <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Titik Dipilih</p>
      <p className="font-semibold text-gray-900 text-sm leading-tight">
        {DISEASE_LABELS[point.disease] ?? point.disease}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {point.crop_type === "rice" ? "🌾 Padi" : "🌽 Jagung"} · {Math.round(point.confidence * 100)}% keyakinan
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{point.month}</p>
      <p className="text-xs text-gray-300 mt-1.5 font-mono">
        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
      </p>
    </div>
  );
}
