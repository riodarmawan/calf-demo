import Link from "next/link";
import Image from "next/image";
import { CalfMascot } from "@/components/ui";

const LINKS = [
  {
    href: "/meja/07",
    title: "Pelanggan",
    desc: "Yang dilihat pelanggan setelah scan QR di Meja 07: menu, keranjang, bayar QRIS, dan status pesanan.",
    tag: "Buka di HP",
  },
  {
    href: "/barista",
    title: "Barista & kasir",
    desc: "Papan pesanan real-time, timer batas waktu, dan penanda menu habis.",
    tag: "Tablet di bar",
  },
  {
    href: "/admin",
    title: "Admin & owner",
    desc: "Ringkasan penjualan, menu dan harga, serta meja dan QR code.",
    tag: "Desktop",
  },
  {
    href: "/layar",
    title: "Layar antrean",
    desc: "Nomor antrean yang sedang disiapkan dan siap diambil, untuk TV di dekat kasir. Tanpa nama pelanggan.",
    tag: "TV di kasir",
  },
  {
    href: "/qr",
    title: "QR meja",
    desc: "Table tent siap cetak dengan QR unik untuk setiap meja.",
    tag: "Cetak",
  },
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#dce3ee] via-[#eeeae3] to-cream">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-10 sm:gap-12 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-6">
          <div className="flex items-end gap-3">
            <Image src="/images/logo-lockup-blue.png" alt="Calf Coffee & Milkbar" width={816} height={507} className="h-auto w-40" priority />
            <CalfMascot className="mb-1 h-16 w-auto text-accent" />
          </div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-clay">Prototipe · QR table ordering</div>
          <h1 className="font-display max-w-3xl text-5xl leading-[0.95] sm:text-7xl">
            Pesan dari meja. <em className="text-clay">Tanpa antre.</em>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted">
            Pelanggan scan QR di meja, memilih menu, membayar dengan QRIS, lalu mengambil pesanan di kasir saat nomor antreannya muncul di layar.
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group flex h-full flex-col gap-3 rounded-3xl border border-line bg-white/80 p-5 sm:p-6 shadow-[0_1px_2px_rgba(43,48,64,0.04),0_8px_24px_rgba(43,48,64,0.05)] backdrop-blur transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(43,48,64,0.05),0_16px_40px_rgba(43,48,64,0.1)] active:translate-y-0 active:scale-[0.99]"
              >
                <span className="self-start rounded-full bg-tint px-2.5 py-1 text-xs font-semibold text-accent">{l.tag}</span>
                <span className="font-display text-3xl leading-none">{l.title}</span>
                <span className="text-[15px] leading-relaxed text-muted">{l.desc}</span>
                <span className="mt-auto pt-2 text-sm font-semibold text-accent">
                  Buka <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="rounded-3xl bg-mist p-5 text-[15px] sm:p-6 leading-relaxed text-[#3a4560]">
          <h2 className="font-display text-2xl text-ink">Cara mencoba alurnya</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>Buka halaman Pelanggan dan Barista di dua tab atau dua jendela berdampingan.</li>
            <li>Pesan dan bayar di halaman Pelanggan. Pesanan langsung muncul di kolom “Baru” dashboard barista.</li>
            <li>Majukan statusnya dari dashboard. Layar pelanggan ikut berubah dan bergetar saat pesanan siap.</li>
          </ol>
          <p className="mt-3 text-sm text-muted">
            Data demo disimpan di browser ini saja. Di produksi, bagian ini diganti database, payment gateway QRIS, dan kanal real-time.
          </p>
        </section>
      </div>
    </main>
  );
}
