"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { MOCK_COMMUNITY_POSTS } from "@/lib/mock-community";
import { formatDateID } from "@/lib/ui";
import type { CommunityPost } from "@/types/api";

function cropLabel(value: CommunityPost["crop_type"]) {
  if (value === "rice") return "Padi";
  if (value === "corn") return "Jagung";
  return "Umum";
}

export default function CommunityPage() {
  const { data: posts, isLoading, isError } = useQuery<CommunityPost[]>({
    queryKey: ["community-posts"],
    queryFn: async () => {
      return apiGet<CommunityPost[]>("/community/posts?per_page=15");
    },
  });

  const postList = posts ?? [];
  const usingMockData = isError || postList.length === 0;
  const displayedPosts = usingMockData ? MOCK_COMMUNITY_POSTS : postList;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="section-kicker">Komunitas</p>
          <h1 className="page-title">Diskusi petani Indonesia.</h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
            Pelajari pengalaman lapangan, pertanyaan gejala, dan tips pencegahan dari sesama petani.
          </p>
        </div>
        <Link href="/login?next=/community" className="btn-primary self-start sm:self-auto">
          Buat Diskusi
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink-muted">Memuat diskusi...</p>
      ) : (
        <div>
          {usingMockData && (
            <div className="mb-4 rounded border border-clay/25 bg-clay/10 px-4 py-3 text-sm text-clay-dark">
              Menampilkan data diskusi contoh (mock) karena data komunitas belum tersedia dari server.
            </div>
          )}
          <div className="divide-y divide-cream-darker/50">
            {displayedPosts.map((post) => (
              <Link key={post.id} href={`/community/post/?id=${post.id}`} className="group block py-6 transition-colors">
                <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                  <span className="rounded bg-forest-50 px-2 py-0.5 font-semibold uppercase tracking-wide text-forest-700">
                    {cropLabel(post.crop_type)}
                  </span>
                  <span>{post.comment_count} balasan</span>
                  <span>{post.like_count} suka</span>
                  <span>{formatDateID(post.created_at)}</span>
                </div>
                <h3 className="font-serif text-2xl leading-snug text-forest-700 transition-colors group-hover:text-clay">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">{post.body}</p>
                <p className="mt-2 text-sm text-ink-soft">oleh {post.author.full_name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
