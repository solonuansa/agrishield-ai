"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { MOCK_COMMUNITY_POSTS } from "@/lib/mock-community";
import { formatDateID } from "@/lib/ui";
import type { CommunityPost } from "@/types/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonLines } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import AnimatedSection from "@/components/ui/AnimatedSection";

function cropLabel(value: CommunityPost["crop_type"]) {
  if (value === "rice") return "Padi";
  if (value === "corn") return "Jagung";
  return "Umum";
}

export default function CommunityPage() {
  const router = useRouter();
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
      <PageHeader
        title="Komunitas"
        description="Pelajari pengalaman lapangan, pertanyaan gejala, dan tips pencegahan dari sesama petani."
        action={
          <Link href="/login?next=/community">
            <Button>Buat Diskusi</Button>
          </Link>
        }
      />

      {isLoading ? (
        <SkeletonLines count={4} />
      ) : (
        <div>
          {usingMockData && (
            <div className="mb-4 rounded border border-clay/25 bg-clay/10 px-4 py-3 text-sm text-clay-dark">
              Menampilkan data diskusi contoh (mock) karena data komunitas belum tersedia dari server.
            </div>
          )}
          {displayedPosts.length === 0 ? (
            <EmptyState
              title="Belum ada diskusi"
              description="Jadilah yang pertama memulai diskusi di komunitas."
              actionLabel="Buat Diskusi"
              onAction={() => router.push("/login?next=/community")}
            />
          ) : (
            <div className="space-y-4">
              {displayedPosts.map((post, index) => (
                <AnimatedSection key={post.id} delay={index * 0.1}>
                  <Link href={`/community/post/?id=${post.id}`} className="group block">
                    <Card variant="interactive" className="p-6">
                      <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                        <Badge variant="default">{cropLabel(post.crop_type)}</Badge>
                        <span>{post.comment_count} balasan</span>
                        <span>{post.like_count} suka</span>
                        <span>{formatDateID(post.created_at)}</span>
                      </div>
                      <h3 className="font-serif text-2xl leading-snug text-forest-700 transition-colors group-hover:text-clay">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">{post.body}</p>
                      <p className="mt-2 text-sm text-ink-soft">oleh {post.author.full_name}</p>
                    </Card>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
