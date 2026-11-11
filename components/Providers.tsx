"use client";

import { MotionConfig } from "framer-motion";

/**
 * reducedMotion="user": bila sistem pengguna meminta "kurangi gerakan",
 * semua animasi posisi/skala dimatikan dan hanya perubahan opasitas yang tersisa.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
