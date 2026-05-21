"use client";

import type { HTMLAttributes } from "react";

type SkeletonVariant = "text" | "heading" | "card" | "circle" | "chart";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
}

/** Text line with shimmer animation — default is a single short line */
function TextSkeleton({ width = "60%", height = "1em" }) {
  return (
    <div
      className="animate-shimmer rounded-sm"
      style={{ width, height }}
    />
  );
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  ...props
}: SkeletonProps) {
  switch (variant) {
    case "heading":
      return <TextSkeleton width={width || "40%"} height={height || "1.5em"} />;

    case "card":
      return (
        <div
          className={`border border-cream-300 rounded-lg p-4 space-y-3 ${className}`}
          {...props}
        >
          <TextSkeleton width="30%" height="1.3em" />
          <TextSkeleton width="90%" />
          <TextSkeleton width="70%" />
          <div className="flex gap-3 pt-2">
            <Skeleton variant="circle" />
            <div className="flex-1 space-y-1.5">
              <TextSkeleton width="50%" />
              <TextSkeleton width="35%" height="0.8em" />
            </div>
          </div>
        </div>
      );

    case "circle":
      return (
        <div
          className="animate-shimmer rounded-full shrink-0"
          style={{ width: width || "2.5rem", height: height || "2.5rem" }}
          {...props}
        />
      );

    case "chart":
      return (
        <div
          className={`animate-shimmer rounded-lg ${className}`}
          style={{
            width: width || "100%",
            height: height || "220px",
          }}
          {...props}
        />
      );

    default: // text
      return (
        <div
          className={`animate-shimmer rounded-sm ${className}`}
          style={{ width: width || "100%", height: height || "1em" }}
          {...props}
        />
      );
  }
}

/** Convenience: render N text skeleton lines */
export function SkeletonLines({ count = 3 }: { count?: number }) {
  const widths = ["90%", "75%", "60%", "80%", "50%"];
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}
