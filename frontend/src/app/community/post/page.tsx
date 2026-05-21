import { Suspense } from "react";
import PostDetailContent from "./PostDetailContent";

export default function PostDetailPage() {
  return (
    <Suspense fallback={<PostDetailSkeleton />}>
      <PostDetailContent />
    </Suspense>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-10 text-center sm:pb-20 sm:pt-12">
      <p className="text-sm text-ink-muted">Memuat diskusi...</p>
    </div>
  );
}
