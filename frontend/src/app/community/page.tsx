import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import { formatDateID } from "@/lib/ui";

type CommunityAuthor = {
  id: string;
  full_name: string;
};

type CommunityPost = {
  id: string;
  title: string;
  body: string;
  category: string;
  crop_type: "rice" | "corn" | null;
  comment_count: number;
  like_count: number;
  created_at: string;
  author: CommunityAuthor;
};

function cropLabel(value: CommunityPost["crop_type"]) {
  if (value === "rice") return "Padi";
  if (value === "corn") return "Jagung";
  return "Umum";
}

export default async function CommunityPage() {
  const posts = (await serverApiGet<CommunityPost[]>("/community/posts?per_page=15")) ?? [];

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

      {posts.length === 0 ? (
        <div className="rounded border border-cream-darker bg-cream-dark/50 px-6 py-10 text-center text-sm text-ink-muted">
          Belum ada diskusi publik. Jadilah yang pertama berbagi pengalaman.
        </div>
      ) : (
        <div className="divide-y divide-cream-darker/50">
          {posts.map((post) => (
            <Link key={post.id} href={`/community/${post.id}`} className="group block py-6 transition-colors">
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
      )}
    </div>
  );
}

