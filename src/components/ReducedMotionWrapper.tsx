"use client";

import { useReducedMotionClass } from "@/hooks/useReducedMotion";

export function ReducedMotionWrapper({ children }: { children: React.ReactNode }) {
  useReducedMotionClass();
  return <>{children}</>;
}
