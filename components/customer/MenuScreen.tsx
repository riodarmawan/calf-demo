"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FEATURED, MENU, OUTLET, descOf, describe, findItem, isQuickAdd, searchMenu, sizeLabel, type MenuItem } from "@/lib/menu";
import { priceRange, rp } from "@/lib/format";
import { DURATION, EASE_IN, EASE_OUT, SPRING_SOFT, TAP, listItem } from "@/lib/motion";
import type { CartLine, Order } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { CalfMascot, Icon, Logo, Press } from "@/components/ui";

type Props = {
  table: string;
  cart: CartLine[];
  soldOut: string[];
  activeOrders: Order[];
  onOpenOrder: (id: string) => void;
  onOpen: (id: string) => void;
  onQuickAdd: (line: CartLine, label: string) => void;
  onGoCart: () => void;
  onToggleLang: () => void;
};

/** Menu tanpa harga tidak ditampilkan ke pelanggan sampai admin melengkapinya. */
const SECTIONS = MENU.map((s) => ({ ...s, items: s.items.filter((i) => i.sizes) })).filter((s) => s.items.length);

/** Kunci internal chip "Semua" (bukan teks yang tampil). */
const ALL = "all";

/** ID tanpa spasi: aria-labelledby memisah nilai di spasi, jadi "sec-Kopi Susu" tidak pernah tertaut. */
const secId = (key: string) => `sec-${key.replace(/\s+/g, "-")}`;

export function MenuScreen({ table, cart, soldOut, activeOrders, onOpenOrder, onOpen, onQuickAdd, onGoCart, onToggleLang }: Props) {
  const { t, lang } = useT();
  // Kategori yang sedang terlihat saat menggulir (scroll-spy), bukan filter.
  const [cat, setCat] = useState(ALL);
  const [q, setQ] = useState("");
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(null), 1400);
    return () => clearTimeout(t);
  }, [justAdded]);

  // Chip aktif selalu terlihat di baris chip yang bisa digeser.
  useEffect(() => {
    chips.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [cat]);

  const query = q.trim().toLowerCase();
  const sections = useMemo(() => {
    if (query) {
      const hits = searchMenu(query);
      return hits.length ? [{ key: "search", title: t.searchResults, items: hits as MenuItem[] }] : [];
    }
    return SECTIONS;
  }, [query, t]);

  const count = cart.reduce((a, l) => a + l.qty, 0);
  const total = cart.reduce((a, l) => a + l.qty * l.unit, 0);

  /** Posisi bagian di dalam area gulir. */
  const topOf = (key: string) => {
    const box = scroller.current!;
    const el = document.getElementById(secId(key))?.closest("section");
    return el ? el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop : 0;
  };

  const onScroll = () => {
    if (query) return;
    const y = scroller.current!.scrollTop + 8;
    let current = ALL;
    for (const s of SECTIONS) if (topOf(s.key) <= y) current = s.key;
    if (current !== cat) setCat(current);
  };

  // Chip = lompat ke bagian itu, daftar lengkap tetap ada di atas dan bawahnya.
  const pick = (key: string) => {
    setQ("");
    setCat(key);
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const jump = () => scroller.current?.scrollTo({ top: key === ALL ? 0 : topOf(key), behavior: smooth ? "smooth" : "auto" });
    // Dari hasil pencarian: tunggu daftar lengkap selesai dirender (transisi keluar ±80 ms).
    if (query) setTimeout(jump, 200);
    else jump();
  };

  const tap = (item: MenuItem) => {
    if (soldOut.includes(item.id) || !item.sizes) return;
    if (isQuickAdd(item)) {
      const [size, price] = item.sizes[0];
      const opts = { size };
      onQuickAdd({ key: `${item.id}|${size}`, itemId: item.id, name: item.name, detail: describe(item.id, opts, "id"), opts, unit: price, qty: 1 }, item.name);
      setJustAdded(item.id);
    } else onOpen(item.id);
  };

  return (
    <>
      <header className="flex-none border-b border-line bg-white">
        <h1 className="sr-only">{t.menuH1(OUTLET, table)}</h1>
        <div className="flex items-center gap-2 px-4 pb-2.5 pt-3">
          <Logo />
          {/* Disembunyikan di layar sangat sempit supaya chip meja tidak terlipat dua baris. */}
          <CalfMascot className="h-7 w-auto text-accent max-[359px]:hidden" />
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-tint px-3 py-1.5 text-[13px] font-semibold">
            <span className="text-accent">
              <Icon.Pin />
            </span>
            {OUTLET} · {t.table(table)}
          </div>
          {/* Ganti bahasa: label menampilkan bahasa tujuan, seperti kebiasaan umum di aplikasi. */}
          <Press
            onClick={onToggleLang}
            aria-label={t.langSwitchLabel}
            lang={lang === "id" ? "en" : "id"}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong text-[13px] font-bold text-accent"
          >
            {t.langSwitch}
          </Press>
        </div>
        <div className="px-4 pb-2.5">
          <label className="flex h-11 items-center gap-2.5 rounded-2xl bg-paper px-3.5 text-muted focus-within:ring-2 focus-within:ring-accent/30">
            <Icon.Search />
            <span className="sr-only">{t.searchLabel}</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQ("")}
              placeholder={t.searchPlaceholder}
              className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <AnimatePresence>
              {q && (
                <motion.button
                  type="button"
                  aria-label={t.clearSearch}
                  onClick={() => setQ("")}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: DURATION.fast }}
                  className="-mr-3 flex size-11 items-center justify-center rounded-full text-muted hover:bg-line"
                >
                  <Icon.Close className="size-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </label>
        </div>
        <nav ref={chips} aria-label={t.jumpToCategory} className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
          {[ALL, ...SECTIONS.map((s) => s.key)].map((key) => {
            const label = key === ALL ? t.all : lang === "en" ? SECTIONS.find((s) => s.key === key)!.en.key : key;
            const on = cat === key && !query;
            return (
              <motion.button
                key={key}
                type="button"
                whileTap={TAP}
                aria-current={on ? "true" : undefined}
                onClick={() => pick(key)}
                className={`relative h-11 shrink-0 rounded-full border px-3.5 text-[13px] font-semibold transition-colors duration-150 ${
                  on ? "border-ink text-white" : "border-line-strong bg-white text-ink"
                }`}
              >
                {/* Penanda kategori aktif "berpindah" ke chip baru: menunjukkan hubungan sebab-akibat. */}
                {on && <motion.span layoutId="chip-active" className="absolute inset-0 rounded-full bg-ink" transition={SPRING_SOFT} />}
                <span className="relative">{label}</span>
              </motion.button>
            );
          })}
        </nav>
        {/* Pesanan yang sudah dibayar tetap terlihat saat memesan lagi. */}
        {activeOrders.map((o) => (
          <Press
            key={o.id}
            onClick={() => onOpenOrder(o.id)}
            className={`flex min-h-11 w-full items-center justify-between gap-3 border-t border-line px-4 py-2 text-left text-[13px] font-semibold ${
              o.status === 2 ? "bg-sage text-white" : "bg-tint text-ink"
            }`}
          >
            <span>{t.yourOrder(o.queue, t.statusShort[o.status])}</span>
            <Icon.Chevron />
          </Press>
        ))}
      </header>

      <div ref={scroller} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto pb-28">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={query ? "q:" + query : "all"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: DURATION.fast } }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
          >
            {!query && (
              <>
                <div className="mx-4 mt-3.5 flex items-center gap-3 rounded-2xl border border-line bg-white px-3.5 py-3">
                  <ol className="flex shrink-0 gap-1.5" aria-label={t.howToOrder}>
                    {[1, 2, 3].map((n) => (
                      <li key={n} className="flex size-6.5 items-center justify-center rounded-full bg-tint text-xs font-bold text-accent">
                        {n}
                      </li>
                    ))}
                  </ol>
                  <p className="text-[13px] leading-snug text-muted">
                    {t.introA}
                    <b className="text-ink">{t.introB}</b>
                    {t.introC}
                  </p>
                </div>

                <h2 className="font-display px-4 pb-1.5 pt-5 text-[26px] leading-none">{t.featured}</h2>
                <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 pt-1">
                  {FEATURED.map((id, i) => {
                    const item = findItem(id);
                    if (!item?.sizes) return null;
                    return (
                      <motion.button
                        key={id}
                        type="button"
                        {...listItem(i)}
                        whileTap={TAP}
                        onClick={() => tap(item)}
                        aria-label={t.choose(item.name)}
                        className="w-[150px] shrink-0 overflow-hidden rounded-[18px] border border-line bg-white text-left"
                      >
                        <div className="relative h-[116px] bg-paper">
                          {item.image && (
                            <Image src={item.image} alt="" fill sizes="150px" className="object-cover" style={{ objectPosition: item.focus ?? "50% 50%" }} />
                          )}
                        </div>
                        <div className="px-3 pb-3 pt-2.5">
                          <div className="text-sm font-semibold leading-tight">{item.name}</div>
                          <div className="mt-1 text-[13px] font-semibold text-accent">{priceRange(item.sizes.map((s) => s[1]))}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </>
            )}

            {sections.map((sec, si) => (
              <section key={sec.key} className="px-4 pt-3.5" aria-labelledby={secId(sec.key)}>
                {/* Judul bagian menempel di atas saat digulir: pelanggan selalu tahu sedang di kategori apa. */}
                <div className="sticky top-0 z-10 -mx-4 flex items-baseline justify-between bg-cream px-4 pb-1.5 pt-2">

                  <h2 id={secId(sec.key)} className="font-display text-[26px] leading-none">
                    {"en" in sec && lang === "en" ? sec.en.title : sec.title}
                  </h2>
                  <span className="text-xs text-muted">{t.itemCount(sec.items.length)}</span>
                </div>
                <div className="overflow-hidden rounded-[18px] border border-line bg-white">
                  {sec.items.map((item, i) => (
                    <MenuRow
                      key={item.id}
                      item={item}
                      index={si === 0 ? i : 8}
                      last={i === sec.items.length - 1}
                      soldOut={soldOut.includes(item.id)}
                      added={justAdded === item.id}
                      onTap={() => tap(item)}
                    />
                  ))}
                </div>
              </section>
            ))}

            {query && sections.length === 0 && (
              <div className="px-8 py-12 text-center">
                <h2 className="font-display text-2xl">{t.notFound}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t.notFoundHint}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: SPRING_SOFT }}
            exit={{ y: 90, opacity: 0, transition: { duration: DURATION.fast, ease: EASE_IN } }}
            className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-b from-cream/0 via-cream to-cream px-4 pb-5 pt-3"
          >
            <Press
              onClick={onGoCart}
              className="flex h-[58px] w-full items-center justify-between rounded-[18px] bg-accent px-[18px] text-base font-semibold text-white shadow-[0_10px_30px_rgba(62,84,184,0.3)]"
            >
              <span className="flex items-center gap-2.5">
                {/* Angka "melompat" setiap kali bertambah: umpan balik bahwa item benar-benar masuk. */}
                <motion.span
                  key={count}
                  initial={{ scale: 1.35 }}
                  animate={{ scale: 1, transition: { type: "spring", stiffness: 500, damping: 18 } }}
                  className="flex h-6.5 min-w-6.5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[13px]"
                >
                  {count}
                </motion.span>
                {t.viewOrder}
              </span>
              <span>{rp(total)}</span>
            </Press>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuRow({
  item,
  index,
  last,
  soldOut,
  added,
  onTap,
}: {
  item: MenuItem;
  index: number;
  last: boolean;
  soldOut: boolean;
  added: boolean;
  onTap: () => void;
}) {
  const sizes = item.sizes ?? [];
  const quick = isQuickAdd(item);
  const { t, lang } = useT();
  const desc = descOf(item.id, lang);
  return (
    <motion.button
      type="button"
      {...listItem(index)}
      whileTap={soldOut ? undefined : { backgroundColor: "#f3f1ec", transition: { duration: DURATION.tap } }}
      disabled={soldOut}
      onClick={onTap}
      aria-label={soldOut ? t.soldOutLabel(item.name) : quick ? t.quickAdd(item.name) : t.choose(item.name)}
      className={`flex min-h-[72px] w-full items-center gap-3 bg-white px-3.5 py-3 text-left ${last ? "" : "border-b border-hair"} ${
        soldOut ? "opacity-55" : ""
      }`}
    >
      {item.image && (
        <span className="relative block size-16 shrink-0 overflow-hidden rounded-[14px] bg-paper">
          <Image src={item.image} alt="" fill sizes="64px" className="object-cover" style={{ objectPosition: item.focus ?? "50% 50%" }} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-semibold leading-snug">{item.name}</span>
        {desc && <span className="line-clamp-2 text-[13px] leading-snug text-muted">{desc}</span>}
        <span className="text-xs text-muted">{sizes.map((s) => sizeLabel(s[0], lang)).join(" · ")}</span>
        <span className={`text-sm font-semibold ${soldOut ? "text-faint" : ""}`}>{priceRange(sizes.map((s) => s[1]))}</span>
      </span>
      {soldOut ? (
        <span className="shrink-0 rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-muted">{t.soldOut}</span>
      ) : (
        <span
          aria-hidden
          className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
            added ? "border-sage bg-sage text-white" : "border-accent text-accent"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={added ? "ok" : "plus"}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { duration: DURATION.fast, ease: EASE_OUT } }}
              exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.08 } }}
            >
              {added ? <Icon.Check className="size-4" /> : <Icon.Plus />}
            </motion.span>
          </AnimatePresence>
        </span>
      )}
    </motion.button>
  );
}
