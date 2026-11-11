"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { TABLES } from "@/lib/menu";
import { Logo } from "@/components/ui";

export function TableTents() {
  const [qrs, setQrs] = useState<Record<string, string>>({});
  const [origin, setOrigin] = useState("");

  // QR berisi tautan absolut ke halaman meja, memakai alamat situs yang sedang dibuka.
  useEffect(() => {
    const base = window.location.origin;
    Promise.all(
      TABLES.map(async (t) => [t, await QRCode.toString(`${base}/meja/${t}`, { type: "svg", margin: 0, color: { dark: "#2b3040", light: "#0000" } })] as const),
    ).then((pairs) => {
      setOrigin(base);
      setQrs(Object.fromEntries(pairs));
    });
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="no-print mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm font-semibold text-accent">
            ← Admin
          </Link>
          <h1 className="font-display mt-2 text-4xl leading-none">Table tent QR</h1>
          <p className="mt-2 text-sm text-muted">Setiap QR membuka halaman pesan untuk mejanya. {origin && `Alamat saat ini: ${origin}`}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="h-11 rounded-xl bg-accent px-5 text-sm font-semibold text-white transition active:scale-[0.97]"
        >
          Cetak semua
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
        {TABLES.map((t) => (
          <article
            key={t}
            className="flex break-inside-avoid flex-col items-center gap-4 overflow-hidden rounded-[28px] bg-gradient-to-b from-[#dce3ee] via-[#eeeae3] to-cream pb-6 text-center"
          >
            <div className="h-4 w-full bg-[repeating-conic-gradient(#d8b7b1_0_25%,#fff_0_50%)] bg-[length:16px_16px]" />
            <Logo lockup className="h-auto w-28" />
            <h2 className="font-display text-[34px] leading-[0.95]">
              Pesan dari
              <br />
              <em className="text-clay">meja ini</em>
            </h2>
            <div className="flex w-[200px] flex-col items-center gap-2.5 rounded-[24px] bg-white p-4 shadow-[0_20px_50px_rgba(43,48,64,0.12)]">
              {qrs[t] ? (
                <div className="size-[164px] [&>svg]:size-full" role="img" aria-label={`QR Meja ${t}`} dangerouslySetInnerHTML={{ __html: qrs[t] }} />
              ) : (
                <div className="size-[164px] animate-pulse rounded-lg bg-paper" />
              )}
              <div className="font-display text-3xl leading-none">Meja {t}</div>
            </div>
            <p className="px-6 text-[15px] font-semibold">1. Scan · 2. Bayar QRIS · 3. Ambil</p>
            <p className="-mt-2 px-6 text-[13px] text-muted">Ambil pesananmu di kasir saat namamu dipanggil.</p>
          </article>
        ))}
      </div>
    </main>
  );
}
