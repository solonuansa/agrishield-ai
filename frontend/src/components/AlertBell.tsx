/**
 * Bell icon dengan badge unread count untuk ditaruh di header.
 * Klik untuk toggle AlertPanel.
 */
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { alertsApi } from "@/api/alerts";
import AlertPanel from "./AlertPanel";

interface AlertBellProps {
  lat?: number;
  lng?: number;
}

export default function AlertBell({ lat, lng }: AlertBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["alerts", lat, lng],
    queryFn: () => alertsApi.list({ lat, lng }),
    // Polling setiap 5 menit untuk update badge count
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
  });

  const unreadCount = data?.unread_count ?? 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
        aria-label="Notifikasi peringatan wabah"
      >
        {/* Bell icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Badge unread */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <AlertPanel lat={lat} lng={lng} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
