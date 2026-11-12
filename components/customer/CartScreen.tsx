"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { rp } from "@/lib/format";
import { DURATION, EASE_OUT } from "@/lib/motion";
import { MAX_QTY, type CartLine } from "@/lib/store";
import { describe } from "@/lib/menu";
import { useT } from "@/lib/i18n";

/** Nama dipanggil keras di kasir: cukup pendek untuk diucapkan dan muat di layar barista. */
const NAME_MAX = 20;
import { Icon, IconButton, Press } from "@/components/ui";

type Props = {
  table: string;
  cart: CartLine[];
  name: string;
  onName: (v: string) => void;
  onQty: (key: string, delta: number) => void;
  onBack: () => void;
  onAddMore: () => void;
  onPay: () => void;
};

export function CartScreen({ table, cart, name, onName, onQty, onBack, onAddMore, onPay }: Props) {
  const { t, lang } = useT();
  // Nama yang tersimpan dari kunjungan sebelumnya: tawarkan "Bukan Anda?" untuk HP yang dipakai bergantian.
  const [savedName] = useState(name);
  const input = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const count = cart.reduce((a, l) => a + l.qty, 0);
  const total = cart.reduce((a, l) => a + l.qty * l.unit, 0);
  // Nama tidak wajib: nomor antrean sudah cukup untuk mengambil pesanan, dan tidak semua orang
  // nyaman namanya dipanggil keras atau tampil di layar barista.
  const submit = onPay;

  const header = (
    <header className="flex flex-none items-center gap-3 border-b border-line bg-white px-4 py-3">
      <IconButton label={t.backToMenu} onClick={onBack}>
        <Icon.Back />
      </IconButton>
      <h1 className="font-display flex-1 text-[26px] leading-none">{t.cartTitle}</h1>
      <span className="text-[13px] font-semibold text-muted">{t.table(table)}</span>
    </header>
  );

  if (cart.length === 0)
    return (
      <>
        {header}
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 pb-24 text-center">
          <h2 className="font-display text-2xl">{t.cartEmpty}</h2>
          <p className="text-sm leading-relaxed text-muted">{t.cartEmptyHint}</p>
          <Press onClick={onAddMore} className="mt-2 h-12 rounded-[14px] bg-accent px-6 text-sm font-semibold text-white">
            {t.browseMenu}
          </Press>
        </div>
      </>
    );

  return (
    <>
      {header}

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3.5">
        <section aria-label={t.orderItems} className="rounded-[18px] border border-line bg-white px-4 py-1">
          <AnimatePresence initial={false}>
            {cart.map((l) => (
              <motion.div
                key={l.key}
                layout
                exit={{ opacity: 0, height: 0, transition: { duration: DURATION.base } }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 border-b border-hair py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold leading-snug">{l.name}</div>
                    <div className="mt-0.5 text-xs leading-snug text-muted">{l.opts ? describe(l.itemId, l.opts, lang) : l.detail}</div>
                    <motion.div key={l.qty} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="mt-1 text-sm font-semibold">
                      {rp(l.unit * l.qty)}
                    </motion.div>
                  </div>
                  <div className="flex h-[46px] items-center rounded-xl border border-line-strong">
                    <Press
                      aria-label={l.qty === 1 ? t.removeItem(l.name) : t.lessItem(l.name)}
                      onClick={() => onQty(l.key, -1)}
                      className="h-full w-11 text-lg text-accent"
                    >
                      {l.qty === 1 ? "×" : "−"}
                    </Press>
                    <span className="w-[18px] text-center text-sm font-semibold">{l.qty}</span>
                    <Press
                      aria-label={l.qty >= MAX_QTY ? t.maxQty(MAX_QTY) : t.moreItem(l.name)}
                      disabled={l.qty >= MAX_QTY}
                      onClick={() => onQty(l.key, 1)}
                      className="h-full w-11 text-lg text-accent disabled:text-line-strong"
                    >
                      +
                    </Press>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <Press onClick={onAddMore} className="h-[46px] w-full text-sm font-semibold text-accent">
            {t.addMore}
          </Press>
        </section>

        <div className="flex flex-col gap-2 rounded-[18px] border border-line bg-white px-4 py-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="nama" className="text-sm font-semibold">
              {t.nameLabel} <span className="font-normal text-muted">({t.optional})</span>
            </label>
            {savedName && name === savedName && (
              <button
                type="button"
                onClick={() => {
                  onName("");
                  input.current?.focus();
                }}
                className="-my-3 min-h-11 text-[13px] font-semibold text-accent"
              >
                {t.notYou(savedName)} {t.changeName}
              </button>
            )}
          </div>
          <input
            ref={input}
            id="nama"
            type="text"
            autoComplete="given-name"
            enterKeyHint="go"
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => onName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={t.namePlaceholder}
            aria-describedby={hintId}
            className="h-[50px] w-full rounded-xl border border-field bg-white px-3.5 text-base outline-none transition-colors focus:border-accent"
          />
          <p id={hintId} className="text-xs leading-snug text-muted">
            {t.nameHint}
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-[18px] border border-line bg-white px-4 py-3.5">
          <span className="mt-0.5 text-accent">
            <Icon.Store />
          </span>
          <p className="text-[13px] leading-relaxed text-muted">
            <b className="text-sm text-ink">{t.pickupTitle}</b>
            <br />
            {t.pickupText}
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-[18px] border border-line bg-white px-4 py-3.5 text-sm">
          <div className="flex justify-between text-muted">
            <span>{t.subtotal(count)}</span>
            <span>{rp(total)}</span>
          </div>
          {/* ponytail: baris pajak & layanan ditampilkan lagi setelah Calf menetapkan tarifnya; placeholder tidak boleh terlihat pelanggan */}
          <div className="my-1 h-px bg-hair" />
          <div className="flex items-baseline justify-between">
            <b className="text-[15px]">{t.total}</b>
            <motion.b
              key={total}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0, transition: { duration: DURATION.fast, ease: EASE_OUT } }}
              className="text-xl"
            >
              {rp(total)}
            </motion.b>
          </div>
        </div>
        <p className="px-1 text-xs leading-relaxed text-muted">
          {t.finalNote}
        </p>
      </div>

      <div className="flex-none border-t border-line bg-white px-4 pb-5 pt-3">
        <Press onClick={submit} className="flex h-14 w-full items-center justify-between rounded-[18px] bg-accent px-5 text-base font-semibold text-white">
          <span>{t.payCta}</span>
          <span>{rp(total)}</span>
        </Press>
      </div>
    </>
  );
}
