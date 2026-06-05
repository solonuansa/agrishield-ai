"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Heart } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { getAccessToken, readSession } from "@/lib/auth";
import { getMockCommunityPostDetailById } from "@/lib/mock-community";
import { formatDateID } from "@/lib/ui";
import type { PostDetail } from "@/types/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton, SkeletonLines } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/lib/hooks/useToast";

function cropLabel(value: PostDetail["crop_type"], t: (key: string) => string) {
  if (value === "rice") return t("crop.rice");
  if (value === "corn") return t("crop.corn");
  return t("crop.general");
}

export default function PostDetailContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const id = searchParams.get("id");
  const mockPost = id ? getMockCommunityPostDetailById(id) : null;
  const token = getAccessToken();
  const session = readSession();
  const isLoggedIn = Boolean(session?.token);

  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState("");

  const { data: post, isLoading } = useQuery<PostDetail>({
    queryKey: ["community-post", id],
    queryFn: async () => {
      if (mockPost) return mockPost;
      try {
        return await apiGet<PostDetail>(`/community/posts/${id}`, token);
      } catch {
        if (mockPost) return mockPost;
        throw new Error(t("community.postDetail.loadError"));
      }
    },
    enabled: Boolean(id),
    placeholderData: mockPost ?? undefined,
    retry: false,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiPost<{ liked: boolean }>(`/community/posts/${id}/like`, {}, token);
    },
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["community-post", id] });
      const prev = queryClient.getQueryData<PostDetail>(["community-post", id]);
      if (prev) {
        queryClient.setQueryData<PostDetail>(["community-post", id], {
          ...prev,
          is_liked: !prev.is_liked,
          like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1,
        });
      }
    },
    onError: () => {
      toast.error(t("community.postDetail.likeError"));
      queryClient.invalidateQueries({ queryKey: ["community-post", id] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      return apiPost(`/community/posts/${id}/comments`, { body: commentBody.trim() }, token);
    },
    onSuccess: () => {
      setCommentBody("");
      setCommentError("");
      toast.success(t("community.postDetail.commentAdded"));
      queryClient.invalidateQueries({ queryKey: ["community-post", id] });
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : t("community.postDetail.commentGenericError");
      setCommentError(msg);
    },
  });

  function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) {
      setCommentError(t("community.postDetail.commentError"));
      return;
    }
    commentMutation.mutate();
  }

  if (!id) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-10 text-center sm:pb-20 sm:pt-12">
        <p className="text-sm text-clay-dark">{t("community.postDetail.notFoundId")}</p>
        <Link href="/community" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 transition-colors hover:text-clay">
          <ArrowLeft size={16} />
          {t("community.postDetail.back")}
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-12">
        <div className="space-y-6">
          <Skeleton width="120px" />
          <Skeleton width="80px" height="1.3em" />
          <Skeleton variant="heading" width="70%" />
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" width="2rem" height="2rem" />
            <Skeleton width="120px" />
            <Skeleton width="100px" />
          </div>
          <SkeletonLines count={6} />
        </div>
      </div>
    );
  }

  const displayPost = post ?? mockPost;

  if (!displayPost) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-10 text-center sm:pb-20 sm:pt-12">
        <p className="text-sm text-clay-dark">{t("community.postDetail.loadError")}</p>
        <Link href="/community" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 transition-colors hover:text-clay">
          <ArrowLeft size={16} />
          {t("community.postDetail.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-12">
      <Link href="/community" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-forest-700">
        <ArrowLeft size={16} />
        {t("community.postDetail.back")}
      </Link>

      <article className="mt-8">
        <Card className="p-6">
          <div className="mb-7 space-y-3 border-b border-cream-darker/50 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">{cropLabel(displayPost.crop_type, t)}</Badge>
              <Badge variant="info">{displayPost.category}</Badge>
            </div>
            <h1 className="font-serif text-4xl leading-tight text-forest-700">{displayPost.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
              <span>{displayPost.author.full_name}</span>
              <span>{formatDateID(displayPost.created_at)}</span>
              <span>{t("community.postDetail.commentCount", { count: displayPost.comment_count })}</span>
              <span>{t("community.postDetail.likeCount", { count: displayPost.like_count })}</span>
            </div>
          </div>

          {mockPost && (
            <div className="mb-5 rounded border border-clay/25 bg-clay/10 px-4 py-3 text-sm text-clay-dark">
              {t("community.postDetail.mockBanner")}
            </div>
          )}

          <p className="whitespace-pre-line text-base leading-8 text-ink-soft">{displayPost.body}</p>

          {/* Like Button */}
          <div className="mt-6 flex items-center gap-4 border-t border-cream-darker/50 pt-4">
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => likeMutation.mutate()}
                disabled={mockPost !== null}
              >
                <Heart
                  size={16}
                  className={`mr-1.5 transition-colors ${
                    displayPost.is_liked ? "fill-clay text-clay" : ""
                  }`}
                />
                {displayPost.is_liked ? t("community.postDetail.likedLabel") : t("community.postDetail.likeLabel")} ({displayPost.like_count})
              </Button>
            ) : (
              <Link href={`/login?next=/community/post/?id=${id}`}>
                <Button variant="ghost" size="sm">
                  <Heart size={16} className="mr-1.5" />
                  {t("community.postDetail.likeLabel")} ({displayPost.like_count})
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </article>

      {/* Comments */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl text-forest-700">{t("community.postDetail.comments")}</h2>

        {displayPost.comments.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">{t("community.postDetail.noComments")}</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {displayPost.comments.map((comment) => (
              <li key={comment.id}>
                <Card variant="flat" className="p-4">
                  <p className="text-sm font-medium text-ink-soft">{comment.author.full_name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{comment.body}</p>
                  <p className="mt-2 text-xs text-warm-gray">{formatDateID(comment.created_at)}</p>
                </Card>
              </li>
            ))}
          </ul>
        )}

        {/* Comment Form */}
        {isLoggedIn ? (
          <form onSubmit={handleCommentSubmit} className="mt-8 space-y-4">
            <Textarea
              label={t("community.postDetail.writeComment")}
              placeholder={t("community.postDetail.commentPlaceholder")}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={3}
            />
            {commentError && (
              <p className="text-sm text-clay-dark" role="alert">{commentError}</p>
            )}
            <Button type="submit" disabled={commentMutation.isPending}>
              {commentMutation.isPending ? t("community.postDetail.sendingComment") : t("community.postDetail.sendComment")}
            </Button>
          </form>
        ) : (
          <div className="mt-8 rounded border border-cream-darker bg-cream-dark/30 p-4 text-center text-sm text-ink-muted">
            <Link href={`/login?next=/community/post/?id=${id}`} className="font-medium text-forest-700 hover:text-clay">
              {t("nav.login")}
            </Link>{" "}
            {t("community.postDetail.loginToComment")}
          </div>
        )}
      </section>
    </div>
  );
}
