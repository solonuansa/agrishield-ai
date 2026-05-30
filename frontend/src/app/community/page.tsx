"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { apiGet } from "@/lib/api";
import { getAccessToken, readSession } from "@/lib/auth";
import { MOCK_COMMUNITY_POSTS } from "@/lib/mock-community";
import { formatDateID } from "@/lib/ui";
import type { CommunityPost } from "@/types/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonLines } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import AnimatedSection from "@/components/ui/AnimatedSection";

const CATEGORY_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "question", label: "Pertanyaan" },
  { value: "experience", label: "Pengalaman" },
  { value: "tips", label: "Tips" },
] as const;

const PER_PAGE = 15;

function cropLabel(value: CommunityPost["crop_type"]) {
  if (value === "rice") return "Padi";
  if (value === "corn") return "Jagung";
  return "Umum";
}

export default function CommunityPage() {
  const router = useRouter();
  const session = readSession();
  const token = getAccessToken();
  const isLoggedIn = Boolean(session?.token);

  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const queryParams = new URLSearchParams();
  queryParams.set("per_page", String(PER_PAGE));
  queryParams.set("page", String(page));
  if (category !== "all") queryParams.set("category", category);

  const { data: result, isFetching } = useQuery<{
    posts: CommunityPost[];
    totalPages: number;
    total: number;
  }>({
    queryKey: ["community-posts", page, category],
    queryFn: async () => {
      try {
        const posts = await apiGet<CommunityPost[]>(
          `/community/posts?${queryParams.toString()}`,
          token,
        );
        if (posts.length > 0) {
          return { posts, totalPages: 1, total: posts.length };
        }
        return { posts: MOCK_COMMUNITY_POSTS, totalPages: 1, total: MOCK_COMMUNITY_POSTS.length };
      } catch {
        return { posts: MOCK_COMMUNITY_POSTS, totalPages: 1, total: MOCK_COMMUNITY_POSTS.length };
      }
    },
    placeholderData: { posts: MOCK_COMMUNITY_POSTS, totalPages: 1, total: MOCK_COMMUNITY_POSTS.length },
    retry: false,
  });

  const postList = result?.posts ?? [];
  const usingMockData = postList === MOCK_COMMUNITY_POSTS || postList.length === 0;

  // Filter client-side by search
  const filteredPosts = useMemo(() => {
    if (!search.trim()) return postList;
    const q = search.toLowerCase();
    return postList.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q),
    );
  }, [postList, search]);

  const displayedPosts = usingMockData ? MOCK_COMMUNITY_POSTS : filteredPosts;

  return (
    <div className="mx-auto max-w-4xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-12">
      <PageHeader
        title="Komunitas"
        description="Pelajari pengalaman lapangan, pertanyaan gejala, dan tips pencegahan dari sesama petani."
        action={
          <Link href={isLoggedIn ? "/community/post/new" : "/login?next=/community"}>
            <Button>Buat Diskusi</Button>
          </Link>
        }
      />

      {/* Search & Filter Bar */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Cari diskusi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input w-full pl-9 pr-3"
          />
        </div>
        <div className="flex gap-1.5">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setCategory(opt.value);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                category === opt.value
                  ? "bg-forest-700 text-cream"
                  : "bg-cream-dark/50 text-ink-muted hover:bg-cream-darker/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isFetching && displayedPosts.length === 0 ? (
        <SkeletonLines count={4} />
      ) : (
        <div>
          {usingMockData && (
            <div className="mb-4 rounded border border-clay/25 bg-clay/10 px-4 py-3 text-sm text-clay-dark">
              Menampilkan data diskusi contoh (mock) karena data komunitas belum tersedia dari server.
            </div>
          )}

          {search.trim() && filteredPosts.length === 0 ? (
            <EmptyState
              title="Tidak Ditemukan"
              description={`Tidak ada diskusi dengan kata "${search}".`}
            />
          ) : displayedPosts.length === 0 ? (
            <EmptyState
              title="Belum ada diskusi"
              description="Jadilah yang pertama memulai diskusi di komunitas."
              actionLabel="Buat Diskusi"
              onAction={() => router.push(isLoggedIn ? "/community/post/new" : "/login?next=/community")}
            />
          ) : (
            <>
              <div className="space-y-4">
                {displayedPosts.map((post, index) => (
                  <AnimatedSection key={post.id} delay={index * 0.1}>
                    <Link href={`/community/post/?id=${post.id}`} className="group block">
                      <Card variant="interactive" className="p-6">
                        <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                          {post.is_pinned && (
                            <span className="rounded bg-clay/15 px-1.5 py-0.5 text-[0.65rem] font-medium text-clay-dark">
                              Disematkan
                            </span>
                          )}
                          <Badge variant="default">{cropLabel(post.crop_type)}</Badge>
                          <Badge variant="info">{post.category}</Badge>
                          <span>{post.comment_count} balasan</span>
                          <span>{post.like_count} suka</span>
                          <span>{formatDateID(post.created_at)}</span>
                        </div>
                        <h3 className="font-serif text-2xl leading-snug text-forest-700 transition-colors group-hover:text-clay">
                          {post.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
                          {post.body}
                        </p>
                        <p className="mt-2 text-sm text-ink-soft">
                          oleh {post.author.full_name}
                        </p>
                      </Card>
                    </Link>
                  </AnimatedSection>
                ))}
              </div>

              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={result?.totalPages ?? 1}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
