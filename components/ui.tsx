"use client";

import Image from "next/image";
import { motion, type HTMLMotionProps } from "framer-motion";
import { TAP } from "@/lib/motion";

export function Logo({ className = "h-7 w-auto", lockup = false }: { className?: string; lockup?: boolean }) {
  return lockup ? (
    <Image src="/images/logo-lockup-blue.png" alt="Calf Coffee & Milkbar" width={816} height={507} className={className} priority />
  ) : (
    <Image src="/images/logo-script-blue.png" alt="Calf" width={816} height={390} className={className} priority />
  );
}

/** Maskot anak sapi: hiasan saja (aria-hidden), warna garis ikut `currentColor`. */
export function CalfMascot({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 58"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M24 12l-3-5M40 12l3-5" />
      <path d="M18 23c-6-2-12 0-14 4 4 4 10 4 14 1" fill="#fff" />
      <path d="M46 23c6-2 12 0 14 4-4 4-10 4-14 1" fill="#fff" />
      <path d="M32 9c-10 0-16 7-16 17 0 5 1 9 3 12h26c2-3 3-7 3-12 0-10-6-17-16-17z" fill="#fff" />
      <path d="M37 10.5c4 1.5 7 4 8 8.5-3 1-6.5 0-8.5-2.5-1.3-1.8-1.2-4 .5-6z" fill="currentColor" stroke="none" />
      <circle cx="25.5" cy="26.5" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="38.5" cy="26.5" r="2.1" fill="currentColor" stroke="none" />
      <rect x="18" y="34" width="28" height="19" rx="9.5" fill="#ebe0db" />
      <ellipse cx="27" cy="43.5" rx="1.7" ry="2.3" fill="currentColor" stroke="none" />
      <ellipse cx="37" cy="43.5" rx="1.7" ry="2.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Tombol dengan umpan balik tekan yang konsisten. */
export function Press({ className = "", ...props }: HTMLMotionProps<"button">) {
  return <motion.button type="button" whileTap={props.disabled ? undefined : TAP} className={className} {...props} />;
}

export function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Press
      aria-label={label}
      onClick={onClick}
      className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong bg-white text-ink"
    >
      {children}
    </Press>
  );
}

type IconProps = { className?: string };
const base = "fill-none stroke-current";

export const Icon = {
  Back: ({ className = "size-[18px]" }: IconProps) => (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  ),
  Close: ({ className = "size-4" }: IconProps) => (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2.4} strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  Search: ({ className = "size-[18px]" }: IconProps) => (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2} strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  Pin: ({ className = "size-3.5" }: IconProps) => (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  ),
  Plus: ({ className = "size-4" }: IconProps) => (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2.2} strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Check: ({ className = "size-[18px]" }: IconProps) => (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  Store: ({ className = "size-[22px]" }: IconProps) => (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 10h16v10H4z" />
      <path d="M2 10l2-5h16l2 5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  ),
  Bell: ({ className = "size-[22px]" }: IconProps) => (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  ),
  Clock: ({ className = "size-3.5" }: IconProps) => (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2.2} strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  Download: ({ className = "size-4" }: IconProps) => (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  ),
  Chevron: ({ className = "size-4" }: IconProps) => (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  ),
  Sound: ({ className = "size-4" }: IconProps) => (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5L6 9H3v6h3l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    </svg>
  ),
};
