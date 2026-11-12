"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MAX_QTY, actions, prepStats, useCalf, useLocal, type CartLine, type Order } from "@/lib/store";
import { DICT, LangContext, type Lang } from "@/lib/i18n";
import { screenVariants, DURATION, EASE_OUT, EASE_IN } from "@/lib/motion";
import { Icon } from "@/components/ui";
import { MenuScreen } from "./MenuScreen";
import { ItemSheet } from "./ItemSheet";
import { CartScreen } from "./CartScreen";
import { PayScreen, PAY_LIMIT_MS } from "./PayScreen";
import { TrackScreen } from "./TrackScreen";

type Screen = "menu" | "cart" | "pay" | "track";
const DEPTH: Record<Screen, number> = { menu: 0, cart: 1, pay: 2, track: 3 };
const EMPTY_CART: CartLine[] = [];
const NO_IDS: string[] = [];

export function CustomerApp({ table }: { table: string }) {
  const store = useCalf();
  const [cart, setCart] = useLocal<CartLine[]>(`calf-cart-${table}`, EMPTY_CART);
  // Daftar, bukan satu ID: "Pesan lagi" tidak boleh menghilangkan nomor antrean pesanan sebelumnya.
  const [orderIds, setOrderIds] = useLocal<string[]>(`calf-orders-${table}`, NO_IDS);
  // Batas waktu bayar disimpan, supaya kembali dari aplikasi e-wallet (halaman dimuat ulang) tetap ke layar bayar.
  const [payUntil, setPayUntil] = useLocal<number | null>(`calf-pay-${table}`, null);
  const [name, setName] = useLocal<string>("calf-name", "");
  // Bahasa dipilih pelanggan dan diingat di perangkat ini.
  const [lang, setLang] = useLocal<Lang>("calf-lang", "id");
  const t = DICT[lang];

  useEffect(() => {
    document.documentElement.lang = lang; // pembaca layar memakai pelafalan yang benar
  }, [lang]);

  const soldOut = store.soldOut;
  const visibleCart = cart.filter((l) => !soldOut.includes(l.itemId));

  const myOrders = orderIds.map((id) => store.orders.find((o) => o.id === id)).filter((o): o is Order => !!o);
  const activeOrders = myOrders.filter((o) => o.status < 3);
  const [trackId, setTrackId] = useState<string | null>(null);
  const tracked = myOrders.find((o) => o.id === trackId) ?? activeOrders.at(-1);

  const [chosen, setChosen] = useState<Screen | null>(null);
  // Saat halaman dibuka ulang: lanjutkan pembayaran yang tertunda, atau tampilkan status pesanan aktif.
  const screen: Screen = chosen ?? (payUntil && visibleCart.length ? "pay" : activeOrders.length ? "track" : "menu");
  const [dir, setDir] = useState(1);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number | string; msg: string; undo?: () => void } | null>(null);

  /* Navigasi memakai riwayat browser, sehingga tombol "kembali" di HP bekerja seperti yang diharapkan. */
  const go = useCallback(
    (next: Screen, opts: { replace?: boolean } = {}) => {
      setDir(DEPTH[next] >= DEPTH[screen] ? 1 : -1);
      setChosen(next);
      if (opts.replace) window.history.replaceState({ calf: next }, "");
      else window.history.pushState({ calf: next }, "");
    },
    [screen],
  );

  const back = useCallback(() => {
    if (window.history.state?.calf) window.history.back();
    else {
      setDir(-1);
      setChosen("menu");
    }
  }, []);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      setDir(-1);
      setSheetId(null);
      setChosen((e.state?.calf as Screen | undefined) ?? "menu");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Meninggalkan layar bayar (tombol kembali) berarti pembayaran dibatalkan.
  useEffect(() => {
    if (screen !== "pay" && payUntil) setPayUntil(null);
  }, [screen, payUntil, setPayUntil]);

  useEffect(() => {
    if (!toast) return;
    // Notifikasi dengan tombol "Batalkan" diberi waktu lebih lama supaya sempat dibaca dan diketuk.
    const t = setTimeout(() => setToast(null), toast.undo ? 6000 : 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Menu di keranjang yang baru ditandai habis: beri tahu, jangan hilang diam-diam.
  // Disesuaikan saat render (bukan effect), sesuai pola React "menyimpan info dari render sebelumnya".
  const gone = cart.filter((l) => soldOut.includes(l.itemId));
  const goneKey = gone.map((l) => l.key).join(",");
  const [seenGone, setSeenGone] = useState("");
  if (goneKey !== seenGone) {
    setSeenGone(goneKey);
    if (goneKey) {
      const names = [...new Set(gone.map((l) => l.name))].join(", ");
      setToast({ id: `gone:${goneKey}`, msg: t.goneFromCart(names) });
      if (visibleCart.length === 0 && (screen === "cart" || screen === "pay")) {
        setDir(-1);
        setChosen("menu");
      }
    }
  }

  // Benar-benar dikeluarkan dari keranjang tersimpan, supaya tidak muncul lagi saat menunya tersedia kembali.
  useEffect(() => {
    if (goneKey) setCart((c) => c.filter((l) => !soldOut.includes(l.itemId)));
  }, [goneKey, soldOut, setCart]);

  // Panel pilihan untuk menu yang baru habis ditutup, supaya tidak bisa ditambahkan.
  if (sheetId && soldOut.includes(sheetId)) {
    setSheetId(null);
    setToast({ id: `sheet:${sheetId}`, msg: t.goneFromSheet });
  }

  // Ketukan tidak sengaja (misalnya saat menggulir) bisa dibatalkan dari notifikasi.
  const undoTo = (before: CartLine[]) => () => {
    setCart(before);
    setToast(null);
  };

  const addLine = (line: CartLine, label: string) => {
    const before = cart;
    setCart((prev) => {
      const i = prev.findIndex((l) => l.key === line.key);
      return i >= 0 ? prev.map((l, n) => (n === i ? { ...l, qty: Math.min(MAX_QTY, l.qty + line.qty) } : l)) : [...prev, line];
    });
    setToast({ id: Date.now(), msg: t.added(label), undo: undoTo(before) });
  };

  // Keranjang yang jadi kosong tetap di layar keranjang; tidak melempar pelanggan ke menu.
  const changeQty = (key: string, delta: number) => {
    const before = visibleCart;
    const next = visibleCart.map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0);
    setCart(next);
    const removed = before.find((l) => l.key === key && !next.some((n) => n.key === key));
    if (removed) setToast({ id: Date.now(), msg: t.removed(removed.name), undo: undoTo(before) });
  };

  const startPay = () => {
    if (!payUntil || payUntil < Date.now()) setPayUntil(Date.now() + PAY_LIMIT_MS);
    go("pay");
  };

  const onPaid = () => {
    // Hanya item yang benar-benar tersedia, sama persis dengan total yang dibayar.
    const order = actions.placeOrder({ table, name: name.trim().slice(0, 20), lines: visibleCart });
    setOrderIds((prev) => [...prev.filter((id) => store.orders.some((o) => o.id === id && o.status < 3)), order.id]);
    setTrackId(order.id);
    setCart(EMPTY_CART);
    setPayUntil(null);
    go("track", { replace: true });
  };

  const openOrder = (id: string) => {
    setTrackId(id);
    go("track");
  };

  const startOver = () => {
    setTrackId(null);
    setDir(-1);
    setChosen("menu");
    window.history.replaceState({ calf: "menu" }, "");
  };

  const showMenu = screen === "menu" || (screen === "track" && !tracked) || (screen === "pay" && !payUntil);
  const shown = showMenu ? "menu" : screen;

  // Pembuka panel dicatat sebelum halaman jadi inert (inert melepas fokus),
  // lalu fokus dikembalikan ke sana saat panel ditutup, bukan ke menu tetangga.
  const opener = useRef<HTMLElement | null>(null);
  const openSheet = (id: string) => {
    opener.current = document.activeElement as HTMLElement | null;
    setSheetId(id);
  };
  useEffect(() => {
    if (sheetId || !opener.current) return;
    opener.current.focus({ preventScroll: true });
    opener.current = null;
  }, [sheetId]);

  // Saat layar berganti, fokus pindah ke judul layar baru supaya pembaca layar mengumumkannya.
  // Tidak dijalankan saat halaman pertama dibuka, agar fokus awal tidak direbut.
  const firstScreen = useRef(true);
  useEffect(() => {
    if (firstScreen.current) {
      firstScreen.current = false;
      return;
    }
    const h1 = document.querySelector<HTMLElement>(`[data-screen="${shown}"] h1`);
    if (!h1) return;
    h1.tabIndex = -1;
    h1.focus({ preventScroll: true });
  }, [shown]);

  return (
    <LangContext value={lang}>
      <main className="relative mx-auto flex h-dvh max-w-[480px] flex-col overflow-hidden bg-spots sm:border-x sm:border-line sm:shadow-[0_0_80px_rgba(43,48,64,0.08)]">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={shown}
            data-screen={shown}
            // Saat panel pilihan terbuka, halaman di belakangnya tidak bisa dijangkau keyboard atau pembaca layar.
            inert={!!sheetId}
            custom={dir}
            variants={screenVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex flex-col"
          >
            {showMenu && (
              <MenuScreen
                table={table}
                cart={visibleCart}
                soldOut={soldOut}
                activeOrders={activeOrders}
                onOpenOrder={openOrder}
                onOpen={openSheet}
                onQuickAdd={addLine}
                onGoCart={() => go("cart")}
                onToggleLang={() => setLang(lang === "id" ? "en" : "id")}
              />
            )}
            {screen === "cart" && (
              <CartScreen
                table={table}
                cart={visibleCart}
                name={name}
                onName={setName}
                onQty={changeQty}
                onBack={back}
                onAddMore={back}
                onPay={startPay}
              />
            )}
            {screen === "pay" && payUntil && (
              <PayScreen
                key={payUntil}
                total={visibleCart.reduce((a, l) => a + l.unit * l.qty, 0)}
                deadline={payUntil}
                onRenew={() => setPayUntil(Date.now() + PAY_LIMIT_MS)}
                onBack={back}
                onPaid={onPaid}
              />
            )}
            {screen === "track" && tracked && (
              <TrackScreen
                order={tracked}
                ahead={store.orders.filter((o) => o.status < 2 && o.createdAt < tracked.createdAt).length}
                prep={prepStats(store.orders)}
                onOrderAgain={startOver}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <ItemSheet itemId={sheetId} onClose={() => setSheetId(null)} onAdd={addLine} />

        {/* Wilayah aria-live selalu ada supaya pembaca layar mengumumkan notifikasi. */}
        <div aria-live="polite" className="pointer-events-none absolute inset-x-4 bottom-24 z-40">
          <AnimatePresence>
            {toast && (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } }}
                exit={{ opacity: 0, y: 8, transition: { duration: DURATION.fast, ease: EASE_IN } }}
                className="pointer-events-auto flex items-center gap-2.5 rounded-2xl bg-ink py-1.5 pl-4 pr-1.5 text-sm font-medium text-white shadow-lg"
              >
                <span className="text-[#b9d2b2]">
                  <Icon.Check />
                </span>
                <span className="flex-1 py-1.5">{toast.msg}</span>
                {toast.undo && (
                  <button type="button" onClick={toast.undo} className="h-11 shrink-0 rounded-xl px-3 font-semibold text-[#b9c6f2] hover:bg-white/10">
                    {t.undo}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </LangContext>
  );
}
