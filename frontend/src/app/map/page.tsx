"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { List, MapPin, TriangleAlert, SlidersHorizontal } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatDateID } from "@/lib/ui";
import type { HeatmapResponse, HeatmapPoint } from "@/types/api";

const HeatmapMap = dynamic(() => import("@/components/map/HeatmapMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-ink-muted">
      Memuat peta…
    </div>
  ),
});

function toCropLabel(value: string) {
  return value === "rice" ? "Padi" : "Jagung";
}

function confidenceColor(confidence: number) {
  if (confidence >= 0.85) return "#b91c1c";
  if (confidence >= 0.5) return "#a16207";
  return "#15803d";
}

export default function MapPage() {
  const { data: heatmap, isLoading, isError } = useQuery<HeatmapResponse>({
    queryKey: ["heatmap"],
    queryFn: () => apiGet<HeatmapResponse>("/map/heatmap?months=6", null, "force-cache"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const [cropFilter, setCropFilter] = useState<"all" | "rice" | "corn">("all");
  const [minConfidence, setMinConfidence] = useState(0);

  const allPoints = useMemo(() => heatmap?.points ?? [], [heatmap?.points]);

  const filteredPoints = useMemo<HeatmapPoint[]>(() => {
    return allPoints.filter((p) => {
      if (cropFilter !== "all" && p.crop_type !== cropFilter) return false;
      if (p.confidence < minConfidence) return false;
      return true;
    });
  }, [allPoints, cropFilter, minConfidence]);

  const highRisk = useMemo(
    () => allPoints.filter((p) => p.confidence >= 0.85).length,
    [allPoints]
  );
  const provinces = useMemo(
    () => new Set(allPoints.map((p) => `${p.lat.toFixed(1)}:${p.lng.toFixed(1)}`)).size,
    [allPoints]
  );

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
          <p className="font-serif text-3xl font-semibold text-forest-700">{allPoints.length}</p>
          <p className="mt-1 text-sm text-ink-muted">Titik laporan</p>
        </div>
        <div>
          <p className="font-serif text-3xl font-semibold text-clay">{highRisk}</p>
          <p className="mt-1 text-sm text-ink-muted">Keyakinan tinggi (&gt;= 85%)</p>
        </div>
        <div>
          <p className="font-serif text-3xl font-semibold text-ink-soft">{provinces}</p>
          <p className="mt-1 text-sm text-ink-muted">Klaster lokasi unik</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-ink-soft">
          <SlidersHorizontal className="h-4 w-4" />
          Filter:
        </div>
        <div className="flex gap-1.5">
          {(["all", "rice", "corn"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setCropFilter(key)}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                cropFilter === key
                  ? "bg-forest-700 text-cream"
                  : "bg-cream-darker/40 text-ink-muted hover:bg-cream-darker/70"
              }`}
            >
              {key === "all" ? "Semua" : toCropLabel(key)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">Min. keyakinan:</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(minConfidence * 100)}
            onChange={(e) => setMinConfidence(Number(e.target.value) / 100)}
            className="h-1 w-24 accent-forest-700"
          />
          <span className="w-8 text-xs tabular-nums text-ink-soft">{Math.round(minConfidence * 100)}%</span>
        </div>
      </div>

      {/* Map */}
      <div className="mt-6 overflow-hidden rounded border border-cream-darker">
        <div className="flex items-center gap-2 border-b border-cream-darker px-4 py-3 text-sm font-medium text-ink-soft">
          <MapPin className="h-4 w-4 text-forest-700" />
          Peta sebaran
          <span className="ml-auto text-xs text-ink-muted">
            Menampilkan {filteredPoints.length} titik
          </span>
        </div>
        {isLoading ? (
          <div className="flex h-[28rem] items-center justify-center text-sm text-ink-muted">
            Memuat data peta…
          </div>
        ) : isError ? (
          <div className="flex h-[28rem] items-center justify-center text-sm text-clay-dark">
            Gagal memuat data peta.
          </div>
        ) : allPoints.length === 0 ? (
          <div className="flex h-[28rem] flex-col items-center justify-center text-center">
            <TriangleAlert className="h-6 w-6 text-ink-muted/60" />
            <p className="mt-3 text-sm text-ink-muted">
              Data peta belum tersedia. Jalankan scan dengan GPS aktif untuk menambahkan titik baru.
            </p>
          </div>
        ) : (
          <div className="h-[28rem] w-full">
            <HeatmapMap points={filteredPoints} />
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-8 overflow-hidden rounded border border-cream-darker bg-cream-dark/40">
        <div className="flex items-center gap-2 border-b border-cream-darker px-4 py-3 text-sm font-medium text-ink-soft">
          <List className="h-4 w-4 text-forest-700" />
          Daftar titik sebaran terbaru
        </div>
        {isLoading ? (
          <div className="px-4 py-10 text-center text-sm text-ink-muted">Memuat data peta…</div>
        ) : isError ? (
          <div className="px-4 py-10 text-center text-sm text-clay-dark">Gagal memuat data peta.</div>
        ) : filteredPoints.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <TriangleAlert className="mx-auto h-6 w-6 text-ink-muted/60" />
            <p className="mt-3 text-sm text-ink-muted">
              Tidak ada titik yang cocok dengan filter. Ubah filter untuk melihat hasil.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-cream-darker/60">
            {filteredPoints.slice(0, 20).map((point) => (
              <li
                key={point.scan_id}
                className="grid gap-2 px-4 py-4 sm:grid-cols-[1.4fr_0.9fr_0.9fr_0.8fr] sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: confidenceColor(point.confidence) }}
                  />
                  <div>
                    <p className="text-sm font-medium text-ink-soft">{point.disease}</p>
                    <p className="text-xs text-ink-muted">
                      Scan #{point.scan_id.slice(0, 8)} - {toCropLabel(point.crop_type)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-ink-muted">
                  Lat {point.lat.toFixed(4)}, Lng {point.lng.toFixed(4)}
                </p>
                <p className="text-xs text-ink-muted">Bulan {formatDateID(`${point.month}-01`)}</p>
                <p className="text-sm font-semibold" style={{ color: confidenceColor(point.confidence) }}>
                  {Math.round(point.confidence * 100)}%
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
