export type ApiSuccess<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown> | null;
};

const CANDIDATE_API_BASES = [
  process.env.INTERNAL_API_BASE,
  process.env.NEXT_PUBLIC_API_BASE,
  "http://localhost:8000/api",
  "http://api:8000/api",
].filter(Boolean) as string[];

export async function serverApiGet<T>(
  path: string,
  cache: RequestCache = "force-cache",
  revalidateSeconds = 60
): Promise<T | null> {
  for (const baseUrl of CANDIDATE_API_BASES) {
    const normalized = baseUrl.replace(/\/$/, "");

    try {
      const response = await fetch(`${normalized}${path}`, {
        cache,
        next: { revalidate: revalidateSeconds },
        signal: AbortSignal.timeout(2500),
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as ApiSuccess<T>;
      return payload.data;
    } catch {
      continue;
    }
  }

  return null;
}

