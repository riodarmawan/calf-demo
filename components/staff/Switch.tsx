"use client";

import { motion } from "framer-motion";
import { SPRING_SOFT } from "@/lib/motion";

/** Sakelar dengan status yang terbaca dari warna, posisi, dan teks sekaligus. */
export function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      // Area sentuh 44 px; trek yang terlihat tetap 48×28.
      className="-my-2 flex h-11 w-14 shrink-0 items-center justify-center"
    >
      <span
        className={`flex h-7 w-12 items-center rounded-full p-0.5 transition-colors duration-200 ${on ? "justify-end bg-sage" : "justify-start bg-field"}`}
      >
        <motion.span layout transition={SPRING_SOFT} className="size-6 rounded-full bg-white shadow-sm" />
      </span>
    </button>
  );
}
