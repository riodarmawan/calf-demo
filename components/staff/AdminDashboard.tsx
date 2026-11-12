"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MENU, TABLES, sizeLabel } from "@/lib/menu";
import { rp } from "@/lib/format";
import { EASE_OUT } from "@/lib/motion";
import { actions, easeStats, prepStats, useCalf } from "@/lib/store";
import { Logo } from "@/components/ui";
import { Switch } from "./Switch";

const NAV = [
  { href: "#ringkasan", label: "Ringkasan" },
  { href: "#menu", label: "Menu & harga" },
  { href: "#meja", label: "Meja & QR" },
];

export function AdminDashboard() {
  const { orders, soldOut } = useCalf();
  const paid = orders;
  const revenue = paid.reduce((a, o) => a + o.total, 0);
  const cups = paid.reduce((a, o) => a + o.lines.reduce((b, l) => b + l.qty, 0), 0);

  const hours = Array.from({ length: 14 }, (_, i) => i + 8).map((h) => ({
    h,
    total: paid.filter((o) => new Date(o.createdAt).getHours() === h).reduce((a, o) => a + o.total, 0),
  }));
  const peak = Math.max(1, ...hours.map((x) => x.total));
  const peakHour = hours.find((x) => x.total === peak && x.total > 0);

  const best = Object.values(
    paid
      .flatMap((o) => o.lines)
      .reduce<Record<string, { name: string; qty: number }>>((acc, l) => {
        acc[l.itemId] = { name: l.name, qty: (acc[l.itemId]?.qty ?? 0) + l.qty };
        return acc;
      }, {}),
  )
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
  const bestMax = Math.max(1, ...best.map((b) => b.qty));

  const kpis = [
    { label: "Omzet (data demo)", value: rp(revenue) },
    { label: "Jumlah pesanan", value: String(paid.length) },
    { label: "Rata-rata nilai pesanan", value: paid.length ? rp(Math.round(revenue / paid.length)) : "–" },
    { label: "Item terjual", value: String(cups) },
  ];

  // Dua ukuran pilot: apakah pesanan cepat siap, dan apakah memesan dari meja terasa mudah.
  const prep = prepStats(orders);
  const ease = easeStats(orders);
  const pilot = [
    {
      label: "Bayar sampai siap (median)",
      value: prep ? `${prep.median} menit` : "–",
      note: prep ? `Setengah pesanan siap dalam ${prep.lo}–${prep.hi} menit · ${prep.n} pesanan terakhir` : "Muncul setelah 3 pesanan ditandai siap",
    },
    {
      label: "Kemudahan memesan",
      value: ease ? `${ease.mean.toFixed(1)} / 7` : "–",
      note: ease
        ? `${ease.n} jawaban · Single Ease Question, 7 = sangat mudah`
        : "Pelanggan menjawab satu pertanyaan setelah pesanan siap",
    },
  ];

  const missing = MENU.flatMap((s) => s.items).filter((i) => !i.sizes).length;

  return (
    <div className="flex min-h-dvh flex-wrap bg-cream">
      <nav className="flex flex-[1_1_230px] flex-col gap-5 bg-[#ebe8e1] px-5 py-6 lg:sticky lg:top-0 lg:h-dvh lg:max-w-[260px]">
        <Link href="/" aria-label="Beranda prototipe">
          <Logo lockup className="h-auto w-32" />
        </Link>
        <ul className="flex flex-wrap gap-1.5 lg:flex-col">
          {NAV.map((n) => (
            <li key={n.href}>
              <a href={n.href} className="flex min-h-11 items-center rounded-xl px-3.5 text-sm font-semibold text-muted transition-colors hover:bg-white hover:text-accent">
                {n.label}
              </a>
            </li>
          ))}
          <li>
            <Link href="/barista" className="flex min-h-11 items-center rounded-xl px-3.5 text-sm font-semibold text-muted transition-colors hover:bg-white hover:text-accent">
              Papan barista ↗
            </Link>
          </li>
          <li>
            <Link href="/layar" className="flex min-h-11 items-center rounded-xl px-3.5 text-sm font-semibold text-muted transition-colors hover:bg-white hover:text-accent">
              Layar antrean ↗
            </Link>
          </li>
        </ul>
        <p className="mt-auto text-xs leading-relaxed text-muted">
          Outlet Jatiwarna
          <br />
          Peran: Owner
        </p>
      </nav>

      <main className="flex min-w-0 flex-[999_1_640px] flex-col gap-6 px-5 py-7 sm:px-8">
        <section id="ringkasan" className="flex scroll-mt-6 flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-4xl leading-none">Ringkasan</h1>
              <p className="mt-1.5 text-sm text-muted">Dihitung dari pesanan demo di browser ini.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-[13px] font-semibold">
              <span className="rounded-full bg-sage-tint px-3.5 py-2 text-sage">QRIS: aktif (demo)</span>
              <span className="rounded-full bg-sand px-3.5 py-2 text-sand-ink">POS &amp; printer: dikonfirmasi saat discovery</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-[20px] border border-line bg-white px-5 py-4">
                <div className="text-[13px] font-semibold text-muted">{k.label}</div>
                <motion.div key={k.value} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-display mt-1.5 text-3xl leading-tight">
                  {k.value}
                </motion.div>
              </div>
            ))}
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {pilot.map((k) => (
              <div key={k.label} className="rounded-[20px] border border-line bg-mist px-5 py-4">
                <div className="text-[13px] font-semibold text-muted">{k.label}</div>
                <div className="font-display mt-1.5 text-3xl leading-tight">{k.value}</div>
                <div className="mt-1 text-[13px] leading-snug text-muted">{k.note}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-0 flex-[2_1_460px] rounded-[20px] border border-line bg-white p-5">
              <h2 className="font-display text-2xl leading-none">Penjualan per jam</h2>
              <p className="mt-1.5 text-[13px] text-muted">Angka di atas batang dalam ribu rupiah.</p>
              <div
                className="mt-4 flex h-52 items-end gap-1.5"
                role="img"
                aria-label={
                  peakHour
                    ? `Penjualan per jam. Tertinggi pukul ${peakHour.h}.00: ${rp(peakHour.total)}. ${hours
                        .filter((x) => x.total)
                        .map((x) => `${x.h}.00 ${rp(x.total)}`)
                        .join(", ")}`
                    : "Penjualan per jam: belum ada penjualan."
                }
              >
                {hours.map((x, i) => (
                  <div key={x.h} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                    {/* Nilai tertulis langsung: tooltip hover tidak ada di layar sentuh. */}
                    <span className="text-xs font-semibold tabular-nums text-ink">{x.total ? Math.round(x.total / 1000) : ""}</span>
                    <motion.div
                      title={`${x.h}.00 · ${rp(x.total)}`}
                      className={`w-full origin-bottom rounded-t-md ${x.total === peak && x.total > 0 ? "bg-clay" : "bg-accent"}`}
                      style={{ height: `${Math.max(2, (x.total / peak) * 100)}%` }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.025 }}
                    />
                    <span className="text-xs font-semibold text-muted">{String(x.h).padStart(2, "0")}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="min-w-0 flex-[1_1_280px] rounded-[20px] border border-line bg-white p-5">
              <h2 className="font-display text-2xl leading-none">Menu terlaris</h2>
              <div className="mt-4 flex flex-col gap-3.5">
                {best.length === 0 && <p className="text-sm text-muted">Belum ada pesanan.</p>}
                {best.map((b, i) => (
                  <div key={b.name}>
                    <div className="flex justify-between text-sm font-semibold">
                      <span>{b.name}</span>
                      <span>{b.qty}</span>
                    </div>
                    <div className="mt-1.5 h-2.5 rounded-full bg-tint">
                      <motion.div
                        className="h-full origin-left rounded-full bg-accent"
                        style={{ width: `${(b.qty / bestMax) * 100}%` }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.05 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="menu" className="scroll-mt-6 rounded-[24px] border border-line bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-3xl leading-none">Menu &amp; harga</h2>
            <span className="text-[13px] text-muted">
              {MENU.reduce((a, s) => a + s.items.length, 0)} menu · {missing} menunggu harga
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-5">
            {MENU.map((sec) => (
              <div key={sec.key}>
                <h3 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-clay">
                  {sec.title} · {sec.items.length}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-[0.08em] text-muted">
                        <th className="border-b-2 border-line px-3 py-2 font-semibold">Menu</th>
                        <th className="border-b-2 border-line px-3 py-2 font-semibold">Ukuran &amp; harga</th>
                        <th className="border-b-2 border-line px-3 py-2 font-semibold">Tersedia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.items.map((it) => {
                        const out = soldOut.includes(it.id);
                        return (
                          <tr key={it.id} className="border-b border-hair">
                            <td className="px-3 py-2.5 font-semibold">{it.name}</td>
                            <td className="px-3 py-2.5 text-muted">
                              {it.sizes ? (
                                it.sizes.map(([k, p]) => `${sizeLabel(k)} ${rp(p)}`).join(" · ")
                              ) : (
                                <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-sand-ink">Perlu harga, disembunyikan dari pelanggan</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              {it.sizes ? <Switch on={!out} onChange={() => actions.toggleSoldOut(it.id)} label={`${it.name} tersedia`} /> : <span className="text-faint">–</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="meja" className="scroll-mt-6 rounded-[24px] border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl leading-none">Meja &amp; QR code</h2>
              <p className="mt-1.5 text-[13px] text-muted">Setiap meja punya tautan sendiri. QR bisa dicetak ulang kapan saja.</p>
            </div>
            <Link href="/qr" className="flex h-11 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-white transition active:scale-[0.97]">
              Cetak table tent
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
            {TABLES.map((t) => {
              const busy = orders.some((o) => o.table === t && o.status < 3);
              return (
                <Link
                  key={t}
                  href={`/meja/${t}`}
                  className="flex flex-col gap-2 rounded-2xl border-2 border-line p-3 transition-colors hover:border-accent"
                >
                  <span className="flex items-center justify-between">
                    <b className="font-display text-2xl">M{t}</b>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${busy ? "bg-tint text-accent" : "bg-paper text-muted"}`}>
                      {busy ? "Ada pesanan" : "Kosong"}
                    </span>
                  </span>
                  <span className="text-[13px] font-semibold text-accent">Buka halaman meja →</span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
