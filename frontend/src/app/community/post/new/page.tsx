"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { apiPost } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/lib/hooks/useToast";
import ProtectedRoute from "@/components/ProtectedRoute";

function CreatePostForm() {
  const router = useRouter();
  const toast = useToast();
  const token = getAccessToken();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cropType, setCropType] = useState<string>("");
  const [category, setCategory] = useState("question");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 5) {
      setError("Judul minimal 5 karakter.");
      return;
    }
    if (body.trim().length < 10) {
      setError("Isi diskusi minimal 10 karakter.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        body: body.trim(),
        category,
      };
      if (cropType) payload.crop_type = cropType;

      await apiPost("/community/posts", payload, token);
      toast.success("Diskusi berhasil dibuat!");
      router.push("/community");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal membuat diskusi.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-12">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-forest-700"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      <PageHeader
        title="Buat Diskusi Baru"
        description="Bagikan pertanyaan, pengalaman, atau tips dengan komunitas petani."
      />

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Input
          label="Judul Diskusi"
          placeholder="Contoh: Daun padi menguning setelah pemupukan"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          required
        />

        <Textarea
          label="Isi Diskusi"
          placeholder="Jelaskan pertanyaan, pengalaman, atau tips Anda secara detail..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          required
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <Select
            label="Jenis Tanaman"
            options={[
              { value: "", label: "— Pilih (opsional) —" },
              { value: "rice", label: "Padi" },
              { value: "corn", label: "Jagung" },
            ]}
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
          />
          <Select
            label="Kategori"
            options={[
              { value: "question", label: "Pertanyaan" },
              { value: "experience", label: "Pengalaman" },
              { value: "tips", label: "Tips" },
            ]}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-clay-dark" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Mempublikasikan..." : "Publikasikan"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <ProtectedRoute>
      <CreatePostForm />
    </ProtectedRoute>
  );
}
