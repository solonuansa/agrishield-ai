"use client";

import { Skeleton, SkeletonLines } from "./Skeleton";

interface PageLoadingProps {
  titleWidth?: string;
  lines?: number;
}

export function PageLoading({ titleWidth = "40%", lines = 4 }: PageLoadingProps) {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-12">
      <div className="space-y-3">
        <Skeleton variant="heading" width={titleWidth} />
        <Skeleton width="65%" height="0.9em" />
      </div>
      <div className="mt-10 space-y-6">
        <div className="rounded-lg border border-cream-300 bg-white/70 p-6 shadow-sm">
          <SkeletonLines count={lines} />
        </div>
        <div className="rounded-lg border border-cream-300 bg-white/70 p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Skeleton variant="card" />
            </div>
            <div className="space-y-2">
              <Skeleton variant="card" />
            </div>
            <div className="space-y-2">
              <Skeleton variant="card" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
