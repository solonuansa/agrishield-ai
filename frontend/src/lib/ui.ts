export function formatDateID(isoDate?: string | null, locale = "id-ID"): string {
  if (!isoDate) return "-";

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

