# Calf · QR Table Ordering (prototipe web)

Prototipe pemesanan dari meja untuk Calf Coffee & Milkbar. Pelanggan scan QR di meja, memilih menu, membayar dengan QRIS, lalu mengambil pesanan di kasir saat nama dan nomor antreannya dipanggil.

Dibangun dengan Next.js 16 (App Router), React 19, Tailwind CSS 4, dan Framer Motion.

## Menjalankan

Butuh Node.js 20.9 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

Untuk versi produksi:

```bash
npm run build
npm run start
```

## Halaman

| Alamat | Untuk | Isi |
|---|---|---|
| `/` | Presentasi | Pengantar dan tautan ke semua halaman |
| `/meja/07` | Pelanggan (HP) | Menu, pencarian, pilihan ukuran & rasa, keranjang, bayar QRIS, status pesanan |
| `/barista` | Barista & kasir (tablet) | Papan pesanan real-time, timer 8 menit, bunyi pesanan baru, sakelar menu habis |
| `/admin` | Owner (desktop) | Ringkasan penjualan, menu & harga, meja |
| `/qr` | Cetak | Table tent dengan QR asli untuk Meja 01–12 |

## Mencoba alurnya

1. Buka `/meja/07` dan `/barista` di dua tab atau dua jendela berdampingan.
2. Pesan dan bayar di halaman pelanggan (tombol e-wallet atau "Demo: simulasikan pembayaran berhasil").
3. Pesanan muncul di kolom **Baru** dashboard barista. Majukan statusnya; layar pelanggan ikut berubah, bergetar, dan judul tab berganti saat pesanan siap.
4. Matikan menu di panel "Ketersediaan menu"; menu itu langsung tampil **Habis** di HP pelanggan.

Untuk mencoba dari HP sungguhan di jaringan Wi-Fi yang sama, jalankan `npm run dev -- -H 0.0.0.0`, lalu buka `/qr` dari alamat IP komputer Anda supaya QR berisi alamat yang bisa dijangkau HP.

Data demo disimpan di `localStorage` browser dan disinkronkan antartab. Tombol **Reset demo** di dashboard barista mengembalikan data contoh.

## Animasi dan prinsip IMK

Semua nilai gerak ada di `lib/motion.ts`.

| Prinsip IMK | Penerapan |
|---|---|
| **Umpan balik langsung** (respons < 0,1 detik) | Semua tombol mengecil 3% saat ditekan. Tombol `+` berubah menjadi centang hijau setelah menu masuk keranjang. Angka di tombol "Lihat pesanan" melompat setiap bertambah. |
| **Visibilitas status sistem** | Hitung mundur pembayaran yang nyata, titik berdenyut "Menunggu pembayaran…", bar progres status pesanan yang terisi, label "Live" dan bunyi pesanan baru di dashboard barista. |
| **Kontinuitas & model mental spasial** | Layar maju bergeser dari kanan dan kembali dari kiri. Bottom sheet naik dari bawah dan bisa ditarik turun. Sorotan kategori dan pilihan ukuran "berpindah" ke pilihan baru. Kartu pesanan bergerak antarkolom di dashboard barista. |
| **Pencegahan & penanganan kesalahan** | Kolom nama yang kosong bergetar kecil, berbingkai merah, dan menampilkan pesan yang menjelaskan cara memperbaikinya. Menu habis tidak bisa dipilih. QR kedaluwarsa menampilkan tombol "Buat QR baru". |
| **Kontrol & kebebasan pengguna** | Tombol kembali di HP bekerja di setiap layar. Bottom sheet bisa ditutup dengan tarikan, ketukan di luar panel, tombol ×, atau Escape. |
| **Pengakuan, bukan ingatan** | Keranjang, nama, dan pesanan aktif tersimpan, jadi tidak hilang saat HP terkunci atau halaman di-refresh. Membuka ulang halaman meja langsung menampilkan status pesanan. |
| **Umpan balik multimodal** | Saat pesanan siap: kartu berubah hijau dan berdenyut sekali, HP bergetar, judul tab berganti, dan notifikasi muncul bila diizinkan. |
| **Durasi & easing yang wajar** | Transisi 150–300 ms. Masuk memakai ease-out, keluar memakai ease-in. Jarak gerak pendek (8–24 px) supaya tidak memicu pusing. |
| **Aksesibilitas gerak** | `MotionConfig reducedMotion="user"` dan aturan CSS `prefers-reduced-motion` mematikan animasi bergerak bagi pengguna yang meminta "kurangi gerakan". |

## Yang perlu diganti sebelum produksi

- `lib/store.ts`: ganti `localStorage` dengan database dan kanal real-time (misalnya Supabase).
- `components/customer/PayScreen.tsx`: QR saat ini adalah QR demo. Ganti dengan QRIS dinamis dan deep link e-wallet dari payment gateway (Midtrans atau Xendit), lalu konfirmasi pembayaran lewat webhook di server.
- Integrasi POS dan printer dapur, setelah merek dan modelnya diketahui.
- Harga Sweet Calf dan Calf Frappe, serta selisih harga Calf Smooth dan Brewmalt antara poster dan menu lengkap.
- Pajak dan biaya layanan, foto produk resmi, dan deskripsi rasa tiap menu.
