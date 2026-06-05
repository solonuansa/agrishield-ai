"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonLines } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sprout } from "lucide-react";
import { apiGet } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type { FieldResponse as Field } from "@/types/api";

function cropLabel(value: Field["crop_type"], t: (key: string) => string) {
  if (value === "rice") return t("crop.rice");
  if (value === "corn") return t("crop.corn");
  return t("fields.notSet");
}

function FieldsContent() {
  const { t } = useTranslation();
  const token = getAccessToken();

  const fieldsQuery = useQuery({
    queryKey: ["fields"],
    queryFn: () => apiGet<Field[]>("/fields", token),
    enabled: Boolean(token),
  });

  const fields = fieldsQuery.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-12">
      <PageHeader title={t("fields.title")} description={t("fields.description")} />

      {fieldsQuery.isLoading ? (
        <SkeletonLines count={4} />
      ) : fieldsQuery.isError ? (
        <p className="text-sm text-clay-dark">{t("fields.error")}</p>
      ) : fields.length === 0 ? (
        <EmptyState
          icon={<Sprout size={36} strokeWidth={1.5} />}
          title={t("fields.emptyTitle")}
          description={t("fields.emptyDesc")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {fields.map((field) => (
            <Card key={field.id} variant="interactive" className="p-6">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-serif text-lg font-medium text-forest-700">{field.name}</h3>
                <Badge variant="default">{cropLabel(field.crop_type, t)}</Badge>
              </div>
              <p className="text-xs text-ink-muted">{field.location_name || t("fields.locationNotSet")}</p>
              <p className="mt-3 text-sm text-ink-soft">
                {field.area_hectares ? `${field.area_hectares.toFixed(2)} ha` : t("fields.areaNotSet")}
              </p>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-12 bg-forest-700 p-8 text-cream">
        <h3 className="mb-2 font-serif text-xl font-medium">{t("fields.fieldNoteTitle")}</h3>
        <p className="text-sm leading-relaxed text-cream/70">
          {t("fields.fieldNoteDesc")}
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
