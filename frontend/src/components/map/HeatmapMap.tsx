"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { formatDateID } from "@/lib/ui";
import type { HeatmapPoint } from "@/types/api";

import "leaflet/dist/leaflet.css";

function toCropLabel(value: string) {
  return value === "rice" ? "Padi" : "Jagung";
}

function confidenceColor(confidence: number) {
  if (confidence >= 0.85) return "#b91c1c";
  if (confidence >= 0.5) return "#a16207";
  return "#15803d";
}

function confidenceLabel(confidence: number) {
  if (confidence >= 0.85) return "Tinggi";
  if (confidence >= 0.5) return "Sedang";
  return "Rendah";
}

function createDivIcon(confidence: number) {
  const color = confidenceColor(confidence);
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width:14px;height:14px;
      border-radius:50%;
      background:${color};
      border:2px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FitBounds({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();
  useMemo(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [map, points]);
  return null;
}

interface HeatmapMapProps {
  points: HeatmapPoint[];
}

export default function HeatmapMap({ points }: HeatmapMapProps) {
  if (points.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-ink-muted">
        Tidak ada titik yang cocok dengan filter.
      </div>
    );
  }

  return (
    <MapContainer
      center={[-2.5, 118]}
      zoom={5}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "#e8e4dc" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points.map((p) => ({ lat: p.lat, lng: p.lng }))} />
      {points.map((point) => (
        <Marker
          key={point.scan_id}
          position={[point.lat, point.lng]}
          icon={createDivIcon(point.confidence)}
        >
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-ink-soft">{point.disease}</p>
              <p className="text-xs text-ink-muted">
                {toCropLabel(point.crop_type)} — {formatDateID(`${point.month}-01`)}
              </p>
              <p className="text-xs">
                Keyakinan:{" "}
                <span
                  className="font-semibold"
                  style={{ color: confidenceColor(point.confidence) }}
                >
                  {Math.round(point.confidence * 100)}% ({confidenceLabel(point.confidence)})
                </span>
              </p>
              <p className="text-[0.65rem] text-ink-muted">
                Lat {point.lat.toFixed(4)}, Lng {point.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
