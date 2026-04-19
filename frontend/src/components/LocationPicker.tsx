/**
 * Komponen pemilih lokasi untuk form scan.
 * Menampilkan tombol "Gunakan lokasi saya" dan preview map kecil setelah lokasi didapat.
 *
 * Leaflet MapContainer dirender hanya setelah koordinat tersedia — sehingga
 * tidak ada overhead map saat lokasi belum diminta.
 *
 * State lokasi dikelola di luar komponen ini via useGeolocation hook,
 * lalu diteruskan ke sini sebagai props.
 */
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import type { Coords, GeolocationStatus } from "@/hooks/useGeolocation";

interface LocationPickerProps {
  status: GeolocationStatus;
  coords: Coords | null;
  onRequest: () => void;
  onClear: () => void;
}

export default function LocationPicker({
  status,
  coords,
  onRequest,
  onClear,
}: LocationPickerProps) {
  if (status === "unavailable") {
    return (
      <p className="text-xs text-gray-400 text-center py-2">
        Browser Anda tidak mendukung GPS
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tombol minta lokasi — hanya tampil sebelum granted */}
      {status !== "granted" && (
        <button
          type="button"
          onClick={onRequest}
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50"
        >
          {status === "loading" ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full" />
              Mengambil lokasi...
            </>
          ) : (
            <>
              📍 Gunakan lokasi saya{" "}
              <span className="text-gray-300 text-xs">(opsional)</span>
            </>
          )}
        </button>
      )}

      {status === "denied" && (
        <p className="text-xs text-red-500 text-center">
          Akses lokasi ditolak. Izinkan akses lokasi di pengaturan browser dan coba lagi.
        </p>
      )}

      {/* Preview map setelah lokasi didapat */}
      {status === "granted" && coords && (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          {/* Label + tombol hapus */}
          <div className="flex items-center justify-between px-3 py-2 bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
              <span>📍</span>
              <span>Lokasi terkunci</span>
              <span className="text-green-400 font-normal">
                · akurasi ~{coords.accuracy}m
              </span>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Hapus
            </button>
          </div>

          {/* Map kecil — height 140px */}
          <div style={{ height: 140 }}>
            <MapContainer
              center={[coords.lat, coords.lng]}
              zoom={15}
              zoomControl={false}
              attributionControl={false}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <CircleMarker
                center={[coords.lat, coords.lng]}
                radius={8}
                pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.8 }}
              />
            </MapContainer>
          </div>

          {/* Koordinat teks */}
          <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-400 font-mono text-center">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </div>
        </div>
      )}
    </div>
  );
}
