/**
 * Hook untuk meminta dan menyimpan koordinat GPS dari browser.
 * Tidak menggunakan useEffect — lokasi hanya diminta saat user klik tombol.
 */
import { useState } from "react";

export type GeolocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

export interface Coords {
  lat: number;
  lng: number;
  accuracy: number; // meter
}

export interface UseGeolocationReturn {
  status: GeolocationStatus;
  coords: Coords | null;
  request: () => void;
  clear: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [status, setStatus] = useState<GeolocationStatus>(
    typeof navigator !== "undefined" && !navigator.geolocation ? "unavailable" : "idle"
  );
  const [coords, setCoords] = useState<Coords | null>(null);

  function request() {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        });
        setStatus("granted");
      },
      () => {
        setStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 60_000, // cache posisi 1 menit — tidak perlu minta ulang jika baru saja
      }
    );
  }

  function clear() {
    setCoords(null);
    setStatus("idle");
  }

  return { status, coords, request, clear };
}
