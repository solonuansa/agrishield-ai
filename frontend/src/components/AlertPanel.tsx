/**
 * Panel notifikasi peringatan wabah penyakit.
 * Ditampilkan sebagai dropdown dari bell icon di header.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { alertsApi, type Alert } from "@/api/alerts";
import { useAuthStore } from "@/stores/authStore";

interface AlertPanelProps {
  lat?: number;
  lng?: number;
  onClose: () => void;
}

export default function AlertPanel({ lat, lng, onClose }: AlertPanelProps) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["alerts", lat, lng],
    queryFn: () => alertsApi.list({ lat, lng }),
    staleTime: 5 * 60 * 1000, // 5 menit
  });

  const markReadMutation = useMutation({
    mutationFn: alertsApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  function handleMarkAllRead() {
    if (!data?.alerts) return;
    const unread = data.alerts.filter((a) => !a.is_read).map((a) => a.id);
    if (unread.length > 0) markReadMutation.mutate(unread);
  }

  function handleMarkOne(alert: Alert) {
    if (!alert.is_read && isAuthenticated) {
      markReadMutation.mutate([alert.id]);
    }
  }

  const unreadCount = data?.unread_count ?? 0;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
      {/* Header panel */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm">Peringatan Wabah</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated && unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markReadMutation.isPending}
              className="text-xs text-primary hover:underline disabled:opacity-50"
            >
              Tandai semua dibaca
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            x
          </button>
        </div>
      </div>

      {/* Isi panel */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading && (
          <div className="space-y-3 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!data?.alerts || data.alerts.length === 0) && (
          <div className="text-center py-10 px-4">
            <p className="text-2xl mb-2">✓</p>
            <p className="text-sm text-gray-500">Tidak ada peringatan wabah di area Anda</p>
          </div>
        )}

        {!isLoading && data?.alerts && data.alerts.map((alert) => (
          <AlertItem
            key={alert.id}
            alert={alert}
            showMarkRead={isAuthenticated && !alert.is_read}
            onMarkRead={() => handleMarkOne(alert)}
          />
        ))}
      </div>

      {/* Footer */}
      {!isAuthenticated && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            <a href="/login" className="text-primary hover:underline">Masuk</a>
            {" "}untuk menyimpan status baca notifikasi
          </p>
        </div>
      )}
    </div>
  );
}

// ─── AlertItem ─────────────────────────────────────────────────────────────────

const SEVERITY_STYLE: Record<string, string> = {
  high: "bg-red-50 border-red-200",
  medium: "bg-yellow-50 border-yellow-200",
  low: "bg-blue-50 border-blue-200",
};

const SEVERITY_BADGE: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

const SEVERITY_LABEL: Record<string, string> = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

function AlertItem({
  alert,
  showMarkRead,
  onMarkRead,
}: {
  alert: Alert;
  showMarkRead: boolean;
  onMarkRead: () => void;
}) {
  const cardStyle = SEVERITY_STYLE[alert.severity] ?? SEVERITY_STYLE.medium;
  const badgeStyle = SEVERITY_BADGE[alert.severity] ?? SEVERITY_BADGE.medium;

  return (
    <div
      className={`
        px-4 py-3 border-b border-gray-100 last:border-0
        ${!alert.is_read ? "bg-white" : "bg-gray-50/50"}
      `}
    >
      <div className={`rounded-xl border p-3 ${cardStyle}`}>
        {/* Header baris */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeStyle}`}>
              {SEVERITY_LABEL[alert.severity] ?? alert.severity}
            </span>
            <span className="text-xs text-gray-500">
              {alert.crop_type === "rice" ? "🌾 Padi" : "🌽 Jagung"}
            </span>
            <span className="text-xs font-medium text-gray-700">
              · {alert.case_count} kasus
            </span>
          </div>
          {!alert.is_read && (
            <span className="w-2 h-2 bg-red-400 rounded-full shrink-0 mt-1" />
          )}
        </div>

        {/* Pesan */}
        <p className="text-xs text-gray-700 leading-relaxed">{alert.message}</p>

        {/* Lokasi + tombol tandai dibaca */}
        <div className="flex items-center justify-between mt-2">
          {alert.area_name && (
            <span className="text-xs text-gray-400">📍 {alert.area_name}</span>
          )}
          {showMarkRead && (
            <button
              type="button"
              onClick={onMarkRead}
              className="text-xs text-gray-400 hover:text-primary transition-colors ml-auto"
            >
              Tandai dibaca
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
