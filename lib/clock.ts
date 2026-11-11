"use client";

import { useSyncExternalStore } from "react";

/** Jam bersama yang berdetak setiap `step` ms. Bernilai 0 saat render di server. */
export function useNow(step = 15_000) {
  return useSyncExternalStore(
    (cb) => {
      const t = setInterval(cb, step);
      return () => clearInterval(t);
    },
    () => Math.floor(Date.now() / step) * step,
    () => 0,
  );
}
