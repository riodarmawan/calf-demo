"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { MENU } from "@/lib/menu";
import { minutesSince } from "@/lib/format";
import { useNow } from "@/lib/clock";
import { DURATION, EASE_OUT, SPRING_SOFT, TAP } from "@/lib/motion";
import { STATUS_LABEL, actions, useCalf, type Order, type OrderStatus } from "@/lib/store";
import { Icon, Logo, Press } from "@/components/ui";
import { Switch } from "./Switch";

const SLA_MIN = 8;
const COLUMNS: { title: string; accent: string; action?: string; actionClass?: string }[] = [
  { title: "Baru", accent: "bg-clay", action: "Mulai racik", actionClass: "bg-accent" },
  { title: "Diracik", accent: "bg-accent", action: "Tandai siap", actionClass: "bg-accent" },
  { title: "Siap diambil", accent: "bg-sand-ink", action: "Sudah diambil", actionClass: "bg-sage" },
  { title: "Selesai", accent: "bg-ink" },
];

/* Satu AudioContext dibuat saat klik tombol (gesture pengguna), kalau tidak browser membiarkannya suspended. */
let audio: AudioContext | null = null;

function beep() {
  try {
    audio ??= new AudioContext();
    const ctx = audio;
    void ctx.resume();
    const play = (freq: number, at: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq;
      o.type = "sine";
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + at);
      o.stop(ctx.currentTime + at + 0.3);
    };
    play(880, 0);
    play(1175, 0.18);
  } catch {
    /* audio tidak tersedia */
  }
}

export function BaristaBoard() {
  const { orders, soldOut } = useCalf();
  const now = useNow();
  const [sound, setSound] = useState(false);
  const known = useRef<Set<string> | null>(null);
  const [undo, setUndo] = useState<{ id: string; from: OrderStatus; msg: string } | null>(null);

  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 6000);
    return () => clearTimeout(t);
  }, [undo]);

  // Setiap perpindahan status bisa dibatalkan: salah ketuk di bar yang sibuk itu wajar.
  const move = (o: Order, to: OrderStatus) => {
    actions.setStatus(o.id, to);
    setUndo({ id: o.id, from: o.status, msg: `${o.queue} dipindah ke ${STATUS_LABEL[to]}` });
  };

  const resetDemo = () => {
    if (window.confirm("Reset demo? Semua pesanan dan status menu kembali ke data contoh.")) actions.reset();
  };

  // Bunyi saat ada pesanan baru: barista tidak selalu melihat layar.
  useEffect(() => {
    const ids = new Set(orders.map((o) => o.id));
    if (known.current && sound && orders.some((o) => !known.current!.has(o.id))) beep();
    if (orders.length) known.current = ids;
  }, [orders, sound]);

  const byStatus = (s: OrderStatus) => {
    const list = orders.filter((o) => o.status === s);
    return s === 3 ? [...list].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6) : [...list].sort((a, b) => a.createdAt - b.createdAt);
  };
  const active = orders.filter((o) => o.status < 2);
  const late = now ? active.filter((o) => minutesSince(o.createdAt, now) >= SLA_MIN).length : 0;

  const stats = [
    { value: orders.filter((o) => o.status < 3).length, label: "Pesanan aktif", tone: "text-accent" },
    { value: late, label: "Melewati 8 menit", tone: late ? "text-clay" : "text-sage" },
    { value: orders.filter((o) => o.status === 2).length, label: "Menunggu diambil", tone: "text-sand-ink" },
    { value: soldOut.length, label: "Menu ditandai habis", tone: "text-ink" },
  ];

  return (
    <div className="min-h-dvh bg-cream">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" aria-label="Beranda prototipe">
              <Logo lockup className="h-11 w-auto" />
            </Link>
            <div className="hidden h-8 w-px bg-line-strong sm:block" />
            <div>
              <h1 className="font-display text-2xl leading-none">Papan pesanan</h1>
              <p className="mt-1 text-[13px] text-muted">Outlet Jatiwarna</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 rounded-full bg-sage-tint px-3.5 py-2 text-[13px] font-semibold text-sage">
              <span className="animate-pulse-soft size-2 rounded-full bg-[#7f9279]" />
              Live
            </span>
            <Press
              onClick={() => {
                if (!sound) beep(); // sekaligus tes bunyi + membuka izin audio
                setSound((s) => !s);
              }}
              aria-pressed={sound}
              className={`flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ${sound ? "bg-accent text-white" : "bg-tint text-accent"}`}
            >
              <Icon.Sound />
              {sound ? "Bunyi aktif" : "Aktifkan bunyi"}
            </Press>
            <Press onClick={resetDemo} className="ml-2 h-11 rounded-full border border-line-strong px-4 text-sm font-semibold text-muted">
              Reset demo
            </Press>
          </div>
        </div>
        {/* Bunyi tidak bisa menyala sendiri (browser mewajibkan satu ketukan), jadi keadaan mati harus mencolok. */}
        {!sound && (
          <button
            type="button"
            onClick={() => {
              beep();
              setSound(true);
            }}
            className="flex min-h-11 w-full items-center justify-center gap-2 bg-sand px-6 py-2 text-[15px] font-semibold text-sand-ink"
          >
            <Icon.Sound />
            Bunyi pesanan baru mati. Ketuk di sini untuk menyalakan.
          </button>
        )}
      </header>

      <main className="mx-auto flex max-w-[1400px] flex-col gap-5 px-6 pb-10 pt-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-baseline gap-3 rounded-[18px] border border-line bg-white px-5 py-4">
              <motion.span key={s.value} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={`font-display text-4xl leading-none ${s.tone}`}>
                {s.value}
              </motion.span>
              <span className="text-sm font-semibold leading-tight text-muted">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-start gap-5">
          <LayoutGroup>
            <div className="grid min-w-0 flex-[999_1_720px] grid-cols-1 items-start gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
              {COLUMNS.map((col, ci) => {
                const list = byStatus(ci as OrderStatus);
                return (
                  <section key={col.title} aria-label={col.title} className="flex min-h-32 flex-col gap-2.5 rounded-[20px] bg-[#efebe3] p-3">
                    <div className="flex items-center justify-between px-1.5 py-1">
                      <h2 className="text-[15px] font-bold">{col.title}</h2>
                      <motion.span
                        key={list.length}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold text-white ${col.accent}`}
                      >
                        {list.length}
                      </motion.span>
                    </div>
                    <AnimatePresence initial={false} mode="popLayout">
                      {list.map((o) => (
                        <OrderCard key={o.id} order={o} now={now} action={col.action} actionClass={col.actionClass} onMove={(to) => move(o, to)} />
                      ))}
                    </AnimatePresence>
                    {list.length === 0 && <p className="px-2 py-6 text-center text-[13px] text-muted">Belum ada pesanan</p>}
                  </section>
                );
              })}
            </div>
          </LayoutGroup>

          <aside className="flex max-h-[calc(100dvh-220px)] min-w-0 flex-[1_1_280px] flex-col gap-3 rounded-[20px] border border-line bg-white p-4">
            <div>
              <h2 className="font-display text-2xl leading-none">Ketersediaan menu</h2>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">Menu yang dimatikan langsung tampil “Habis” di HP pelanggan.</p>
            </div>
            <div className="-mx-1 overflow-y-auto px-1">
              {MENU.map((sec) => {
                const items = sec.items.filter((i) => i.sizes);
                if (!items.length) return null;
                return (
                  <div key={sec.key} className="py-1.5">
                    <div className="py-1.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-clay">{sec.title}</div>
                    {items.map((it) => {
                      const out = soldOut.includes(it.id);
                      return (
                        <div key={it.id} className="flex items-center justify-between gap-3 border-b border-hair py-2">
                          <span className={`text-sm font-medium ${out ? "text-muted line-through decoration-1" : ""}`}>{it.name}</span>
                          <Switch on={!out} onChange={() => actions.toggleSoldOut(it.id)} label={`${it.name} tersedia`} />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </main>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
        <AnimatePresence>
          {undo && (
            <motion.div
              key={`${undo.id}-${undo.from}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } }}
              exit={{ opacity: 0, y: 8, transition: { duration: DURATION.fast } }}
              className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-ink py-1.5 pl-5 pr-1.5 text-[15px] font-medium text-white shadow-lg"
            >
              {undo.msg}
              <button
                type="button"
                onClick={() => {
                  actions.setStatus(undo.id, undo.from);
                  setUndo(null);
                }}
                className="h-11 rounded-xl px-4 font-semibold text-[#b9c6f2] hover:bg-white/10"
              >
                Batalkan
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

type CardProps = { order: Order; now: number; action?: string; actionClass?: string; onMove: (to: OrderStatus) => void };

function OrderCard({ order, now, action, actionClass, onMove }: CardProps) {
  const mins = now ? minutesSince(order.createdAt, now) : 0;
  const late = order.status < 2 && mins >= SLA_MIN;
  const fresh = order.status === 0 && now - order.createdAt < 20_000;
  return (
    <motion.article
      layout
      layoutId={order.id}
      initial={fresh ? { opacity: 0, y: -12, backgroundColor: "#eaeef5" } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0, backgroundColor: "#ffffff", transition: { duration: DURATION.slow, ease: EASE_OUT, backgroundColor: { duration: 1.6 } } }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: DURATION.fast } }}
      transition={SPRING_SOFT}
      className={`flex flex-col gap-2.5 rounded-2xl border-2 p-3.5 ${late ? "border-clay" : "border-transparent"}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="font-display flex h-11 min-w-[72px] items-center justify-center rounded-xl bg-accent px-2.5 text-xl text-white">{order.queue}</span>
        <span className="min-w-0 text-sm leading-snug text-muted">
          <b className="block truncate text-base text-ink">{order.name}</b>
          <span className="whitespace-nowrap">
            Meja {order.table} · {mins === 0 ? "baru masuk" : `${mins} mnt lalu`}
          </span>
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {order.lines.map((l) => (
          <li key={l.key} className="flex gap-2 text-base leading-snug">
            <b className="min-w-7">{l.qty}×</b>
            <span>
              {l.name}
              {l.detail && <span className="block text-sm text-muted">{l.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-1.5">
        {order.status < 3 && (
          <span
            className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${
              late ? "bg-clay text-white" : order.status === 2 ? "bg-sand text-sand-ink" : "bg-sage-tint text-sage"
            }`}
          >
            {late ? "Terlambat" : order.status === 2 ? "Panggil pelanggan" : "Sesuai waktu"}
          </span>
        )}
        <span className="rounded-full bg-tint px-2.5 py-1 text-[13px] font-semibold text-accent">Lunas · QRIS</span>
      </div>
      {action && (
        <motion.button
          type="button"
          whileTap={TAP}
          onClick={() => onMove((order.status + 1) as OrderStatus)}
          className={`h-[52px] rounded-[14px] text-[15px] font-semibold text-white ${actionClass}`}
        >
          {action}
        </motion.button>
      )}
      {/* Jalan kembali bila "Sudah diambil" ternyata salah ketuk dan baru disadari belakangan. */}
      {order.status === 3 && (
        <motion.button
          type="button"
          whileTap={TAP}
          onClick={() => onMove(2)}
          className="h-11 rounded-[14px] border border-line-strong text-sm font-semibold text-muted"
        >
          Kembalikan ke Siap diambil
        </motion.button>
      )}
    </motion.article>
  );
}
