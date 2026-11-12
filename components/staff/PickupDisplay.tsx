"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { OUTLET } from "@/lib/menu";
import { SPRING_SOFT } from "@/lib/motion";
import { useCalf, type Order } from "@/lib/store";
import { CalfMascot, Logo } from "@/components/ui";

/**
 * Layar antrean untuk TV atau tablet di dekat kasir.
 * Hanya nomor antrean yang tampil, tanpa nama: cukup untuk mengambil pesanan, dan nama
 * pelanggan tidak terpampang ke seluruh ruangan. Panggilan suara di kafe yang ramai mudah
 * terlewat; nomor di layar tetap terlihat sampai pesanan diambil.
 */
export function PickupDisplay() {
  const { orders } = useCalf();
  const ready = orders.filter((o) => o.status === 2).sort((a, b) => (a.readyAt ?? a.updatedAt) - (b.readyAt ?? b.updatedAt));
  const making = orders.filter((o) => o.status < 2).sort((a, b) => a.createdAt - b.createdAt);

  return (
    <main className="bg-spots flex min-h-dvh flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Link href="/" aria-label="Beranda prototipe" className="flex items-end gap-3">
          <Logo lockup className="h-10 w-auto sm:h-14" />
          <CalfMascot className="mb-1 h-9 w-auto text-accent sm:h-12" />
        </Link>
        <h1 className="font-display text-2xl leading-none sm:text-right sm:text-3xl lg:text-5xl">
          Antrean pesanan
          <span className="mt-1 block text-sm font-semibold font-sans text-muted sm:text-base lg:text-xl">
            Calf {OUTLET} · Order queue
          </span>
        </h1>
      </header>

      <div className="grid flex-1 gap-4 sm:gap-6 lg:grid-cols-[2fr_3fr]">
        <Column title="Sedang disiapkan" sub="Preparing" list={making} tone="making" empty="Belum ada pesanan · No orders yet" />
        <Column title="Siap diambil" sub="Ready for pickup" list={ready} tone="ready" empty="Belum ada yang siap · Nothing ready yet" />
      </div>

      <footer className="rounded-[20px] bg-ink px-4 py-3 text-center text-[15px] font-semibold text-white sm:px-6 sm:py-4 sm:text-lg lg:text-2xl">
        Tidak perlu antre: scan QR di meja Anda. <span className="text-[#b9c6f2]">No need to queue: scan the QR at your table.</span>
      </footer>
    </main>
  );
}

type ColumnProps = { title: string; sub: string; list: Order[]; tone: "making" | "ready"; empty: string };

function Column({ title, sub, list, tone, empty }: ColumnProps) {
  const ready = tone === "ready";
  return (
    <section
      aria-label={title}
      className={`flex flex-col gap-3 rounded-[24px] p-4 sm:gap-4 sm:rounded-[28px] sm:p-6 ${ready ? "bg-sage text-white" : "border border-line bg-white text-ink"}`}
    >
      <h2 className="font-display text-2xl leading-none sm:text-3xl lg:text-4xl">
        {title}
        <span className={`ml-2 align-middle text-sm font-semibold font-sans sm:ml-3 sm:text-base lg:text-lg ${ready ? "text-[#dce8d8]" : "text-muted"}`}>
          {sub}
        </span>
      </h2>
      {/* Pembaca layar mengumumkan nomor yang baru siap; kolom "disiapkan" tidak perlu dibacakan. */}
      <ul aria-live={ready ? "polite" : undefined} className={`grid content-start gap-2 sm:gap-3 ${ready ? "grid-cols-2 xl:grid-cols-3" : "grid-cols-3 xl:grid-cols-4"}`}>
        <AnimatePresence initial={false}>
          {list.map((o) => (
            <motion.li
              key={o.id}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={SPRING_SOFT}
              className={`font-display flex items-center justify-center rounded-2xl leading-none lining-nums tabular-nums ${
                ready ? "bg-white py-4 text-4xl text-sage sm:py-5 sm:text-5xl lg:text-7xl" : "bg-paper py-2.5 text-2xl text-muted sm:py-3 sm:text-3xl lg:text-4xl"
              }`}
            >
              {o.queue}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {list.length === 0 && <p className={`text-lg ${ready ? "text-[#eef3ec]" : "text-muted"}`}>{empty}</p>}
    </section>
  );
}
