"use client";

import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiGet } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type { FieldResponse as Field } from "@/types/api";

function cropLabel(value: Field["crop_type"]) {
  if (value === "rice") return "Padi";
  if (value === "corn") return "Jagung";
  return "Belum diatur";
}

function FieldsContent() {
  const token = getAccessToken();

  const fieldsQuery = useQuery({
    queryKey: ["fields"],
    queryFn: () => apiGet<Field[]>("/fields", token),
    enabled: Boolean(token),
  });

  const fields = fieldsQuery.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="section-kicker">Lahan</p>
          <h1 className="page-title">Kelola lahan Anda.</h1>
        </div>
      </div>

      {fieldsQuery.isLoading ? (
        <p className="text-sm text-ink-muted">Memuat data lahan...</p>
      ) : fieldsQuery.isError ? (
        <p className="text-sm text-clay-dark">Gagal memuat data lahan.</p>
      ) : fields.length === 0 ? (
        <p className="text-sm text-ink-muted">Belum ada lahan. Tambahkan dari API atau dashboard admin.</p>
      ) : (
        <div className="grid grid-cols-1 gap-0 border-t border-cream-darker md:grid-cols-3">
          {fields.map((field) => (
            <div
              key={field.id}
              className="-mx-4 border-b border-cream-darker px-4 py-8 transition-colors hover:bg-cream-dark/30 md:border-b-0 md:border-r"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-serif text-lg font-medium text-forest-700">{field.name}</h3>
                <span className="rounded bg-forest-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-forest-700">
                  {cropLabel(field.crop_type)}
                </span>
              </div>
              <p className="text-xs text-ink-muted">{field.location_name || "Lokasi belum diisi"}</p>
              <p className="mt-3 text-sm text-ink-soft">
                {field.area_hectares ? `${field.area_hectares.toFixed(2)} ha` : "Luas belum diisi"}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 bg-forest-700 p-8 text-cream">
        <h3 className="mb-2 font-serif text-xl font-medium">Catatan Lapangan</h3>
        <p className="text-sm leading-relaxed text-cream/70">
          Simpan tiap perubahan kondisi lahan secara rutin agar analisis penyakit dan rekomendasi makin akurat.
        </p>
      </div>
    </div>
  );
}

export default function FieldsPage() {
  return (
    <ProtectedRoute>
      <FieldsContent />
    </ProtectedRoute>
  );
}
