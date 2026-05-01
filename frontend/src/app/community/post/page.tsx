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
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20 text-center">
      <p className="text-sm text-ink-muted">Memuat diskusi...</p>
    </div>
  );
}
