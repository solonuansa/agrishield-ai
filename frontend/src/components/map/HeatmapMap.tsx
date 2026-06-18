"use client";

import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { formatDateID } from "@/lib/ui";
import { toCropLabel, confidenceColor, confidenceLabel } from "@/lib/map-utils";
import type { HeatmapPoint } from "@/types/api";

import "leaflet/dist/leaflet.css";

const iconCache = new Map<number, L.DivIcon>();

function getDivIcon(confidence: number) {
  if (!iconCache.has(confidence)) {
    const size = 28 + Math.round(confidence * 24);
    iconCache.set(
      confidence,
      L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;background:${confidenceColor(confidence)};border:2px solid white;border-radius:50%;opacity:0.85;box-shadow:0 1px 4px rgba(0,0,0,0.25)"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      }),
    );
  }
  return iconCache.get(confidence)!;
}

function FitBounds({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();
  const stableKey = useMemo(
    () => points.map((p) => `${p.lat.toFixed(2)},${p.lng.toFixed(2)}`).join("|"),
    [points],
  );

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableKey, map]);

  return null;
}

export default function HeatmapMap({ points }: { points: HeatmapPoint[] }) {
  const { t } = useTranslation();
  const heatData: Array<[number, number, number]> = useMemo(
    () => points.map((p) => [p.lat, p.lng, p.confidence]),
    [points],
  );

  useEffect(() => {
    const heat = (L as unknown as { heatLayer: (data: Array<[number, number, number]>, opts: Record<string, unknown>) => L.Layer }).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      max: 1.0,
      gradient: { 0.4: "#15803d", 0.6: "#a16207", 0.85: "#b91c1c" },
    });
    const container = L.DomUtil.get("heatmap-container");
    if (container) heat.addTo((window as unknown as Record<string, unknown>).__map as L.Map);
    return () => { heat.remove(); };
  }, [heatData]);

  return (
    <div id="heatmap-container" style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={[-7.73, 110.37]}
        zoom={10}
        className="h-full w-full rounded"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {points.map((point) => (
          <Marker
            key={point.scan_id}
            position={[point.lat, point.lng]}
            icon={getDivIcon(point.confidence)}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{point.disease}</p>
                <p>{toCropLabel(point.crop_type, t)}</p>
                <p>{t(confidenceLabel(point.confidence))} ({Math.round(point.confidence * 100)}%)</p>
                <p className="text-xs text-ink-muted">{formatDateID(`${point.month}-01`)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
