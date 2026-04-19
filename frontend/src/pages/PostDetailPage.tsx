/**
 * Halaman detail post forum — tampilkan isi post + komentar.
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communityApi } from "@/api/community";
import { useAuthStore } from "@/stores/authStore";
import AlertBell from "@/components/AlertBell";

const CATEGORY_LABELS: Record<string, string> = {
  question: "Pertanyaan",
  experience: "Pengalaman",
  tips: "Tips",
  alert: "Peringatan",
};

const CATEGORY_COLORS: Record<string, string> = {
  question: "bg-blue-100 text-blue-700",
  experience: "bg-green-100 text-green-700",
  tips: "bg-yellow-100 text-yellow-700",
  alert: "bg-red-100 text-red-700",
};

function formatRelativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState("");

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post-detail", id],
    queryFn: () => communityApi.getPost(id!),
    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: () => communityApi.toggleLike(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post-detail", id] }),
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => communityApi.createComment(id!, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-detail", id] });
      setCommentBody("");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: communityApi.deleteComment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post-detail", id] }),
  });

  const deletePostMutation = useMutation({
    mutationFn: () => communityApi.deletePost(id!),
    onSuccess: () => navigate("/community"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Memuat post...</div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Post tidak ditemukan.</p>
          <a href="/community" className="text-primary hover:underline text-sm">Kembali ke forum</a>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === post.author.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/" className="text-primary font-bold text-lg">AgriShield AI</a>
          <nav className="flex items-center gap-4">
            <a href="/community" className="text-sm text-gray-500 hover:text-primary transition-colors">Forum</a>
            <AlertBell />
            {isAuthenticated ? (
              <span className="text-sm text-gray-400">{user?.full_name}</span>
            ) : (
              <a href="/login" className="text-sm text-primary font-medium hover:underline">Masuk</a>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Breadcrumb */}
        <a href="/community" className="text-sm text-gray-400 hover:text-primary transition-colors">
          &larr; Kembali ke forum
        </a>

        {/* Post utama */}
        <article className="bg-white rounded-2xl border border-gray-100 p-6">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] ?? "bg-gray-100 text-gray-600"}`}>
              {CATEGORY_LABELS[post.category] ?? post.category}
            </span>
            {post.crop_type && (
              <span className="text-xs text-gray-400">
                {post.crop_type === "rice" ? "🌾 Padi" : "🌽 Jagung"}
              </span>
            )}
            <span className="text-xs text-gray-400 ml-auto">{formatRelativeTime(post.created_at)}</span>
          </div>

          {/* Judul & isi */}
          <h1 className="text-xl font-bold text-gray-900 mb-3 leading-snug">{post.title}</h1>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>

          {/* Footer aksi */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">oleh <span className="font-medium text-gray-600">{post.author.full_name}</span></span>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={() => isAuthenticated && likeMutation.mutate()}
                disabled={!isAuthenticated || likeMutation.isPending}
                className={`flex items-center gap-1.5 text-sm transition-colors disabled:cursor-default ${
                  post.is_liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
                }`}
              >
                <span>{post.is_liked ? "♥" : "♡"}</span>
                <span>{post.like_count}</span>
              </button>

              <span className="text-sm text-gray-400">💬 {post.comment_count}</span>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Hapus post ini?")) deletePostMutation.mutate();
                  }}
                  disabled={deletePostMutation.isPending}
                  className="text-xs text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  Hapus Post
                </button>
              )}
            </div>
          </div>
        </article>

        {/* Seksi komentar */}
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-900">
            {post.comment_count} Komentar
          </h2>

          {/* Form komentar */}
          {isAuthenticated ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (commentBody.trim()) commentMutation.mutate(commentBody.trim());
              }}
              className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3"
            >
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Tulis komentar Anda..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentBody.trim() || commentMutation.isPending}
                  className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:bg-gray-200 disabled:text-gray-400 hover:bg-primary-600 transition-colors"
                >
                  {commentMutation.isPending ? "Mengirim..." : "Kirim Komentar"}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-sm text-gray-500">
                <a href="/login" className="text-primary hover:underline">Masuk</a> untuk menambah komentar
              </p>
            </div>
          )}

          {/* List komentar */}
          {post.comments.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada komentar. Jadilah yang pertama!</p>
          )}

          {post.comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">{comment.author.full_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{formatRelativeTime(comment.created_at)}</span>
                  {user?.id === comment.author.id && (
                    <button
                      type="button"
                      onClick={() => deleteCommentMutation.mutate(comment.id)}
                      disabled={deleteCommentMutation.isPending}
                      className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
