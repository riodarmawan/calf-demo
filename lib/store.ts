"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { LineOpts } from "./menu";

/* ------------------------------------------------------------------ */
/* Tipe data                                                           */
/* ------------------------------------------------------------------ */

export type CartLine = {
  key: string;
  itemId: string;
  name: string;
  /** Keterangan untuk barista, selalu Bahasa Indonesia. */
  detail: string;
  /** Pilihan mentah, supaya pelanggan melihat keterangan dalam bahasanya sendiri. */
  opts?: LineOpts;
  unit: number;
  qty: number;
};

/** Batas jumlah per baris: mencegah salah ketik "+" berkali-kali jadi pesanan raksasa. */
export const MAX_QTY = 20;

/** 0 Diterima · 1 Diracik · 2 Siap diambil · 3 Selesai */
export type OrderStatus = 0 | 1 | 2 | 3;
export const STATUS_LABEL = ["Diterima", "Diracik", "Siap diambil", "Selesai"] as const;

export type Order = {
  id: string;
  queue: string;
  table: string;
  name: string;
  lines: CartLine[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
};

type State = { orders: Order[]; soldOut: string[]; seq: number };

/* ------------------------------------------------------------------ */
/* Store bersama (demo tanpa server)                                    */
/*                                                                      */
/* Disimpan di localStorage dan disinkronkan antartab lewat event       */
/* "storage", jadi halaman pelanggan dan dashboard barista yang dibuka  */
/* di tab berbeda saling memperbarui secara langsung. Di produksi,      */
/* bagian ini diganti database + kanal real-time.                       */
/* ------------------------------------------------------------------ */

const KEY = "calf-demo-v1";
const EMPTY: State = { orders: [], soldOut: [], seq: 0 };

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function seed(now: number): State {
  const min = 60_000;
  const mk = (n: number, table: string, name: string, status: OrderStatus, ago: number, lines: CartLine[]): Order => ({
    id: `seed-${n}`,
    queue: `A-${String(n).padStart(3, "0")}`,
    table,
    name,
    lines,
    total: lines.reduce((a, l) => a + l.unit * l.qty, 0),
    status,
    createdAt: now - ago * min,
    updatedAt: now - ago * min,
  });
  const line = (itemId: string, name: string, detail: string, unit: number, qty = 1): CartLine => ({
    key: `${itemId}|${detail}`,
    itemId,
    name,
    detail,
    unit,
    qty,
  });
  return {
    seq: 26,
    soldOut: ["smooth"],
    orders: [
      mk(21, "03", "Dimas", 3, 24, [line("premium", "Calf Premium", "Can", 29000, 2)]),
      mk(22, "09", "Anya", 2, 11, [line("butterscotch-macchiato", "Butterscotch Macchiato", "Manis normal · Tanpa es", 27000)]),
      mk(23, "05", "Budi", 1, 9, [line("premium", "Calf Premium", "Cup · Kurang manis · Es normal", 20000, 3)]),
      mk(24, "07", "Sari", 1, 4, [
        line("brewmalt", "Calf Brewmalt", "Cup · Manis normal · Sedikit es", 27000),
        line("waffle", "Waffle", "+ Ice cream", 24000),
      ]),
      mk(25, "12", "Raka", 0, 1, [line("caramel-jefferson", "Caramel Jefferson", "Manis normal · Es normal", 27000, 2)]),
    ],
  };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? { ...EMPTY, ...JSON.parse(raw) } : seed(Date.now());
    if (!raw) localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    state = seed(Date.now());
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    try {
      state = e.newValue ? { ...EMPTY, ...JSON.parse(e.newValue) } : seed(Date.now());
    } catch {
      return;
    }
    emit();
  });
}

function set(update: (s: State) => State) {
  load();
  state = update(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* penyimpanan penuh atau diblokir: tetap jalan di memori */
  }
  emit();
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useCalf(): State {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return state;
    },
    () => EMPTY,
  );
}

export const actions = {
  placeOrder(input: { table: string; name: string; lines: CartLine[] }): Order {
    let created!: Order;
    set((s) => {
      const seq = s.seq + 1;
      const now = Date.now();
      created = {
        id: `o-${now}-${seq}`,
        queue: `A-${String(seq).padStart(3, "0")}`,
        table: input.table,
        name: input.name,
        lines: input.lines,
        total: input.lines.reduce((a, l) => a + l.unit * l.qty, 0),
        status: 0,
        createdAt: now,
        updatedAt: now,
      };
      return { ...s, seq, orders: [...s.orders, created] };
    });
    return created;
  },
  setStatus(id: string, status: OrderStatus) {
    set((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? { ...o, status, updatedAt: Date.now() } : o)),
    }));
  },
  toggleSoldOut(itemId: string) {
    set((s) => ({
      ...s,
      soldOut: s.soldOut.includes(itemId) ? s.soldOut.filter((x) => x !== itemId) : [...s.soldOut, itemId],
    }));
  },
  reset() {
    set(() => seed(Date.now()));
  },
};

/* ------------------------------------------------------------------ */
/* Nilai kecil per perangkat (keranjang, nama, pesanan aktif)           */
/* Disimpan supaya tidak hilang saat halaman di-refresh atau HP         */
/* terkunci: pencegahan kehilangan data adalah prinsip IMK dasar.       */
/* ------------------------------------------------------------------ */

const localListeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; val: unknown }>();

function readLocal<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    raw = null;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.val as T;
  let val: T = fallback;
  if (raw) {
    try {
      val = JSON.parse(raw) as T;
    } catch {
      val = fallback;
    }
  }
  cache.set(key, { raw, val });
  return val;
}

function subscribeLocal(l: () => void) {
  localListeners.add(l);
  const onStorage = () => l();
  window.addEventListener("storage", onStorage);
  return () => {
    localListeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useLocal<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const value = useSyncExternalStore(
    subscribeLocal,
    () => readLocal(key, fallback),
    () => fallback,
  );
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readLocal(key, fallback);
      const val = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try {
        if (val === null || val === undefined) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(val));
      } catch {
        /* abaikan */
      }
      cache.delete(key);
      localListeners.forEach((l) => l());
    },
    [key, fallback],
  );
  return [value, setValue];
}
