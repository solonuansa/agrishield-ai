import { MapPin, TriangleAlert } from "lucide-react";
import { serverApiGet } from "@/lib/server-api";
import { formatDateID } from "@/lib/ui";

type HeatmapPoint = {
  scan_id: string;
  lat: number;
  lng: number;
  disease: string;
  crop_type: "rice" | "corn";
  confidence: number;
  month: string;
};

type HeatmapResponse = {
  points: HeatmapPoint[];
  total: number;
};

function toCropLabel(value: string) {
  return value === "rice" ? "Padi" : "Jagung";
}

export default async function MapPage() {
  const heatmap = await serverApiGet<HeatmapResponse>("/map/heatmap?months=6");
  const points = heatmap?.points ?? [];

  const highRisk = points.filter((point) => point.confidence >= 0.85).length;
  const provinces = new Set(points.map((point) => `${point.lat.toFixed(1)}:${point.lng.toFixed(1)}`)).size;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="mb-10 space-y-3">
        <p className="section-kicker">Peta</p>
        <h1 className="page-title">Penyebaran penyakit tanaman.</h1>
        <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
          Titik berikut berasal dari hasil scan dalam 6 bulan terakhir. Gunakan data ini untuk memantau area rawan lebih dini.
        </p>
      </div>

      <div className="grid gap-4 border-y border-cream-darker py-6 sm:grid-cols-3">
        <div>
          <p className="text-3xl font-semibold font-serif text-forest-700">{points.length}</p>
          <p className="mt-1 text-sm text-ink-muted">Titik laporan</p>
        </div>
        <div>
          <p className="text-3xl font-semibold font-serif text-clay">{highRisk}</p>
          <p className="mt-1 text-sm text-ink-muted">Keyakinan tinggi (&gt;= 85%)</p>
        </div>
        <div>
          <p className="text-3xl font-semibold font-serif text-ink-soft">{provinces}</p>
          <p className="mt-1 text-sm text-ink-muted">Klaster lokasi unik</p>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded border border-cream-darker bg-cream-dark/40">
        <div className="flex items-center gap-2 border-b border-cream-darker px-4 py-3 text-sm font-medium text-ink-soft">
          <MapPin className="h-4 w-4 text-forest-700" />
          Titik sebaran terbaru
        </div>

        {points.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <TriangleAlert className="mx-auto h-6 w-6 text-ink-muted/60" />
            <p className="mt-3 text-sm text-ink-muted">
              Data peta belum tersedia. Jalankan scan dengan GPS aktif untuk menambahkan titik baru.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-cream-darker/60">
            {points.slice(0, 20).map((point) => (
              <li key={point.scan_id} className="grid gap-2 px-4 py-4 sm:grid-cols-[1.4fr_0.9fr_0.9fr_0.8fr] sm:items-center">
                <div>
                  <p className="text-sm font-medium text-ink-soft">{point.disease}</p>
                  <p className="text-xs text-ink-muted">Scan #{point.scan_id.slice(0, 8)} - {toCropLabel(point.crop_type)}</p>
                </div>
                <p className="text-xs text-ink-muted">Lat {point.lat.toFixed(4)}, Lng {point.lng.toFixed(4)}</p>
                <p className="text-xs text-ink-muted">Bulan {formatDateID(`${point.month}-01`)}</p>
                <p className="text-sm font-semibold text-forest-700">{Math.round(point.confidence * 100)}%</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


