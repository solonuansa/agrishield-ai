"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { apiPost } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/lib/hooks/useToast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function CreatePostForm() {
  const { t } = useTranslation();
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
      setError(t("community.createPostPage.titleTooShort"));
      return;
    }
    if (body.trim().length < 10) {
      setError(t("community.createPostPage.bodyTooShort"));
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
      toast.success(t("community.createPostPage.submitSuccess"));
      router.push("/community");
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("community.createPostPage.submitError");
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
        {t("community.createPostPage.back")}
      </button>

      <PageHeader
        title={t("community.createPostPage.title")}
        description={t("community.createPostPage.description")}
      />

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Input
          label={t("community.createPostPage.titleLabel")}
          placeholder={t("community.createPostPage.titlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          required
        />

        <Textarea
          label={t("community.createPostPage.bodyLabel")}
          placeholder={t("community.createPostPage.bodyPlaceholder")}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          required
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <Select
            label={t("community.createPostPage.cropType")}
            options={[
              { value: "", label: t("community.createPostPage.cropPlaceholder") },
              { value: "rice", label: t("crop.rice") },
              { value: "corn", label: t("crop.corn") },
            ]}
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
          />
          <Select
            label={t("community.createPostPage.category")}
            options={[
              { value: "question", label: t("community.createPostPage.categoryQuestion") },
              { value: "experience", label: t("community.createPostPage.categoryExperience") },
              { value: "tips", label: t("community.createPostPage.categoryTips") },
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
            {submitting ? t("community.createPostPage.publishing") : t("community.createPostPage.publish")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            {t("community.createPostPage.cancel")}
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
