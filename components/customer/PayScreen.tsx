"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "qrcode";
import { rp } from "@/lib/format";
import { DURATION, EASE_OUT, TAP } from "@/lib/motion";
import { Icon, IconButton, Press } from "@/components/ui";
import { useT } from "@/lib/i18n";

export const PAY_LIMIT_MS = 10 * 60_000;
const WALLETS = ["GoPay", "ShopeePay", "DANA", "OVO"];

type Props = { total: number; deadline: number; onRenew: () => void; onBack: () => void; onPaid: () => void };

export function PayScreen({ total, deadline, onRenew, onBack, onPaid }: Props) {
  const secondsLeft = () => Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  const [left, setLeft] = useState(secondsLeft);
  const [qr, setQr] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const { t } = useT();

  // Hitung mundur dari batas waktu yang tersimpan: tidak mulai ulang saat halaman dimuat ulang.
  // QR baru = deadline baru = komponen dipasang ulang (key), jadi tidak perlu mereset state di sini.
  useEffect(() => {
    if (paid) return;
    const t = setInterval(() => setLeft(secondsLeft()), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- secondsLeft hanya bergantung pada deadline
  }, [deadline, paid]);

  // QR demo. Di produksi, isi QR berasal dari payment gateway (QRIS dinamis).
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(`DEMO-QRIS|CALF-JATIWARNA|${total}|${deadline}`, { margin: 1, width: 360, color: { dark: "#2b3040", light: "#ffffff" } }).then(
      (url) => alive && setQr(url),
    );
    return () => {
      alive = false;
    };
  }, [total, deadline]);

  const done = useRef(onPaid);
  // Tombol "lanjut" dan timer otomatis sama-sama ke sini: pesanan hanya boleh dibuat sekali.
  const fired = useRef(false);
  const finish = () => {
    if (fired.current) return;
    fired.current = true;
    done.current();
  };
  useEffect(() => {
    done.current = onPaid;
  });
  // Konfirmasi "berhasil" ditampilkan sebentar sebelum pindah layar, supaya pelanggan yakin uangnya diterima.
  useEffect(() => {
    if (!paid) return;
    const timer = setTimeout(finish, 1300);
    return () => clearTimeout(timer);
  }, [paid]);

  const expired = left === 0;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  const pay = () => !expired && total > 0 && setPaid(true);
  const renew = onRenew;

  return (
    <>
      <header className="flex flex-none items-center gap-3 border-b border-line bg-white px-4 py-3">
        <IconButton label={t.backToOrder} onClick={onBack}>
          <Icon.Back />
        </IconButton>
        <h1 className="font-display flex-1 text-[26px] leading-none">{t.payTitle}</h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto p-4">
        <div className="text-center">
          <div className="text-[13px] text-muted">{t.amountDue}</div>
          <div className="font-display text-[44px] leading-tight">{rp(total)}</div>
          <div
            role="timer"
            aria-live="off"
            className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${
              expired ? "bg-clay text-white" : "bg-sand text-sand-ink"
            }`}
          >
            <Icon.Clock />
            {expired ? t.payExpired : t.payWithin(`${mm}:${ss}`)}
          </div>
        </div>

        <h2 className="mt-1 text-sm font-semibold">{t.payFromPhone}</h2>
        <div className="grid grid-cols-2 gap-2">
          {WALLETS.map((w) => (
            <Press
              key={w}
              disabled={expired}
              onClick={pay}
              className="flex h-[52px] items-center justify-between rounded-[14px] border border-line-strong bg-white px-3.5 text-[15px] font-semibold disabled:opacity-50"
            >
              {w}
              <span className="text-muted">
                <Icon.Chevron />
              </span>
            </Press>
          ))}
        </div>

        <div className="flex items-center gap-2.5 text-xs text-muted">
          <span className="h-px flex-1 bg-line" />
          {t.orOtherApp}
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="flex flex-col items-center gap-3 rounded-[20px] border border-line bg-white p-4">
          <div className="relative size-[184px]">
            <AnimatePresence mode="wait">
              {qr ? (
                <motion.img
                  key={qr}
                  src={qr}
                  alt={t.qrAlt}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: expired ? 0.15 : 1, transition: { duration: DURATION.base } }}
                  className="size-full rounded-lg"
                />
              ) : (
                <motion.div key="skeleton" className="size-full animate-pulse rounded-lg bg-paper" />
              )}
            </AnimatePresence>
            {expired && (
              <motion.button
                type="button"
                whileTap={TAP}
                onClick={renew}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 m-auto h-11 w-36 rounded-xl bg-ink text-sm font-semibold text-white"
              >
                {t.newQr}
              </motion.button>
            )}
          </div>
          <div className="text-center text-xs text-muted">
            Calf Coffee &amp; Milkbar · Jatiwarna
            <br />
            {t.demoQr}
          </div>
          <a
            href={qr ?? undefined}
            download="calf-qris.png"
            aria-disabled={!qr || expired}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-accent text-sm font-semibold text-accent transition-transform active:scale-[0.97]"
          >
            <Icon.Download />
            {t.saveQr}
          </a>
          <ol className="list-decimal self-stretch pl-[18px] text-[13px] leading-relaxed text-muted">
            <li>{t.payStep1}</li>
            <li>
              {t.payStep2a}
              <b className="text-ink">{t.payStep2b}</b>
              {t.payStep2c}
            </li>
            <li>{t.payStep3}</li>
          </ol>
        </div>
      </div>

      <div className="flex flex-none flex-col gap-2.5 border-t border-line bg-white px-4 pb-5 pt-3">
        <div className="flex items-center justify-center gap-2 text-[13px] text-muted" aria-live="polite">
          {!expired && <span className="animate-pulse-soft size-2 rounded-full bg-[#c9a35b]" />}
          {expired ? t.qrExpired : t.waitingPayment}
        </div>
        <Press
          onClick={pay}
          disabled={expired}
          className="h-11 rounded-[14px] border border-dashed border-[#bdb7ab] text-[13px] font-semibold text-muted disabled:opacity-50"
        >
          {t.demoPay}
        </Press>
      </div>

      <AnimatePresence>
        {paid && (
          <motion.div
            role="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: DURATION.base } }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-cream/95 backdrop-blur-sm"
          >
            <motion.svg
              viewBox="0 0 80 80"
              className="size-24"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1, transition: { type: "spring", stiffness: 300, damping: 18 } }}
              aria-hidden
            >
              <circle cx="40" cy="40" r="38" fill="#4c6247" />
              <motion.path
                d="M24 41l11 11 21-23"
                fill="none"
                stroke="#fff"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, transition: { duration: 0.4, ease: EASE_OUT, delay: 0.15 } }}
              />
            </motion.svg>
            <div className="text-center">
              <div className="font-display text-3xl">{t.paidTitle}</div>
              <div className="mt-1 text-sm text-muted">{t.paidText}</div>
            </div>
            {/* Tidak perlu menunggu animasi selesai: ketuk untuk langsung lanjut. */}
            <button
              type="button"
              autoFocus
              onClick={finish}
              className="mt-2 h-12 rounded-[14px] bg-accent px-6 text-sm font-semibold text-white"
            >
              {t.paidContinue}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
