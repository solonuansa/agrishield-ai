/**
 * Halaman manajemen lahan — list, tambah, edit, hapus lahan milik user.
 * Memerlukan autentikasi.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fieldsApi, type Field, type CreateFieldPayload } from "@/api/fields";
import { useAuthStore } from "@/stores/authStore";
import type { CropType } from "@/api/scans";

export default function FieldsPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Redirect ke login jika belum auth
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const { data: fields = [], isLoading, isError } = useQuery({
    queryKey: ["fields"],
    queryFn: fieldsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: fieldsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fields"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateFieldPayload }) =>
      fieldsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fields"] });
      setEditingField(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: fieldsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fields"] });
      setDeleteConfirm(null);
    },
  });

  function handleEdit(field: Field) {
    setEditingField(field);
    setShowForm(false);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingField(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/" className="text-primary font-bold text-lg">AgriShield AI</a>
          <nav className="flex items-center gap-4">
            <a href="/scan" className="text-sm text-gray-500 hover:text-primary transition-colors">Scan</a>
            <a href="/history" className="text-sm text-gray-500 hover:text-primary transition-colors">Riwayat</a>
            <a href="/map" className="text-sm text-gray-500 hover:text-primary transition-colors">Peta</a>
            <a href="/dashboard" className="text-sm text-gray-500 hover:text-primary transition-colors">Dashboard</a>
            <span className="text-sm font-medium text-primary">Lahan</span>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Judul + tombol tambah */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lahan Saya</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kelola data lahan pertanian Anda</p>
          </div>
          {!showForm && !editingField && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-600 transition-colors"
            >
              + Tambah Lahan
            </button>
          )}
        </div>

        {/* Form tambah lahan */}
        {showForm && (
          <FieldForm
            onSubmit={(payload) => createMutation.mutate(payload)}
            onCancel={handleCancelForm}
            isLoading={createMutation.isPending}
            error={createMutation.isError ? "Gagal menyimpan lahan. Coba lagi." : null}
          />
        )}

        {/* Form edit lahan */}
        {editingField && (
          <FieldForm
            initial={editingField}
            onSubmit={(payload) => updateMutation.mutate({ id: editingField.id, payload })}
            onCancel={handleCancelForm}
            isLoading={updateMutation.isPending}
            error={updateMutation.isError ? "Gagal memperbarui lahan. Coba lagi." : null}
          />
        )}

        {/* State loading */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* State error */}
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            Gagal memuat data lahan. Periksa koneksi dan muat ulang halaman.
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && fields.length === 0 && !showForm && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🌱</p>
            <p className="text-gray-600 font-medium mb-1">Belum ada lahan terdaftar</p>
            <p className="text-sm text-gray-400 mb-6">Tambahkan lahan pertanian Anda untuk mulai memantau kesehatan tanaman</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-600 transition-colors"
            >
              Tambah Lahan Pertama
            </button>
          </div>
        )}

        {/* List lahan */}
        {!isLoading && fields.length > 0 && (
          <div className="space-y-3">
            {fields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                isDeleting={deleteMutation.isPending && deleteConfirm === field.id}
                deleteConfirm={deleteConfirm === field.id}
                onEdit={() => handleEdit(field)}
                onDeleteRequest={() => setDeleteConfirm(field.id)}
                onDeleteConfirm={() => deleteMutation.mutate(field.id)}
                onDeleteCancel={() => setDeleteConfirm(null)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── FieldCard ─────────────────────────────────────────────────────────────────

interface FieldCardProps {
  field: Field;
  isDeleting: boolean;
  deleteConfirm: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

function FieldCard({
  field,
  isDeleting,
  deleteConfirm,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: FieldCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Nama lahan + ikon tanaman */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{field.crop_type === "rice" ? "🌾" : field.crop_type === "corn" ? "🌽" : "🌱"}</span>
            <h3 className="font-semibold text-gray-900 truncate">{field.name}</h3>
          </div>

          {/* Detail lahan */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
            {field.location_name && (
              <span>📍 {field.location_name}</span>
            )}
            {field.area_hectares != null && (
              <span>{field.area_hectares} ha</span>
            )}
            {field.latitude != null && field.longitude != null && (
              <span className="font-mono">{field.latitude.toFixed(4)}, {field.longitude.toFixed(4)}</span>
            )}
            {!field.location_name && field.latitude == null && field.area_hectares == null && (
              <span className="italic">Belum ada detail</span>
            )}
          </div>
        </div>

        {/* Tombol aksi */}
        {!deleteConfirm && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onEdit}
              className="text-xs text-gray-400 hover:text-primary transition-colors px-2 py-1"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDeleteRequest}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
            >
              Hapus
            </button>
          </div>
        )}
      </div>

      {/* Konfirmasi hapus */}
      {deleteConfirm && (
        <div className="mt-4 pt-4 border-t border-red-100 flex items-center justify-between">
          <p className="text-sm text-red-600">Hapus lahan ini permanen?</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDeleteCancel}
              disabled={isDeleting}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onDeleteConfirm}
              disabled={isDeleting}
              className="text-sm text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FieldForm ─────────────────────────────────────────────────────────────────

interface FieldFormProps {
  initial?: Field;
  onSubmit: (payload: CreateFieldPayload) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

function FieldForm({ initial, onSubmit, onCancel, isLoading, error }: FieldFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [locationName, setLocationName] = useState(initial?.location_name ?? "");
  const [lat, setLat] = useState(initial?.latitude != null ? String(initial.latitude) : "");
  const [lng, setLng] = useState(initial?.longitude != null ? String(initial.longitude) : "");
  const [area, setArea] = useState(initial?.area_hectares != null ? String(initial.area_hectares) : "");
  const [cropType, setCropType] = useState<CropType | "">(initial?.crop_type ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: CreateFieldPayload = {
      name: name.trim(),
    };
    if (locationName.trim()) payload.location_name = locationName.trim();
    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        payload.latitude = parsedLat;
        payload.longitude = parsedLng;
      }
    }
    if (area) {
      const parsedArea = parseFloat(area);
      if (!isNaN(parsedArea) && parsedArea > 0) payload.area_hectares = parsedArea;
    }
    if (cropType) payload.crop_type = cropType;

    onSubmit(payload);
  }

  const isEdit = !!initial;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4"
    >
      <h2 className="font-semibold text-gray-900">
        {isEdit ? "Edit Lahan" : "Tambah Lahan Baru"}
      </h2>

      {/* Nama lahan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nama Lahan <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="cth: Sawah Blok A, Kebun Utara"
          required
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* Nama lokasi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nama Lokasi / Desa
        </label>
        <input
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="cth: Desa Sukamaju, Kec. Ciawi"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* Jenis tanaman */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Jenis Tanaman
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["", "rice", "corn"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCropType(type)}
              className={`
                py-2.5 rounded-xl border-2 text-sm font-medium transition-colors
                ${cropType === type
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary/40"
                }
              `}
            >
              {type === "" ? "Tidak dipilih" : type === "rice" ? "🌾 Padi" : "🌽 Jagung"}
            </button>
          ))}
        </div>
      </div>

      {/* Luas lahan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Luas Lahan (hektar)
        </label>
        <input
          type="number"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="cth: 0.5"
          min="0.01"
          step="0.01"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* Koordinat manual */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Koordinat GPS (opsional)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude (-90 s/d 90)"
            step="any"
            min="-90"
            max="90"
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <input
            type="number"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="Longitude (-180 s/d 180)"
            step="any"
            min="-180"
            max="180"
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Tombol aksi form */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={!name.trim() || isLoading}
          className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
        >
          {isLoading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Lahan"}
        </button>
      </div>
    </form>
  );
}
