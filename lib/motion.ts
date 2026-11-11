/**
 * Aturan gerak (motion tokens) yang dipakai seluruh aplikasi.
 *
 * Diturunkan dari prinsip IMK:
 * - Umpan balik cepat: respons sentuhan < 100 ms agar terasa langsung (Nielsen, batas 0,1 detik).
 * - Transisi 150–300 ms: cukup untuk diikuti mata, tidak membuat pengguna menunggu.
 * - Masuk memakai ease-out (cepat lalu melambat), keluar memakai ease-in (pelan lalu cepat).
 * - Jarak gerak pendek (8–24 px) supaya tidak memicu pusing; animasi berhenti total bila
 *   pengguna mengaktifkan "kurangi gerakan" (MotionConfig reducedMotion="user").
 */
export const DURATION = {
  tap: 0.1,
  fast: 0.15,
  base: 0.22,
  slow: 0.3,
} as const;

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN = [0.55, 0, 1, 0.45] as const;

/** Pegas untuk benda yang "dipegang" pengguna: bottom sheet, kartu yang dipindah. */
export const SPRING_SHEET = { type: "spring", stiffness: 380, damping: 36, mass: 0.9 } as const;
export const SPRING_SOFT = { type: "spring", stiffness: 300, damping: 30 } as const;

/** Umpan balik tekan untuk tombol. */
export const TAP = { scale: 0.97, transition: { duration: DURATION.tap } } as const;

/** Transisi antarlayar: arah mengikuti navigasi (maju = dari kanan, kembali = dari kiri). */
export const screenVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0, transition: { duration: DURATION.base, ease: EASE_OUT } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -24, transition: { duration: DURATION.fast, ease: EASE_IN } }),
};

/** Daftar muncul berurutan, dibatasi supaya daftar panjang tetap cepat. */
export const listItem = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT, delay: Math.min(i, 8) * 0.025 } },
});
