"use client";

import * as React from "react";

// Minimal stub to satisfy module resolution; not used directly.
// Prefer using utility classes (e.g., pt-[56.25%]) for aspect ratio.
export function AspectRatio({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
