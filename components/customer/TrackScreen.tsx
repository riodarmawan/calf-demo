"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OUTLET, describe } from "@/lib/menu";
import { clock, rp } from "@/lib/format";
import { DURATION, EASE_IN, EASE_OUT } from "@/lib/motion";
import { actions, type Order, type OrderStatus, type prepStats } from "@/lib/store";
import { useNow } from "@/lib/clock";
import { Icon, Logo, Press } from "@/components/ui";
import { useT } from "@/lib/i18n";

type Perm = "default" | "granted" | "denied" | "unsupported";
type Props = { order: Order; ahead: number; prep: ReturnType<typeof prepStats>; onOrderAgain: () => void };
const SEQ = [1, 2, 3, 4, 5, 6, 7];

export function TrackScreen({ order, ahead, prep, onOrderAgain }: Props) {
  const { t, lang } = useT();
  const STEPS = t.steps;
  const ready = order.status === 2;
  const step = STEPS[order.status];
  const now = useNow(30_000);
  const mins = now ? Math.max(0, Math.floor((now - order.createdAt) / 60_000)) : 0;
  const seqId = useId();
  // Rentang dari waktu siap pesanan sungguhan. Belum cukup data = tidak ada angka, bukan angka karangan.
  const range = prep && (prep.lo === prep.hi ? `${prep.lo}` : `${prep.lo}–${prep.hi}`);
  const waiting = `${t.queueAhead(ahead)}. ${range ? `${t.estimate(range, prep.n)} ` : ""}${t.waitAtTable}`;
  const desc = ready ? t.readyDesc(order.queue) : order.status === 1 ? waiting : order.status === 0 ? `${step.desc} ${waiting}` : step.desc;
  const [perm, setPerm] = useState<Perm>("default");
  const prev = useRef<OrderStatus>(order.status);

  // Saat pesanan siap: getar, ubah judul tab, dan notifikasi bila halaman tidak sedang dilihat.
  // Umpan balik lewat beberapa indra sekaligus, karena pelanggan mungkin sedang mengobrol.
  useEffect(() => {
    const was = prev.current;
    prev.current = order.status;
    if (order.status !== 2 || was === 2) return;
    navigator.vibrate?.([200, 100, 200]);
    const title = document.title;
    document.title = t.readyTabTitle(order.queue);
    if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
      new Notification(t.readyNotifTitle, { body: t.readyNotifBody(order.queue, order.name) });
    }
    const timer = setTimeout(() => (document.title = title), 8000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hanya saat status berubah, bukan saat bahasa diganti
  }, [order.status, order.queue, order.name]);

  const askNotify = async () => {
    if (typeof Notification === "undefined") return setPerm("unsupported");
    setPerm(await Notification.requestPermission());
  };

  const notifyLabel = t.notify[perm];

  return (
    <>
      <header className="flex flex-none items-center justify-between border-b border-line bg-white px-4 py-3">
        <Logo />
        <span className="text-[13px] font-semibold text-muted">
          {OUTLET} · {t.table(order.table)}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 *:flex-none">
        {/* Hanya perubahan status yang dibacakan, bukan seluruh kartu (nomor, nama, perkiraan) dari awal. */}
        <p className="sr-only" aria-live="polite">
          {ready ? `${step.title}. ${desc}` : step.title}
        </p>
        <motion.section
          initial={false}
          animate={{
            backgroundColor: ready ? "#4c6247" : "#ffffff",
            color: ready ? "#ffffff" : "#2b3040",
            borderColor: ready ? "#4c6247" : "#e7e2d9",
            scale: ready ? [1, 1.025, 1] : 1,
          }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          className="rounded-[22px] border p-[18px]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={`text-xs font-semibold uppercase tracking-[0.08em] ${ready ? "text-[#dce8d8]" : "text-muted"}`}>{t.queueNumber}</div>
              <div className="font-display text-[56px] leading-none">{order.queue}</div>
            </div>
            {order.name && (
              <div className="text-right">
                <div className={`text-xs font-semibold uppercase tracking-[0.08em] ${ready ? "text-[#dce8d8]" : "text-muted"}`}>{t.nameFor}</div>
                <div className="mt-1 text-lg font-semibold">{order.name}</div>
              </div>
            )}
          </div>
          <div className={`my-3.5 h-px ${ready ? "bg-white/25" : "bg-hair"}`} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={order.status}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } }}
              exit={{ opacity: 0, y: -6, transition: { duration: DURATION.fast, ease: EASE_IN } }}
            >
              <h1 className="font-display text-[30px] leading-[1.05]">{step.title}</h1>
              <p className={`mt-1.5 text-sm leading-relaxed ${ready ? "text-[#eef3ec]" : "text-muted"}`}>{desc}</p>
              {order.status < 2 && <p className="mt-1 text-xs font-semibold tabular-nums text-muted">{t.elapsed(mins)}</p>}
            </motion.div>
          </AnimatePresence>

          <div
            className="mt-3.5 flex gap-1.5"
            role="progressbar"
            aria-label={t.orderStatus}
            aria-valuemin={1}
            aria-valuemax={4}
            aria-valuenow={order.status + 1}
            aria-valuetext={step.label}
          >
            {STEPS.map((s, i) => (
              <span key={s.label} className={`h-1.5 flex-1 overflow-hidden rounded-full ${ready ? "bg-white/30" : "bg-line-strong"}`}>
                <motion.span
                  className={`block h-full origin-left rounded-full ${ready ? "bg-white" : "bg-accent"}`}
                  initial={false}
                  animate={{ scaleX: i <= order.status ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT, delay: i === order.status ? 0.1 : 0 }}
                />
              </span>
            ))}
          </div>
          <div className="mt-2 flex justify-between">
            {STEPS.map((s, i) => (
              <span
                key={s.label}
                className={`flex-1 text-[11px] font-semibold ${i === 0 ? "" : i === 3 ? "text-right" : "text-center"} ${
                  ready ? "text-[#eef3ec]" : i <= order.status ? "text-ink" : "text-faint"
                }`}
              >
                {s.label}
              </span>
            ))}
          </div>
        </motion.section>

        <AnimatePresence initial={false}>
          {order.status < 2 && (
            <motion.div
              exit={{ opacity: 0, height: 0, transition: { duration: DURATION.base } }}
              className="flex items-center gap-3 overflow-hidden rounded-[18px] border border-line bg-white px-4 py-3.5"
            >
              <span className="text-accent">
                <Icon.Bell />
              </span>
              <p className="flex-1 text-[13px] leading-snug text-muted">{t.notifyText}</p>
              <Press
                onClick={askNotify}
                disabled={perm !== "default"}
                className="h-11 shrink-0 rounded-xl border border-accent px-3.5 text-[13px] font-semibold text-accent disabled:border-line-strong disabled:text-muted"
              >
                {notifyLabel}
              </Press>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Satu pertanyaan, opsional, setelah pesanan siap: bahan ukur pilot tanpa mengganggu saat memesan. */}
        {order.status >= 2 && (
          <section aria-labelledby={seqId} className="rounded-[18px] border border-line bg-white px-4 py-3.5">
            <h2 id={seqId} className="text-sm font-semibold leading-snug">
              {t.seqQuestion}
            </h2>
            <div aria-live="polite">
              {order.rating ? (
                <p className="mt-2 text-[13px] font-semibold text-sage">{t.seqThanks}</p>
              ) : (
                <>
                  <div role="group" aria-labelledby={seqId} className="mt-3 flex gap-1">
                    {SEQ.map((n) => (
                      <Press
                        key={n}
                        aria-label={`${t.seqValue(n)}${n === 1 ? `, ${t.seqLow}` : n === 7 ? `, ${t.seqHigh}` : ""}`}
                        onClick={() => actions.rate(order.id, n)}
                        className="h-11 min-w-0 flex-1 rounded-xl border border-line-strong text-sm font-semibold text-ink"
                      >
                        {n}
                      </Press>
                    ))}
                  </div>
                  <div aria-hidden className="mt-1.5 flex justify-between text-xs text-muted">
                    <span>{t.seqLow}</span>
                    <span>{t.seqHigh}</span>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        <section className="rounded-[18px] border border-line bg-white px-4 pb-3 pt-1.5">
          <div className="flex items-center justify-between pb-1.5 pt-2.5">
            <h2 className="text-sm font-bold">{t.orderDetails}</h2>
            <span className="rounded-full bg-sage-tint px-2.5 py-1 text-xs font-semibold text-sage">{t.paidBadge(clock(order.createdAt))}</span>
          </div>
          {order.lines.map((l) => (
            <div key={l.key} className="flex justify-between gap-3 border-t border-hair py-2 text-sm">
              <span className="min-w-0">
                <b className="font-semibold">
                  {l.qty}× {l.name}
                </b>
                <span className="mt-0.5 block text-xs text-muted">{l.opts ? describe(l.itemId, l.opts, lang) : l.detail}</span>
              </span>
              <span className="shrink-0">{rp(l.unit * l.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-hair pt-2.5 text-[15px] font-semibold">
            <span>{t.total}</span>
            <span>{rp(order.total)}</span>
          </div>
        </section>

        {order.status < 3 && (
          <p className="px-1 text-xs leading-relaxed text-muted">
            {t.demoTrackA}
            <Link href="/barista" target="_blank" className="font-semibold text-accent underline underline-offset-2">
              {t.demoTrackLink}
            </Link>
            {t.demoTrackB}
          </p>
        )}
      </div>

      <div className="flex flex-none gap-2.5 border-t border-line bg-white px-4 pb-5 pt-3">
        {order.status < 3 ? (
          <Press
            onClick={() => actions.setStatus(order.id, (order.status + 1) as OrderStatus)}
            className="h-12 flex-1 rounded-[14px] border border-dashed border-[#bdb7ab] text-[13px] font-semibold text-muted"
          >
            {t.demoNext}
          </Press>
        ) : null}
        <Press
          onClick={onOrderAgain}
          className={`h-12 flex-1 rounded-[14px] text-sm font-semibold ${
            order.status === 3 ? "bg-accent text-white" : "border border-accent bg-white text-accent"
          }`}
        >
          {t.orderAgain}
        </Press>
      </div>
    </>
  );
}
