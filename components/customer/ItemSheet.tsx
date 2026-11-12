"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { HAS_ICE, HAS_SWEET, ICE_OPTS, PACKED, SWEET_OPTS, TOPPINGS, descOf, describe, findItem, sizeLabel, type LineOpts, type SizeKey } from "@/lib/menu";
import { rp } from "@/lib/format";
import { DURATION, EASE_OUT, SPRING_SHEET, SPRING_SOFT, TAP } from "@/lib/motion";
import { MAX_QTY, type CartLine } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Icon, IconButton, Press } from "@/components/ui";

type Props = {
  itemId: string | null;
  onClose: () => void;
  onAdd: (line: CartLine, label: string) => void;
};

export function ItemSheet({ itemId, onClose, onAdd }: Props) {
  const item = itemId ? findItem(itemId) : undefined;
  const open = !!item?.sizes;

  // Tutup dengan tombol Escape (kontrol & kebebasan pengguna).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && item && (
        <div className="absolute inset-0 z-30 flex flex-col justify-end">
          <motion.button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: DURATION.base } }}
            exit={{ opacity: 0, transition: { duration: DURATION.fast } }}
            className="absolute inset-0 bg-ink/40"
          />
          <SheetBody key={item.id} itemId={item.id} onClose={onClose} onAdd={onAdd} />
        </div>
      )}
    </AnimatePresence>
  );
}

function SheetBody({ itemId, onClose, onAdd }: { itemId: string } & Omit<Props, "itemId">) {
  const item = findItem(itemId)!;
  const sizes = item.sizes!;
  const [size, setSize] = useState<SizeKey>(sizes[0][0]);
  const [sweet, setSweet] = useState(0);
  const [ice, setIce] = useState(0);
  const [qty, setQty] = useState(1);
  const [tops, setTops] = useState<number[]>([]);
  const { t, lang } = useT();
  const desc = descOf(item.id, lang);
  const panel = useRef<HTMLDivElement>(null);
  const drag = useDragControls();

  // Fokus masuk ke panel. Pengembalian fokus saat ditutup diurus CustomerApp.
  useEffect(() => {
    panel.current?.focus();
  }, []);

  const price = sizes.find((s) => s[0] === size)![1];
  const topSum = item.toppings ? tops.reduce((a, i) => a + TOPPINGS[i].price, 0) : 0;
  const total = (price + topSum) * qty;

  const add = () => {
    const opts: LineOpts = {
      size,
      sweet: HAS_SWEET.includes(size) ? sweet : undefined,
      ice: HAS_ICE.includes(size) ? ice : undefined,
      tops: item.toppings && tops.length ? [...tops].sort() : undefined,
    };
    // Keterangan untuk barista selalu Bahasa Indonesia; pelanggan melihat versi bahasanya dari `opts`.
    const detail = describe(item.id, opts, "id");
    onAdd({ key: `${item.id}|${detail}`, itemId: item.id, name: item.name, detail, opts, unit: price + topSum, qty }, item.name);
    onClose();
  };

  return (
    <motion.div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
      tabIndex={-1}
      initial={{ y: "100%" }}
      animate={{ y: 0, transition: SPRING_SHEET }}
      exit={{ y: "100%", transition: { duration: DURATION.base, ease: [0.4, 0, 1, 1] } }}
      // Panel bisa ditarik ke bawah untuk menutup (manipulasi langsung).
      drag="y"
      dragListener={false}
      dragControls={drag}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.7 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 110 || info.velocity.y > 600) onClose();
      }}
      // Tab berputar di dalam panel (halaman di belakangnya dibuat inert oleh CustomerApp).
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const els = [...panel.current!.querySelectorAll<HTMLElement>("button:not(:disabled), [href], input")];
        const first = els[0];
        const last = els.at(-1);
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
      className="relative flex max-h-[92%] flex-col rounded-t-[26px] bg-white outline-none"
    >
      <div
        onPointerDown={(e) => drag.start(e)}
        className="flex flex-none cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing"
        aria-hidden
      >
        <span className="h-1 w-10 rounded-full bg-line-strong" />
      </div>
      {/* Isi tidak boleh menyusut (`*:flex-none`): tanpa ini, di layar pendek bagian ber-overflow-hidden
          seperti "Tingkat manis" dan "Es" diperas jadi beberapa piksel, alih-alih panelnya yang bisa digulir. */}
      <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto overscroll-contain px-[18px] pb-2 *:flex-none">
        {item.image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: DURATION.slow, ease: EASE_OUT, delay: 0.05 } }}
            // Foto mengecil di layar pendek (bilah terjemahan/browser memakan tinggi), supaya pilihan tetap terlihat.
            className="relative h-[min(170px,22dvh)] flex-none overflow-hidden rounded-[18px] bg-paper"
          >
            <Image src={item.image} alt="" fill sizes="440px" className="object-cover" style={{ objectPosition: item.focus ?? "50% 50%" }} />
          </motion.div>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[30px] leading-[1.05]">{item.name}</h3>
            {desc && <p className="mt-1.5 text-sm leading-snug">{desc}</p>}
            <p className="mt-1 text-[13px] text-muted">{lang === "en" ? item.sectionEn : item.section}</p>
          </div>
          <IconButton label={t.close} onClick={onClose}>
            <Icon.Close />
          </IconButton>
        </div>

        <Group label={t.size}>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map(([k, p]) => (
              <Option key={k} group={`size-${item.id}`} on={size === k} onClick={() => setSize(k)} tall>
                <span className="text-[15px] font-semibold">{sizeLabel(k, lang)}</span>
                <span className="text-[13px] text-muted">{rp(p)}</span>
              </Option>
            ))}
          </div>
        </Group>

        <AnimatePresence initial={false}>
          {HAS_SWEET.includes(size) && (
            <Reveal key="sweet">
              <Group label={t.sweetness}>
                <div className="flex gap-2">
                  {SWEET_OPTS[lang].map((v, i) => (
                    <Option key={i} group={`sweet-${item.id}`} on={sweet === i} onClick={() => setSweet(i)}>
                      {v}
                    </Option>
                  ))}
                </div>
              </Group>
            </Reveal>
          )}
          {HAS_ICE.includes(size) && (
            <Reveal key="ice">
              <Group label={t.ice}>
                <div className="flex gap-2">
                  {ICE_OPTS[lang].map((v, i) => (
                    <Option key={i} group={`ice-${item.id}`} on={ice === i} onClick={() => setIce(i)}>
                      {v}
                    </Option>
                  ))}
                </div>
              </Group>
            </Reveal>
          )}
          {PACKED.includes(size) && (
            <Reveal key="packed">
              <p className="rounded-2xl bg-paper px-3.5 py-3 text-[13px] leading-relaxed text-muted">{t.packedNote}</p>
            </Reveal>
          )}
        </AnimatePresence>

        {item.toppings && (
          <Group label={t.toppings} hint={t.optional}>
            <div className="grid grid-cols-2 gap-2">
              {TOPPINGS.map((top, i) => {
                const on = tops.includes(i);
                return (
                  <motion.button
                    key={top.id}
                    type="button"
                    whileTap={TAP}
                    aria-pressed={on}
                    onClick={() => setTops(on ? tops.filter((x) => x !== i) : [...tops, i])}
                    className={`flex min-h-[46px] items-center justify-between rounded-[14px] px-3 text-[13px] font-semibold transition-colors duration-150 ${
                      on ? "border-2 border-accent bg-tint" : "border border-line-strong bg-white"
                    }`}
                  >
                    <span>{top[lang]}</span>
                    <span className="font-medium text-muted">+{rp(top.price)}</span>
                  </motion.button>
                );
              })}
            </div>
          </Group>
        )}
      </div>

      <div className="flex flex-none items-center gap-2.5 border-t border-line px-[18px] pb-5 pt-3">
        <div className="flex h-[54px] items-center rounded-2xl border border-line-strong">
          <Press aria-label={t.decrease} disabled={qty === 1} onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-full w-[46px] text-[22px] text-accent disabled:text-line-strong">
            −
          </Press>
          <span className="w-6 text-center text-[17px] font-semibold" aria-live="polite">
            {qty}
          </span>
          <Press
            aria-label={qty >= MAX_QTY ? t.maxQty(MAX_QTY) : t.increase}
            disabled={qty >= MAX_QTY}
            onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
            className="h-full w-[46px] text-[22px] text-accent disabled:text-line-strong"
          >
            +
          </Press>
        </div>
        <Press onClick={add} className="flex h-[54px] flex-1 items-center justify-between overflow-hidden rounded-2xl bg-accent px-[18px] text-[15px] font-semibold text-white">
          <span>{t.add}</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={total}
              initial={{ y: -14, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { duration: DURATION.fast, ease: EASE_OUT } }}
              exit={{ y: 14, opacity: 0, transition: { duration: 0.1 } }}
            >
              {rp(total)}
            </motion.span>
          </AnimatePresence>
        </Press>
      </div>
    </motion.div>
  );
}

function Group({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">
        {label} {hint && <span className="font-normal text-muted">· {hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

/** Bagian yang muncul/hilang mengikuti pilihan ukuran: tinggi beranimasi agar tata letak tidak "melompat". */
function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto", transition: { duration: DURATION.base, ease: EASE_OUT } }}
      exit={{ opacity: 0, height: 0, transition: { duration: DURATION.fast } }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

function Option({
  group,
  on,
  onClick,
  tall,
  children,
}: {
  group: string;
  on: boolean;
  onClick: () => void;
  tall?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileTap={TAP}
      aria-pressed={on}
      onClick={onClick}
      className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[14px] border border-line-strong bg-white px-2 text-[13px] font-semibold ${
        tall ? "min-h-[62px]" : "min-h-[46px]"
      }`}
    >
      {/* Sorotan pilihan bergeser antaropsi, bukan muncul tiba-tiba. */}
      {on && <motion.span layoutId={group} transition={SPRING_SOFT} className="absolute -inset-px rounded-[14px] border-2 border-accent bg-tint" />}
      <span className="relative flex flex-col items-center gap-0.5">{children}</span>
    </motion.button>
  );
}
