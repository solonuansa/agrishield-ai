/**
 * Halaman forum community — feed post dengan filter kategori dan form buat post baru.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communityApi, type Post, type PostCategory, type CreatePostPayload } from "@/api/community";
import { useAuthStore } from "@/stores/authStore";
import AlertBell from "@/components/AlertBell";

const CATEGORY_LABELS: Record<PostCategory, string> = {
  question: "Pertanyaan",
  experience: "Pengalaman",
  tips: "Tips",
  alert: "Peringatan",
};

const CATEGORY_COLORS: Record<PostCategory, string> = {
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

export default function CommunityPage() {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<PostCategory | "">("");
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["community-posts", page, activeCategory],
    queryFn: () =>
      communityApi.listPosts({
        page,
        per_page: 20,
        category: activeCategory || undefined,
      }),
  });

  const likeMutation = useMutation({
    mutationFn: communityApi.toggleLike,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: communityApi.deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/" className="text-primary font-bold text-lg">AgriShield AI</a>
          <nav className="flex items-center gap-4">
            <a href="/scan" className="text-sm text-gray-500 hover:text-primary transition-colors">Scan</a>
            <a href="/map" className="text-sm text-gray-500 hover:text-primary transition-colors">Peta</a>
            <a href="/dashboard" className="text-sm text-gray-500 hover:text-primary transition-colors">Dashboard</a>
            <span className="text-sm font-medium text-primary">Forum</span>
            <AlertBell />
            {isAuthenticated ? (
              <span className="text-sm text-gray-400">{user?.full_name}</span>
            ) : (
              <a href="/login" className="text-sm text-primary font-medium hover:underline">Masuk</a>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* Judul + tombol buat post */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Forum Petani</h1>
            <p className="text-sm text-gray-500 mt-0.5">Berbagi pengalaman dan tanya jawab seputar pertanian</p>
          </div>
          {isAuthenticated && !showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-600 transition-colors"
            >
              + Buat Post
            </button>
          )}
        </div>

        {/* Form buat post */}
        {showForm && (
          <PostForm
            onSubmit={async (payload) => {
              await communityApi.createPost(payload);
              queryClient.invalidateQueries({ queryKey: ["community-posts"] });
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Filter kategori */}
        <div className="flex gap-2 flex-wrap">
          {(["", "question", "experience", "tips", "alert"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => { setActiveCategory(cat); setPage(1); }}
              className={`
                text-sm px-3 py-1.5 rounded-full border transition-colors
                ${activeCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary/40"
                }
              `}
            >
              {cat === "" ? "Semua" : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-1/4 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            Gagal memuat forum. Periksa koneksi dan coba lagi.
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && data?.posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-500">Belum ada post di kategori ini.</p>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Jadilah yang pertama berbagi
              </button>
            )}
          </div>
        )}

        {/* Daftar post */}
        {!isLoading && data && data.posts.length > 0 && (
          <div className="space-y-3">
            {data.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onLike={() => isAuthenticated && likeMutation.mutate(post.id)}
                onDelete={() => deleteMutation.mutate(post.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.meta.total_pages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 disabled:opacity-40 hover:border-primary/40 transition-colors"
            >
              Sebelumnya
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              {page} / {data.meta.total_pages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(data.meta.total_pages, p + 1))}
              disabled={page === data.meta.total_pages}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 disabled:opacity-40 hover:border-primary/40 transition-colors"
            >
              Berikutnya
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── PostCard ──────────────────────────────────────────────────────────────────

function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
}: {
  post: Post;
  currentUserId?: string;
  onLike: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isOwner = currentUserId === post.author.id;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${post.is_pinned ? "border-primary/30 bg-primary/5" : ""}`}>
      {/* Meta baris atas */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {post.is_pinned && (
          <span className="text-xs font-medium text-primary">Disematkan</span>
        )}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category]}`}>
          {CATEGORY_LABELS[post.category]}
        </span>
        {post.crop_type && (
          <span className="text-xs text-gray-400">
            {post.crop_type === "rice" ? "🌾 Padi" : "🌽 Jagung"}
          </span>
        )}
        <span className="text-xs text-gray-400 ml-auto">{formatRelativeTime(post.created_at)}</span>
      </div>

      {/* Judul */}
      <a href={`/community/${post.id}`} className="block group">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors mb-1 leading-snug">
          {post.title}
        </h3>
      </a>

      {/* Preview body */}
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.body}</p>

      {/* Footer */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400">oleh {post.author.full_name}</span>
        <div className="flex items-center gap-3 ml-auto">
          {/* Like */}
          <button
            type="button"
            onClick={onLike}
            className={`flex items-center gap-1 text-xs transition-colors ${post.is_liked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
          >
            <span>{post.is_liked ? "♥" : "♡"}</span>
            <span>{post.like_count}</span>
          </button>
          {/* Komentar */}
          <a
            href={`/community/${post.id}`}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
          >
            <span>💬</span>
            <span>{post.comment_count}</span>
          </a>
          {/* Hapus — hanya untuk pemilik */}
          {isOwner && !confirmDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-gray-300 hover:text-red-400 transition-colors"
            >
              Hapus
            </button>
          )}
          {isOwner && confirmDelete && (
            <span className="flex items-center gap-1">
              <button type="button" onClick={onDelete} className="text-xs text-red-500 font-medium">Ya</button>
              <span className="text-xs text-gray-300">/</span>
              <button type="button" onClick={() => setConfirmDelete(false)} className="text-xs text-gray-400">Batal</button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PostForm ──────────────────────────────────────────────────────────────────

function PostForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (payload: CreatePostPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<PostCategory>("question");
  const [cropType, setCropType] = useState<"" | "rice" | "corn">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        body: body.trim(),
        category,
        crop_type: cropType || undefined,
      });
    } catch {
      setError("Gagal membuat post. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <h2 className="font-semibold text-gray-900">Buat Post Baru</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Judul <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tuliskan pertanyaan atau judul postingan Anda"
          maxLength={255}
          required
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Isi Post <span className="text-red-400">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ceritakan lebih detail..."
          rows={4}
          required
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
        />
      </div>

      {/* Kategori */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(CATEGORY_LABELS) as [PostCategory, string][]).map(([cat, label]) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`text-sm px-3 py-1.5 rounded-full border-2 transition-colors ${
                category === cat
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 text-gray-600 hover:border-primary/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Jenis tanaman */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanaman terkait</label>
        <div className="flex gap-2">
          {(["", "rice", "corn"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCropType(type)}
              className={`text-sm px-3 py-1.5 rounded-full border-2 transition-colors ${
                cropType === type
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 text-gray-600 hover:border-primary/40"
              }`}
            >
              {type === "" ? "Umum" : type === "rice" ? "🌾 Padi" : "🌽 Jagung"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={!title.trim() || !body.trim() || loading}
          className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:bg-gray-200 disabled:text-gray-400 hover:bg-primary-600 transition-colors"
        >
          {loading ? "Memposting..." : "Posting"}
        </button>
      </div>
    </form>
  );
}
