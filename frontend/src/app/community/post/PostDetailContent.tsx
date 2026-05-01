"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import { getMockCommunityPostDetailById } from "@/lib/mock-community";
import { formatDateID } from "@/lib/ui";
import type { PostDetail } from "@/types/api";

function cropLabel(value: PostDetail["crop_type"]) {
  if (value === "rice") return "Padi";
  if (value === "corn") return "Jagung";
  return "Umum";
}

export default function PostDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const mockPost = id ? getMockCommunityPostDetailById(id) : null;

  const { data: post, isLoading, isError } = useQuery<PostDetail>({
    queryKey: ["community-post", id],
    queryFn: () => apiGet<PostDetail>(`/community/posts/${id}`),
    enabled: Boolean(id && !mockPost),
  });

  if (!id) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20 text-center">
        <p className="text-sm text-clay-dark">ID diskusi tidak ditemukan.</p>
        <Link href="/community" className="mt-4 inline-block text-sm font-medium text-forest-700 hover:text-clay">
          Kembali ke Komunitas
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20 text-center">
        <p className="text-sm text-ink-muted">Memuat diskusi...</p>
      </div>
    );
  }

  const displayPost = post ?? mockPost;

  if (isError || !displayPost) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20 text-center">
        <p className="text-sm text-clay-dark">Gagal memuat diskusi.</p>
        <Link href="/community" className="mt-4 inline-block text-sm font-medium text-forest-700 hover:text-clay">
          Kembali ke Komunitas
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <Link href="/community" className="inline-block text-sm font-medium text-ink-muted transition-colors hover:text-forest-700">
        Kembali ke Komunitas
      </Link>

      <article className="mt-8">
        <div className="mb-7 space-y-3 border-b border-cream-darker/50 pb-6">
          <span className="inline-block rounded bg-forest-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-forest-700">
            {cropLabel(displayPost.crop_type)}
          </span>
          <h1 className="font-serif text-4xl leading-tight text-forest-700">{displayPost.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
            <span>{displayPost.author.full_name}</span>
            <span>{formatDateID(displayPost.created_at)}</span>
            <span>{displayPost.comment_count} komentar</span>
            <span>{displayPost.like_count} suka</span>
          </div>
        </div>

        {mockPost && (
          <div className="mb-5 rounded border border-clay/25 bg-clay/10 px-4 py-3 text-sm text-clay-dark">
            Ini adalah data diskusi contoh (mock) untuk kebutuhan pengembangan UI.
          </div>
        )}

        <p className="whitespace-pre-line text-base leading-8 text-ink-soft">{displayPost.body}</p>
      </article>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-forest-700">Komentar</h2>

        {displayPost.comments.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">Belum ada komentar.</p>
        ) : (
          <ul className="mt-5 divide-y divide-cream-darker/50">
            {displayPost.comments.map((comment) => (
              <li key={comment.id} className="py-4">
                <p className="text-sm font-medium text-ink-soft">{comment.author.full_name}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{comment.body}</p>
                <p className="mt-2 text-xs text-warm-gray">{formatDateID(comment.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
