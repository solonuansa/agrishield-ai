import Link from "next/link";
import { notFound } from "next/navigation";
import { serverApiGet } from "@/lib/server-api";
import { formatDateID } from "@/lib/ui";

type Author = {
  id: string;
  full_name: string;
};

type Comment = {
  id: string;
  body: string;
  created_at: string;
  author: Author;
};

type PostDetail = {
  id: string;
  title: string;
  body: string;
  crop_type: "rice" | "corn" | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  author: Author;
  comments: Comment[];
};

function cropLabel(value: PostDetail["crop_type"]) {
  if (value === "rice") return "Padi";
  if (value === "corn") return "Jagung";
  return "Umum";
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await serverApiGet<PostDetail>(`/community/posts/${id}`);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <Link href="/community" className="inline-block text-sm font-medium text-ink-muted transition-colors hover:text-forest-700">
        Kembali ke Komunitas
      </Link>

      <article className="mt-8">
        <div className="mb-7 space-y-3 border-b border-cream-darker/50 pb-6">
          <span className="inline-block rounded bg-forest-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-forest-700">
            {cropLabel(post.crop_type)}
          </span>
          <h1 className="font-serif text-4xl leading-tight text-forest-700">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
            <span>{post.author.full_name}</span>
            <span>{formatDateID(post.created_at)}</span>
            <span>{post.comment_count} komentar</span>
            <span>{post.like_count} suka</span>
          </div>
        </div>

        <p className="whitespace-pre-line text-base leading-8 text-ink-soft">{post.body}</p>
      </article>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-forest-700">Komentar</h2>

        {post.comments.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">Belum ada komentar.</p>
        ) : (
          <ul className="mt-5 divide-y divide-cream-darker/50">
            {post.comments.map((comment) => (
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

