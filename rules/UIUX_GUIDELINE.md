# Akademi Kamera — Kaidah Desain UI/UX

**Versi:** 2.0 · **Tema:** Ink & Sprout (aksen hijau)
**Cakupan:** fondasi visual, komponen, struktur halaman (Beranda, Kursus, Materi, Kuis, Simulator, Analisis Foto, Dasbor, Area Instruktur), serta alur pengguna end-to-end.

Gaya visual dokumen ini (palet Ink & Sprout, tipografi, radius, elevasi, pola komponen) **meniru gaya desain Learnify**. Isi produk, halaman, dan alurnya sepenuhnya milik **Akademi Kamera**: LMS fotografi untuk mempelajari segitiga exposure (aperture, shutter speed, ISO). Fitur Learnify seperti XP, leaderboard, mentoring, dan Career Center **tidak** termasuk produk ini.

---

## Daftar Isi

1. [Ringkasan Produk & Peran Pengguna](#1-ringkasan-produk--peran-pengguna)
2. [Prinsip Desain](#2-prinsip-desain)
3. [Audit Singkat UI Saat Ini](#3-audit-singkat-ui-saat-ini)
4. [Fondasi: Warna](#4-fondasi-warna)
5. [Fondasi: Tipografi](#5-fondasi-tipografi)
6. [Fondasi: Spacing, Grid, Radius, Elevasi](#6-fondasi-spacing-grid-radius-elevasi)
7. [Fondasi: Ikon, Ilustrasi, Motion](#7-fondasi-ikon-ilustrasi-motion)
8. [Komponen](#8-komponen)
9. [App Shell](#9-app-shell)
10. [Struktur Dasbor Siswa](#10-struktur-dasbor-siswa)
11. [Halaman Belajar](#11-halaman-belajar)
12. [Simulator Kamera](#12-simulator-kamera)
13. [Analisis Foto](#13-analisis-foto)
14. [Halaman Publik & Autentikasi](#14-halaman-publik--autentikasi)
15. [Area Instruktur & Admin](#15-area-instruktur--admin)
16. [Alur End-to-End](#16-alur-end-to-end)
17. [State: Loading, Kosong, Error, Sukses](#17-state-loading-kosong-error-sukses)
18. [Aksesibilitas](#18-aksesibilitas)
19. [Bahasa & Microcopy](#19-bahasa--microcopy)
20. [Responsif](#20-responsif)
21. [Checklist Review Desain](#21-checklist-review-desain)

---

## 1. Ringkasan Produk & Peran Pengguna

Akademi Kamera adalah LMS fotografi berbasis web. Siswa belajar teori lewat kursus, mempraktikkannya di kamera virtual, lalu menguji pemahaman dengan menganalisis foto mereka sendiri.

| Peran | Tujuan utama | Area yang dipakai |
|---|---|---|
| **Pengunjung** | Mencoba alat dan mengenal kursus | Beranda, Katalog Kursus, Simulator, Analisis Foto, Masuk/Daftar |
| **Siswa** (`student`) | Memahami exposure dan bisa menerapkannya | Dasbor, Kursus, Materi, Kuis, Simulator, Analisis Foto |
| **Instruktur** (`instructor`) | Menyusun kursus dan memantau siswa | Area Instruktur: Ringkasan, Kursus Saya (editor), Siswa & Nilai |
| **Admin** (`admin`) | Mengelola pengguna dan seluruh konten | Area Admin: Pengguna & Peran, semua kursus |

Simulator dan Analisis Foto **bisa dipakai tanpa akun**. Hasilnya disimpan di browser; setelah masuk, hasil berikutnya tersimpan ke akun.

**Pilar pengalaman** yang harus terasa di setiap layar:

1. **Pahami** — materi singkat yang menjelaskan *mengapa*, bukan hanya *apa*.
2. **Coba** — setiap konsep bisa langsung dicoba di simulator, dengan umpan balik instan.
3. **Terapkan** — foto milik siswa sendiri dianalisis dan diberi saran setelan yang konkret.
4. **Ukur** — kuis, kriteria lulus latihan, dan progres kursus menunjukkan sejauh mana siswa paham.

---

## 2. Prinsip Desain

**1. Satu aksen, satu makna.**
Hijau (`#B7D894`) adalah satu-satunya warna aksen merek. Hijau berarti *aksi utama, posisi aktif, progres, dan exposure tepat*. Jangan gunakan hijau untuk dekorasi tanpa makna.

**2. Foto dikelilingi warna netral.**
Pratinjau simulator dan foto unggahan selalu berada di atas **bingkai abu-abu netral** (§4.4), bukan di atas Mint, Ink, atau latar hangat. Warna di sekitar foto memengaruhi cara mata menilai kecerahan dan warna (prinsip yang sama dipakai aplikasi penyunting foto dan panduan tampilan ISO 3664).

**3. Angka teknis selalu terbaca dan dijelaskan.**
f/5.6, 1/250, ISO 400, dan EV tampil dengan angka tabular, tanpa disingkat berlebihan, dan setiap angka penting punya penjelasan dalam bahasa sehari-hari ("Terlalu gelap sekitar 1⅓ stop").

**4. Selalu ada "langkah berikutnya".**
Setiap layar menjawab: *apa yang harus saya lakukan sekarang?* Contoh: "Lanjutkan materi", "Coba di simulator", "Kerjakan kuis", "Analisis foto lain".

**5. Umpan balik instan, perayaan secukupnya.**
Perubahan setelan kamera langsung terlihat di pratinjau. Pencapaian (latihan lulus, kuis lulus, kursus selesai) dirayakan sekali dengan toast atau banner, bukan animasi yang terus berjalan.

**6. Konsisten lebih penting daripada unik.**
Satu pola kartu, satu pola tombol, satu pola form, dipakai ulang di seluruh area.

---

## 3. Audit Singkat UI Saat Ini

Temuan dari kode saat ini (`app/globals.css`, `app/layout.js`, komponen di `components/`) yang perlu diselaraskan dengan kaidah ini:

| Temuan | Dampak | Keputusan baru |
|---|---|---|
| Seluruh aplikasi bertema gelap abu netral (`#262626`) dengan aksen amber (`#f2b544`) | Tidak sesuai gaya Ink & Sprout | Latar aplikasi terang (`#F6F8F3`) dengan aksen Sprout. Abu netral **hanya** dipakai sebagai bingkai foto (§4.4) |
| Status exposure memakai biru (kurang), hijau (tepat), merah-oranye (berlebih) | Biru/oranye tidak ada di palet; status hanya dibedakan warna | Pola meter exposure §4.5: warna semantik + panah + teks |
| Font Barlow / Barlow Semi Condensed | Berbeda dengan gaya acuan | Instrument Sans untuk seluruh UI (§5) |
| Navigasi hanya berupa tautan teks di header; belum ada area instruktur | Instruktur belum punya tempat kerja | Navbar untuk publik & siswa; sidebar Ink khusus Area Instruktur/Admin (§9) |
| Belum ada komponen Toast, Modal, Skeleton bersama | Umpan balik tidak seragam antar halaman | Komponen bersama di §8 |
| Fokus keyboard memakai outline amber 2px | Ikut berganti dengan aksen | Cincin fokus 3px Sprout + jarak 2px (§18) |

Migrasi dilakukan bertahap per halaman; jangan mencampur dua tema dalam satu halaman.

**Status migrasi (12 November 2026):** seluruh halaman yang ada (Beranda, Masuk, Daftar, Dasbor, Kursus, Detail Kursus, Materi, Kuis, Simulator, Analisis Foto, Profil, 404, halaman error) sudah memakai tema Ink & Sprout; tema gelap-amber dihapus. Area Instruktur & Admin (§15) belum dibuat.

---

## 4. Fondasi: Warna

### 4.1 Warna merek (inti)

| Token | Hex | Nama | Peran |
|---|---|---|---|
| `color.ink` | **#202734** | Ink | Teks utama, sidebar instruktur, kartu sorotan, tombol sekunder gelap |
| `color.slate` | **#36415A** | Slate | Teks sekunder kuat, permukaan gelap tingkat 2, hover pada Ink |
| `color.sprout` | **#B7D894** | Sprout | Aksen utama: tombol primer, item aktif, progres, fokus, exposure tepat |
| `color.mint` | **#E0F8C7** | Mint | Latar aksen lembut: badge, highlight, state terpilih, latar sukses |

### 4.2 Skala turunan

**Hijau (Sprout)** — untuk variasi state dan teks hijau yang terbaca di latar terang.

| Step | Hex | Penggunaan |
|---|---|---|
| 50 | #F3FCEB | Latar bagian sorotan, hover baris tabel |
| 100 | **#E0F8C7** | Mint — badge, chip terpilih, latar sukses |
| 200 | #CDEAAE | Border aksen, track progres di atas Mint |
| 300 | **#B7D894** | Sprout — warna merek |
| 400 | #9DC472 | Hover tombol primer |
| 500 | #7FA855 | Pressed tombol primer, ikon aksen di latar terang |
| 600 | #5E8A3A | Ikon & garis aksen di latar putih (non-teks) |
| 700 | #4A6E2C | **Teks/tautan hijau di latar terang** (kontras 5.9:1 di putih) |
| 800 | #375221 | Teks di atas Mint untuk penekanan |
| 900 | #243616 | Jarang; ilustrasi |

**Tinta (Ink/Slate)** — netral utama.

| Step | Hex | Penggunaan |
|---|---|---|
| 50 | #F4F6F9 | Latar input, latar area sekunder |
| 100 | #E6E9EF | Border lembut, divider, track progres |
| 200 | #C9CEDA | Border input, skeleton |
| 300 | #A0A8BA | Teks sekunder di latar gelap |
| 400 | #737D94 | Placeholder, ikon nonaktif (bukan untuk teks penting) |
| 500 | #556078 | **Teks sekunder di latar terang** (6.3:1) |
| 600 | #45506A | Teks label |
| 700 | **#36415A** | Slate |
| 800 | #2A3347 | Permukaan gelap tingkat 2 |
| 900 | **#202734** | Ink |
| 950 | #161B25 | Overlay modal (dengan transparansi 60%) |

**Latar aplikasi:** `#F6F8F3` (putih bersemu hijau, lebih hangat dari abu-abu biasa).
**Permukaan kartu:** `#FFFFFF`.

### 4.3 Warna semantik (status)

Warna status **tidak boleh** dipakai sebagai dekorasi.

| Status | Teks / ikon | Latar | Border | Contoh |
|---|---|---|---|---|
| Sukses | #4A6E2C | #E0F8C7 | #CDEAAE | "Lulus", "Selesai", "Latihan berhasil" |
| Peringatan | #8E6A12 | #FDF3DC | #F3DFA8 | "EXIF tidak ditemukan", "Shutter berisiko goyang" |
| Bahaya | #B3372F | #FDECEA | #F5C6C2 | Error form, file ditolak, highlight terpotong, hapus materi |
| Info | #45506A | #E6E9EF | #C9CEDA | "Hasil disimpan di browser ini", tips |

### 4.4 Zona foto netral (pengecualian khusus fotografi)

Area yang menampilkan gambar untuk **dinilai kecerahan/warnanya** memakai bingkai abu-abu netral, bukan warna merek.

| Token | Hex | Untuk |
|---|---|---|
| `photo.surround` | #262626 | Latar di sekeliling pratinjau simulator, foto unggahan, dan histogram |
| `photo.panel` | #303030 | Panel kecil yang menempel pada pratinjau (overlay angka setelan) |
| `photo.rule` | #444444 | Garis grid, garis bantu histogram |
| `photo.text` | #ECECEC | Teks di atas zona foto |

**Aturan:**
- Zona foto adalah satu kotak `radius-xl` dengan padding 16–24px; di luar kotak itu halaman tetap memakai tema terang.
- Jangan menaruh Sprout/Mint, gradien, atau bayangan berwarna di dalam zona foto. Satu-satunya aksen yang boleh: penanda meter exposure dan penanda clipping.
- Thumbnail foto di dasbor dan riwayat juga diberi border 1px Ink-100, tanpa latar berwarna.

### 4.5 Status exposure

Dipakai pada meter exposure, kartu hasil latihan, dan hasil analisis foto. Status **tidak boleh** dibedakan oleh warna saja.

| Status | Rentang | Warna | Ikon / teks wajib |
|---|---|---|---|
| Kurang (underexposed) | < −0,5 EV | Peringatan | Panah ke bawah + "Kurang 1⅓ stop" |
| Tepat | −0,5 sampai +0,5 EV | Sukses (penanda Sprout) | Centang + "Exposure tepat" |
| Berlebih (overexposed) | > +0,5 EV | Peringatan | Panah ke atas + "Berlebih ⅔ stop" |
| Terpotong (clipping) | Shadow/highlight terpotong | Bahaya | Pola arsir di histogram + "3% highlight terpotong" |

Ambang ±0,5 EV mengikuti kriteria latihan di `lib/exercises.js`. Jika ambang di kode berubah, tabel ini ikut diperbarui.

### 4.6 Aturan kombinasi (kontras)

| Kombinasi | Rasio | Boleh untuk |
|---|---|---|
| Ink di atas Putih | 15.0 : 1 | Semua teks |
| Slate di atas Putih | 10.2 : 1 | Semua teks |
| Ink di atas Sprout | 9.5 : 1 | **Teks tombol primer** |
| Ink di atas Mint | 13.2 : 1 | Teks badge / chip |
| Sprout di atas Ink | 9.5 : 1 | Teks/ikon aksen di kartu gelap, item aktif sidebar |
| Mint di atas Slate | 8.9 : 1 | Teks di permukaan gelap tingkat 2 |
| Hijau-700 di atas Putih | 5.9 : 1 | Tautan, persentase, nilai kuis |
| #ECECEC di atas #262626 | 13.4 : 1 | Teks di zona foto |
| **Sprout di atas Putih** | **1.6 : 1** | ❌ **Dilarang untuk teks.** Hanya isian bar progres, titik indikator, garis aksen |
| Putih di atas Sprout | 1.6 : 1 | ❌ **Dilarang.** Tombol hijau selalu memakai teks Ink |

### 4.7 Proporsi warna (60-30-10)

- **60%** — Latar `#F6F8F3` dan kartu putih.
- **30%** — Ink & Slate (teks, sidebar, kartu sorotan).
- **10%** — Sprout & Mint (aksi, progres, status aktif).

Zona foto tidak dihitung dalam proporsi ini. Jika satu layar terlihat "terlalu hijau", kurangi Mint lebih dulu, baru Sprout.

### 4.8 Mode gelap (opsional, disiapkan sejak awal)

| Peran | Mode terang | Mode gelap |
|---|---|---|
| Latar aplikasi | #F6F8F3 | #161B25 |
| Kartu | #FFFFFF | #202734 |
| Kartu tingkat 2 / input | #F4F6F9 | #2A3347 |
| Border | #E6E9EF | #36415A |
| Teks utama | #202734 | #F4F6F9 |
| Teks sekunder | #556078 | #A0A8BA |
| Aksen | #B7D894 | #B7D894 |
| Latar aksen lembut | #E0F8C7 | Sprout 12% di atas #202734 |
| Teks/tautan hijau | #4A6E2C | #B7D894 |
| Zona foto | #262626 | #262626 (tidak berubah) |

---

## 5. Fondasi: Tipografi

**Typeface:** Instrument Sans. Bentuknya modern dan cukup berkarakter untuk heading, tetap nyaman untuk teks materi yang panjang.
**Angka:** gunakan *tabular figures* (kelas `.tabular`) untuk aperture, shutter, ISO, EV, focal length, nilai kuis, persentase, dan tabel agar angka tidak "bergoyang" saat dial diputar.

### 5.1 Skala

| Token | Ukuran / tinggi baris | Bobot | Penggunaan |
|---|---|---|---|
| `display` | 48 / 56 | 700 | Hero beranda |
| `h1` | 32 / 40 | 700 | Judul halaman ("Halo, Dewi.", "Simulator kamera") |
| `h2` | 24 / 32 | 700 | Judul section ("Kursus yang kamu ikuti") |
| `h3` | 20 / 28 | 600 | Judul kartu, judul modal |
| `h4` | 16 / 24 | 600 | Sub-judul kartu, nama item list |
| `body-lg` | 16 / 26 | 400 | Teks materi, deskripsi kursus |
| `body` | 14 / 22 | 400 | Teks UI umum |
| `body-strong` | 14 / 22 | 600 | Label tombol, nilai di tabel |
| `caption` | 12 / 16 | 500 | Metadata (tanggal, jumlah materi, nama kamera) |
| `overline` | 12 / 16 | 600, kapital, tracking +0.06em | Label kecil di atas angka ("APERTURE", "NILAI") |
| `stat` | 28 / 32 | 700 | Angka utama kartu statistik dan nilai setelan pada dial |

### 5.2 Aturan

- **Tidak ada teks di bawah 12px**, termasuk label di dial dan histogram.
- Huruf kapital penuh **hanya** untuk `overline`. Judul kursus, materi, dan tombol memakai *sentence case*.
- Maksimal 3 ukuran huruf dalam satu kartu.
- Panjang baris teks materi 60–75 karakter (`max-width: 68ch`).
- Bobot 800–900 tidak dipakai; hierarki dibangun dari ukuran dan warna, bukan ketebalan saja.

### 5.3 Notasi setelan kamera

| Besaran | Format | Contoh |
|---|---|---|
| Aperture | `f/` + angka, titik desimal (konvensi kamera) | f/1.4, f/5.6, f/16 |
| Shutter speed | Pecahan untuk < 1 detik, tanda detik `″` untuk ≥ 1 detik | 1/4000, 1/60, 1″, 2″ |
| ISO | "ISO" + angka dengan titik ribuan | ISO 100, ISO 6.400 |
| Exposure value | Tanda minus asli (−), pecahan sepertiga | −1⅓ EV, +⅔ EV, 0 EV |
| Focal length | angka + "mm" | 85 mm, setara 35 mm: 120 mm |

---

## 6. Fondasi: Spacing, Grid, Radius, Elevasi

### 6.1 Spacing (basis 4px)

| Token | Nilai | Contoh |
|---|---|---|
| `space-1` | 4px | Jarak ikon–teks kecil |
| `space-2` | 8px | Jarak dalam chip, antar badge |
| `space-3` | 12px | Jarak label–input |
| `space-4` | 16px | Padding tombol horizontal, jarak antar item list |
| `space-5` | 20px | Padding kartu kecil |
| `space-6` | 24px | Padding kartu standar, gap grid kartu |
| `space-8` | 32px | Jarak antar section dalam halaman |
| `space-10` | 40px | Padding halaman desktop |
| `space-12` | 48px | Jarak antar blok besar |
| `space-16` | 64px | Jarak section di halaman publik |

### 6.2 Grid & lebar

| Konteks | Lebar maksimum | Kolom | Gutter |
|---|---|---|---|
| Halaman aplikasi (Kursus, Dasbor, Analisis) | 1200px | 12 | 24px |
| Simulator | 1200px; pratinjau 8 kolom, panel setelan 4 kolom | 12 | 24px |
| Halaman baca (Materi, Kuis) | 760px untuk isi; panel daftar materi di samping | 12 | 24px |
| Form tunggal (Masuk, Daftar) | 440px | 1 | — |
| Area Instruktur (dengan sidebar) | 1440px total; konten 1200px | 12 | 24px |

### 6.3 Radius (5 tingkat saja)

| Token | Nilai | Untuk |
|---|---|---|
| `radius-sm` | 8px | Chip kecil, badge, tooltip |
| `radius-md` | 12px | Tombol, input, item menu, tab pill |
| `radius-lg` | 16px | Kartu kecil (stat), dropdown, thumbnail foto |
| `radius-xl` | 24px | Kartu utama, modal, panel, zona foto |
| `radius-full` | 999px | Avatar, progress bar, toggle, pill status |

### 6.4 Elevasi

| Level | Bayangan | Untuk |
|---|---|---|
| 0 | Tidak ada, border `#E6E9EF` | Kartu default di latar `#F6F8F3` |
| 1 | 0 1px 2px rgba(32,39,52,.06) | Kartu interaktif saat diam |
| 2 | 0 8px 24px rgba(32,39,52,.08) | Kartu saat hover, dropdown, navbar saat scroll |
| 3 | 0 24px 48px rgba(32,39,52,.16) | Modal, toast |

Bayangan selalu berbasis Ink. Zona foto tidak diberi bayangan.

---

## 7. Fondasi: Ikon, Ilustrasi, Motion

### 7.1 Ikon

- Satu set ikon **garis** (stroke 1.75px, sudut membulat), ukuran 16 / 20 / 24px.
- Warna ikon mengikuti teks di sekitarnya; ikon aksen memakai Hijau-600 (latar terang) atau Sprout (latar gelap).
- Wadah ikon pada kartu statistik: kotak 44×44px, `radius-md`, latar Mint, ikon Hijau-800.

**Pemetaan menu:**

| Menu | Ikon |
|---|---|
| Beranda | rumah |
| Kursus | buku terbuka |
| Simulator kamera | kamera |
| Analisis foto | gambar + kaca pembesar |
| Dasbor | grid / layout |
| Area Instruktur — Ringkasan | papan / presentasi |
| Area Instruktur — Siswa & Nilai | dua orang |
| Pengguna & Peran (admin) | perisai |

**Ikon setelan:** aperture = diafragma (bilah lensa), shutter = stopwatch, ISO = bintik/grain, focal length = lensa, tripod = tripod.

### 7.2 Emoji

Emoji boleh dipakai **hanya** di konten emosional: sapaan ("Halo, Dewi 👋") dan perayaan ("Kuis lulus 🎉"). Tidak untuk navigasi, label, status, atau ikon fungsional.

### 7.3 Ilustrasi

- Gaya datar, dua warna (Ink + Sprout) dengan Mint sebagai latar bentuk. Motif: kamera, lensa, diafragma, bingkai foto.
- Dipakai pada empty state, hero beranda, dan layar sukses (kursus selesai).

### 7.4 Motion

| Token | Durasi | Easing | Untuk |
|---|---|---|---|
| `motion-fast` | 120ms | ease-out | Hover tombol, warna |
| `motion-base` | 200ms | ease-out | Dropdown, tab, toggle |
| `motion-slow` | 320ms | cubic-bezier(.2,.8,.2,1) | Modal, drawer, toast |
| `motion-progress` | 800ms | ease-out | Pengisian progress bar saat halaman dibuka |

- **Pratinjau simulator tidak memakai transisi.** Perubahan kecerahan, blur, dan noise tampil langsung saat dial diputar agar sebab-akibat terasa jelas.
- Animasi mobil di live view simulator adalah konten, bukan dekorasi; tetap sediakan tombol jeda.
- Hover kartu: naik 2px + elevasi 1 → 2. Tidak ada rotasi atau skala ikon.
- Perayaan (latihan lulus, kuis lulus) diputar **sekali** lalu berhenti.
- Hormati preferensi "kurangi gerakan": matikan semua transisi selain perubahan opasitas, dan jeda animasi mobil secara default.

---

## 8. Komponen

Setiap komponen di bawah mencantumkan anatomi, varian, state, dan aturan pakai.

### 8.1 Button

| Varian | Latar | Teks | Hover | Penggunaan |
|---|---|---|---|---|
| **Primary** | Sprout #B7D894 | Ink | Hijau-400 | Satu aksi utama per layar/kartu: "Lanjutkan materi", "Kirim jawaban", "Analisis foto" |
| **Dark** | Ink #202734 | Putih | Slate | Aksi kuat sekunder: "Coba di simulator", "Terbitkan kursus" |
| **Secondary** | Putih, border Ink-200 | Ink | Ink-50 | "Ulangi kuis", "Pratinjau materi" |
| **Ghost** | Transparan | Ink-600 | Ink-50 | Aksi tersier di toolbar, "Batal" di modal |
| **Link** | — | Hijau-700, garis bawah saat hover | — | "Lihat semua kursus →", "Mengapa saran ini muncul?" |
| **Danger** | #B3372F | Putih | lebih gelap 8% | "Hapus materi", "Hapus kuis", "Cabut peran instruktur" |

**Ukuran:** S 32px (teks 13px) · M 40px (14px) · L 48px (16px). Padding horizontal 16 / 20 / 24px. Radius `radius-md`.

**State wajib:** default, hover, pressed (turun 1px), focus (cincin 3px Sprout + jarak 2px), disabled (opasitas 40%, kursor dilarang), loading (spinner + teks "Menyimpan…", lebar tombol tidak berubah).

**Aturan:**
- Maksimal **satu** tombol Primary dalam satu area pandang.
- Di modal, urutan: tombol utama di kanan (desktop) / atas (mobile).
- Tombol lebar penuh hanya di form tunggal dan modal mobile.

### 8.2 Input & Form

**Anatomi:** label (body-strong, Ink-600) → input → teks bantuan / error (caption).

| State | Tampilan |
|---|---|
| Default | Latar Ink-50, border 1px Ink-200, tinggi 44px, `radius-md` |
| Hover | Border Ink-300 |
| Focus | Latar putih, border Hijau-600, cincin 3px Mint |
| Error | Border #B3372F, teks error merah di bawah + ikon |
| Disabled / terkunci | Latar Ink-50, teks Ink-400, ikon gembok + alasan |
| Sukses (opsional) | Ikon centang Hijau-600 di kanan |

**Jenis input khusus:**
- **Password** — tombol tampil/sembunyikan; indikator kekuatan (bar 4 segmen: merah → kuning → hijau).
- **Unggah foto** (Analisis Foto) — dropzone border putus-putus Ink-200, ikon gambar, teks "Tarik foto ke sini atau pilih file", caption format "JPG, PNG, WEBP, HEIC, atau TIFF, maks. 25 MB". Saat file di-drag: border Hijau-600, latar Mint. Setelah dipilih: thumbnail di zona foto, nama file, ukuran, tombol "Ganti foto".
- **Setelan manual** (jika EXIF kosong) — tiga select berdampingan: aperture, shutter, ISO, memakai nilai yang sama dengan dial simulator; caption "Isi sesuai setelan kamera saat memotret".
- **Editor Markdown** (Area Instruktur) — dua panel: tulis | pratinjau, toolbar sesuai subset yang didukung (judul, daftar, kutipan, kode, tebal, miring, tautan).
- **Select / Dropdown** — sama seperti input, chevron di kanan, daftar opsi dengan elevasi 2.

**Aturan form:**
- Label selalu terlihat (tidak hanya placeholder).
- Validasi saat field kehilangan fokus, bukan saat mengetik.
- Pesan error menjelaskan cara memperbaiki: "Ukuran foto maks. 25 MB. Pilih foto lain atau kecilkan resolusinya." — bukan "File tidak valid".

### 8.3 Card

| Varian | Tampilan | Contoh |
|---|---|---|
| **Base** | Putih, border Ink-100, `radius-xl`, padding 24px | Kartu kuis terakhir, form editor |
| **Interactive** | Base + elevasi 1; hover: naik 2px, elevasi 2, border Hijau-200 | Kartu kursus di katalog, kartu latihan simulator |
| **Highlight (Ink)** | Latar Ink, teks putih/Mint, aksen Sprout | Hero detail kursus, ajakan "Coba simulator" di beranda |
| **Soft (Mint)** | Latar Mint, border Hijau-200 | Tips di materi, banner "Kuis lulus" |
| **Stat** | Base kecil (`radius-lg`, padding 20px): ikon dalam wadah Mint + overline + angka `stat` | Materi selesai, Rata-rata nilai kuis, Latihan lulus |
| **Foto** | Zona foto netral (§4.4) di atas, isi putih di bawah | Riwayat analisis foto, hasil latihan |

**Anatomi kartu standar:** header (ikon + judul + aksi tautan di kanan) → isi → footer opsional dipisah divider.

### 8.4 Progress

- **Bar linear** — track Ink-100, isian Sprout, tinggi 8px (kompak) atau 12px (kartu kursus), `radius-full`. Persentase di kanan atas dengan Hijau-700. Saat 100%: isian Hijau-500 + ikon centang.
- **Ring** — untuk progres kursus di halaman detail dan nilai kuis. Ketebalan 8px, track Ink-100, isian Sprout, angka di tengah.
- **Stepper** — untuk daftar materi dalam modul: titik 12px; selesai = Sprout berisi centang, sedang dibuka = cincin Sprout, belum = Ink-200.

Tanpa gradien, tanpa efek berdenyut di dalam bar.

### 8.5 Badge, Chip, Tag

| Jenis | Tampilan | Contoh |
|---|---|---|
| Status | Pill, latar + teks semantik (§4.3) | Selesai, Lulus, Belum lulus, Draf, Terbit |
| Level kursus | Pill Ink-50, teks Ink-600 | Pemula, Menengah, Mahir |
| Jenis konten | Pill Ink-50, teks Ink-600, ikon | Materi, Kuis, Latihan simulator |
| Peran | Pill Ink, teks Sprout | Instruktur, Admin |
| Aturan sistem pakar | Pill semantik | Terpicu (Peringatan), Tidak terpicu (Info), Dilewati (Ink-50) |

### 8.6 Tabs

- **Underline tabs** — untuk berpindah konten dalam satu halaman (Analisis: Saran · Histogram · Data EXIF · Mengapa saran ini muncul; Editor: Isi · Kuis · Pengaturan). Aktif: teks Ink + garis bawah 2px Sprout; tidak aktif: Ink-500.
- **Segmented control** — untuk filter singkat (Katalog: Semua · Pemula · Menengah · Mahir; Kondisi cahaya di simulator). Wadah Ink-50, item aktif putih dengan elevasi 1.

### 8.7 Navigasi pendukung

- **Breadcrumb** — caption Ink-500, pemisah "›", item terakhir Ink tanpa tautan. Wajib di halaman tingkat 2+ (Detail Kursus, Materi, Kuis, halaman editor).
- **Tautan kembali** — "← Kembali ke kursus" dipakai di mobile; di desktop cukup breadcrumb.
- **Navigasi materi** — di bawah isi materi: "← Sebelumnya" (Ghost) dan "Tandai selesai & lanjut →" (Primary).
- **Pagination** — tombol angka 36×36px `radius-md`; aktif = latar Ink, teks putih.

### 8.8 List & Table

- **List item** — tinggi minimum 56px, ikon/thumbnail kiri, judul + metadata tengah, nilai/aksi kanan. Hover latar Hijau-50.
- **Riwayat percobaan kuis** — tanggal, nilai tabular, pill Lulus/Belum lulus; percobaan terbaik ditandai "Terbaik".
- **Data table (instruktur/admin)** — header overline Ink-500 di latar Ink-50, baris 56px, tanpa zebra (cukup divider), kolom angka rata kanan tabular, kolom aksi ikon dengan tooltip.

### 8.9 Avatar

Ukuran 24 / 32 / 40 / 64px. Tanpa foto: inisial dua huruf, latar Mint, teks Hijau-800.

### 8.10 Modal, Drawer, Dropdown

- **Modal** — lebar 440px (konfirmasi) / 560px (form), `radius-xl`, padding 32px, overlay Ink-950 60% + blur ringan. Judul h3, deskripsi body Ink-500, aksi di bawah. Tutup lewat tombol ×, Esc, atau klik overlay (kecuali modal destruktif yang sedang memproses).
- **Modal konfirmasi destruktif** — ikon peringatan dalam lingkaran merah lembut, judul berupa pertanyaan ("Hapus modul ini beserta 4 materinya?"), tombol Danger + Ghost "Batal".
- **Drawer** — untuk menu mobile, panel setelan simulator di mobile, dan daftar materi di mobile.
- **Dropdown akun** — dari avatar di navbar: nama + email (caption), Dasbor, Area Instruktur (bila berperan), divider, Keluar (teks merah).

### 8.11 Toast & Banner

- **Toast** — kanan atas (desktop) / atas tengah (mobile), lebar 360px, latar Ink, teks putih, ikon status berwarna (Sprout untuk sukses), hilang setelah 4 detik, bisa ditutup. Contoh: "Materi ditandai selesai", "Latihan lulus 🎉", "Perubahan disimpan".
- **Banner inline** — di dalam halaman, latar semantik lembut, untuk informasi yang harus tetap terlihat. Contoh: "Kamu belum masuk. Hasil latihan disimpan di browser ini saja." (Info) atau "Foto ini tidak memiliki data EXIF." (Peringatan).

### 8.12 Skeleton

Blok Ink-100 dengan kilau halus, bentuk **sama persis** dengan konten akhir (kartu, baris list, thumbnail), radius mengikuti komponen aslinya. Di zona foto, skeleton memakai `photo.panel`.

### 8.13 Empty State

Ilustrasi kecil (maks. 120px) → judul h4 → satu kalimat penjelas → satu tombol aksi. Wadah: border putus-putus Ink-200, `radius-xl`, latar putih.

### 8.14 Komponen khusus fotografi

| Komponen | Anatomi |
|---|---|
| **Setting Dial** | Overline nama setelan ("APERTURE") + nilai `stat` tabular di atas; slider berskala takik di bawah; ibu jari slider Sprout, takik `photo.rule`. Bisa diatur dengan panah keyboard per 1/3 stop. Nilai ekstrem diberi caption ("f/1.4 — ruang tajam paling tipis") |
| **Exposure Meter** | Skala −3 … +3 EV dengan takik 1/3 stop, penanda posisi, dan label status §4.5 di bawahnya. Angka EV tabular di kanan |
| **Viewfinder / Pratinjau** | Zona foto 3:2, overlay setelan di pojok bawah (`photo.panel`), tombol jeda animasi, tombol layar penuh |
| **Kartu Latihan** | Judul latihan, deskripsi tujuan, daftar kriteria dengan centang/silang per kriteria ("Mobil tampak beku (motion blur ≤ 3 px)"), status Lulus/Belum lulus, tombol "Coba lagi" |
| **Histogram** | Di zona foto; luminans + opsional RGB; area shadow/highlight terpotong diarsir dengan warna Bahaya + persentase di caption |
| **Tabel EXIF** | Dua kolom (nama · nilai), dikelompokkan: Setelan (aperture, shutter, ISO, focal length) · Perangkat (kamera, lensa) · Lainnya (flash, white balance, mode exposure, metering, kompensasi). Nilai kosong ditulis "Tidak tercatat" (Ink-400), bukan dikosongkan |
| **Kartu Saran** | Ikon aturan, kalimat saran, setelan sekarang → setelan disarankan ("1/30 → 1/100, ISO 200 → 640") dalam pill tabular, tombol "Coba di simulator" yang membuka simulator dengan setelan tersebut |
| **Tabel Jejak Aturan** | "Mengapa saran ini muncul": nama aturan, kondisi, pill status (Terpicu/Tidak terpicu/Dilewati), alasan dilewati ("Data shutter tidak tersedia") |
| **Pertanyaan Kuis** | Nomor "Pertanyaan 2 dari 5", teks soal `body-lg`, opsi sebagai radio card penuh (tinggi ≥ 56px). Terpilih: border Sprout + latar Hijau-50 |
| **Hasil Kuis** | Ring nilai, ambang lulus ("Lulus minimal 70"), pill Lulus/Belum lulus, ringkasan benar/salah per soal, tombol "Ulangi kuis" (Secondary) dan "Lanjut ke materi berikutnya" (Primary) |

---

## 9. App Shell

### 9.1 Navbar (tinggi 64px, menempel di atas)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Akademi Kamera   Kursus  Simulator kamera  Analisis foto  Dasbor   (Avatar ▾) │
└────────────────────────────────────────────────────────────────────────────┘
```

- Latar putih, border bawah Ink-100; elevasi 2 saat halaman di-scroll.
- **Logo:** kotak 36px `radius-md` latar Ink dengan ikon diafragma Sprout + wordmark Ink.
- **Tautan:** body-strong Ink-500; aktif = teks Ink + garis bawah 2px Sprout + `aria-current="page"`.
- **Dasbor** hanya tampil setelah masuk. **Area Instruktur** tampil di dropdown akun untuk peran instruktur/admin.
- **Belum masuk:** tombol Ghost "Masuk" + Primary "Daftar".

### 9.2 Sidebar (khusus Area Instruktur & Admin, lebar 264px)

```
┌──────────────────────┐
│  MENGAJAR            │  ← overline Ink-300
│  ▣ Ringkasan         │  ← aktif: latar Slate, teks putih, ikon & garis kiri Sprout
│  ▢ Kursus saya       │
│  ▢ Siswa & nilai     │
│                      │
│  ADMIN               │  ← hanya untuk peran admin
│  ▢ Pengguna & peran  │
│ ──────────────────── │
│  ← Kembali ke situs  │
└──────────────────────┘
```

- Panel Ink setinggi layar. Item menu: tinggi 44px, `radius-md`, teks body-strong Ink-300; hover latar Slate 50%.
- Item aktif: latar Slate, teks putih, ikon Sprout, garis kiri 3px Sprout.
- **Tablet (768–1023px):** diciutkan menjadi 72px, hanya ikon dengan tooltip.
- **Mobile (<768px):** sidebar menjadi drawer dari tombol menu.

### 9.3 Navigasi mobile (publik & siswa)

Bottom navigation 4 item: Kursus · Simulator · Analisis · Dasbor (atau "Masuk" bila belum masuk). Navbar atas tinggal logo + avatar.

### 9.4 Kerangka halaman

```
┌ Navbar ───────────────────────────────────────────────┐
│ Breadcrumb (opsional)                                  │
│ Page Header: Judul h1 + deskripsi + aksi kanan         │
│ ────────────────────────────────────────────────────── │
│ Konten (grid 12 kolom, gap 24px)                       │
└────────────────────────────────────────────────────────┘
```

- Padding konten: 40px desktop, 24px tablet, 16px mobile.
- Jarak antar section: 32–48px.
- Footer hanya di halaman publik: nama proyek, keterangan tugas akhir (S1 Sistem Informasi, UPN "Veteran" Jakarta), tautan privasi.

---

## 10. Struktur Dasbor Siswa

**Tujuan:** dalam 5 detik siswa tahu (1) progres kursusnya, (2) apa yang harus dilanjutkan, (3) hasil latihan dan analisis terakhir.

### 10.1 Tata letak (desktop)

```
┌──────────────────────────────────────────────────────────────────────┐
│ A. Sapaan                                                            │
│ Halo, Dewi. 👋                                                        │
│ Terakhir kamu membuka "Shutter speed dan gerak".                      │
│ [Lanjutkan materi →] (Primary)                                        │
├──────────────────────────────────────────────────────────────────────┤
│ B. Ringkasan (3 Stat Card)                                            │
│ [Materi selesai 7/10] [Rata-rata nilai kuis 85] [Latihan lulus 3/5]   │
├──────────────────────────────────────────────────────────────────────┤
│ C. Kursus yang kamu ikuti                         Lihat katalog →    │
│ ┌ Dasar Segitiga Exposure · Pemula ─────────────────── ▓▓▓▓▓░ 70% ┐ │
│ │ Materi berikutnya: "Shutter speed dan gerak"       [Lanjutkan]   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────┬──────────────────────────────────┤
│ D. Kuis terakhir                  │ E. Latihan simulator terakhir     │
│ Kuis aperture   90  Lulus         │ Bekukan mobil yang melaju  ✓ Lulus│
│ Kuis ISO        60  Belum lulus   │ Blur latar pada potret     ✗      │
├───────────────────────────────────┴──────────────────────────────────┤
│ F. Analisis foto terakhir (Kartu Foto: thumbnail + setelan + 1 saran) │
└──────────────────────────────────────────────────────────────────────┘
```

### 10.2 Spesifikasi blok

| Blok | Isi | Aturan |
|---|---|---|
| **A. Sapaan** | h1 dengan nama, kalimat konteks, tombol **"Lanjutkan materi"** ke materi terakhir yang belum selesai | Satu-satunya Primary di dasbor. Belum ikut kursus → ganti dengan "Cari kursus" |
| **B. Ringkasan** | 3 Stat Card | Di mobile menjadi 1 baris geser horizontal atau 1 kolom |
| **C. Kursus** | Semua kursus yang diikuti: judul, level, bar progres, materi berikutnya | Kursus 100% turun ke bawah dengan pill "Selesai". Kosong → empty state "Kamu belum mengikuti kursus" + "Jelajahi kursus" |
| **D. Kuis terakhir** | Maks. 5 percobaan terakhir: nama kuis, nilai, status | Klik baris → halaman kuis |
| **E. Latihan simulator** | Maks. 5 percobaan terakhir: nama latihan, status, tautan "Coba lagi" | Kosong → "Belum ada latihan" + "Buka simulator" |
| **F. Analisis foto** | Kartu Foto terbaru: thumbnail (jika masih tersedia di browser), setelan, saran utama | Foto tidak disimpan di server; jika thumbnail tidak ada, tampilkan ikon gambar + setelan saja |

### 10.3 Urutan di mobile

A → C → B → D → E → F.

---

## 11. Halaman Belajar

### 11.1 Katalog Kursus (`/kursus`)

- Header: "Kursus" + deskripsi + pencarian & segmented control level (Semua · Pemula · Menengah · Mahir).
- Grid kartu 3 kolom (Interactive): ilustrasi/sampul 16:9, pill level, judul h4, nama instruktur, jumlah modul & materi, deskripsi 2 baris.
- Kursus yang sudah diikuti: pill "Diikuti" + bar progres menggantikan tombol "Lihat kursus".
- Hanya kursus berstatus terbit yang tampil untuk siswa dan pengunjung.

### 11.2 Detail Kursus (`/kursus/[courseId]`)

```
┌ Hero (kartu Ink) ─────────────────────────────────────────────┐
│ Pemula · 3 modul · 10 materi                                   │
│ Dasar Segitiga Exposure (h1, putih)                             │
│ Deskripsi singkat (Ink-300) · Instruktur                        │
│ [Mulai kursus] / [Lanjutkan materi] (Primary)                    │
├──────────────────────────────────────┬────────────────────────┤
│ Daftar isi (accordion per modul)     │ Progres kursus (ring)   │
│  Modul 1  Cahaya dan exposure         │ 7 dari 10 materi        │
│   ✓ Apa itu exposure                  │ Kuis lulus 2 dari 3     │
│   ● Aperture         [Latihan]        │                         │
│   ○ Kuis aperture    [Kuis]           │                         │
└──────────────────────────────────────┴────────────────────────┘
```

- Materi yang terhubung latihan simulator diberi pill "Latihan simulator"; materi yang punya kuis diberi pill "Kuis".
- Panel kanan menempel saat scroll (desktop); di mobile pindah ke atas daftar isi sebagai bar ringkas.

### 11.3 Halaman Materi (`/kursus/[courseId]/lesson/[lessonId]`)

```
┌ Breadcrumb: Kursus › Dasar Segitiga Exposure › Aperture ───────┐
├──────────────────────────────────────────┬─────────────────────┤
│ Judul materi (h1) · Modul 1              │ Daftar materi modul │
│ Isi Markdown (body-lg, maks. 68ch)        │  ✓ Apa itu exposure │
│                                           │  ● Aperture         │
│ ┌ Kartu Highlight: Coba di simulator ───┐ │  ○ Kuis aperture    │
│ │ Latihan: Blur latar pada potret        │ │                     │
│ │ [Buka latihan] (Dark)                  │ │                     │
│ └────────────────────────────────────────┘ │                     │
│ [← Sebelumnya]   [Tandai selesai & lanjut →] (Primary)          │
└──────────────────────────────────────────┴─────────────────────┘
```

- Kartu "Coba di simulator" muncul hanya jika materi punya `simulator_exercise_id`; tombolnya membuka `/simulator?latihan=...`.
- Jika materi punya kuis, tombol Primary di bawah menjadi "Kerjakan kuis".
- Menandai selesai → toast "Materi ditandai selesai", titik di daftar materi menjadi centang, lalu pindah ke materi berikutnya.
- Belum masuk → tombol Primary diganti "Masuk untuk menyimpan progres".

### 11.4 Kuis (`/kursus/[courseId]/kuis/[quizId]`)

- Header: judul kuis, jumlah soal, ambang lulus ("Lulus minimal 70").
- Satu soal per layar di mobile; di desktop boleh semua soal dalam satu halaman dengan nomor yang jelas.
- Tombol "Kirim jawaban" nonaktif sampai semua soal terjawab; caption "3 dari 5 soal terjawab".
- Setelah kirim → komponen Hasil Kuis (§8.14) + riwayat percobaan di bawahnya.
- Lulus → banner Soft "Kuis lulus 🎉" sekali. Belum lulus → banner Info yang menautkan kembali ke materi terkait, bukan bahasa yang menyalahkan.

---

## 12. Simulator Kamera

**Tujuan:** siswa melihat langsung akibat setiap setelan pada exposure, blur, dan noise.

### 12.1 Tata letak (desktop)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Simulator kamera (h1)          Kondisi cahaya: [Terik|Berawan|Senja|Malam] │
├────────────────────────────────────────────┬─────────────────────────┤
│ ┌ Zona foto ────────────────────────────┐  │ APERTURE      f/5.6     │
│ │                                        │  │ ├┼┼┼┼┼●┼┼┼┼┼┤          │
│ │        Pratinjau (3:2)                 │  │ SHUTTER       1/250     │
│ │                                        │  │ ├┼┼┼┼┼┼┼●┼┼┼┤          │
│ │ f/5.6 · 1/250 · ISO 200 · 50 mm   ⏸ ⛶ │  │ ISO           ISO 200   │
│ └────────────────────────────────────────┘  │ FOCAL LENGTH  50 mm     │
│ Exposure Meter  −3 ··· ● ··· +3   0 EV ✓    │ [ ] Tripod              │
│ Petunjuk: shutter tepat untuk f/5.6 ISO 200 │                         │
│ adalah 1/250.                               │                         │
├────────────────────────────────────────────┴─────────────────────────┤
│ Latihan terpandu: 5 Kartu Latihan (Interactive), latihan aktif ditandai │
└──────────────────────────────────────────────────────────────────────┘
```

### 12.2 Aturan

- Pratinjau dan meter adalah satu kesatuan; meter selalu terlihat tanpa scroll di desktop.
- Dial memakai nilai standar kamera (sepertiga stop) dan dapat digeser dengan keyboard.
- **Latihan aktif** (dari `?latihan=` atau dipilih dari daftar): kartu latihan menempel di atas panel setelan, kriteria dicentang secara langsung saat setelan berubah, tombol Primary "Ambil foto" mengunci hasil dan mencatat percobaan.
- Latihan lulus → toast "Latihan lulus 🎉" + tautan "Kembali ke materi" bila datang dari materi.
- Tanpa akun → banner Info sekali per sesi: "Hasil latihan disimpan di browser ini. Masuk untuk menyimpannya ke akunmu."

### 12.3 Mobile

Pratinjau di atas (lebar penuh), meter tepat di bawahnya, setelan dalam tab ringkas (Aperture · Shutter · ISO · Lainnya) di bawah meter, sehingga pratinjau dan dial yang sedang diubah terlihat bersamaan.

---

## 13. Analisis Foto

**Tujuan:** siswa memahami mengapa fotonya terlalu gelap, terang, atau kabur, dan setelan apa yang sebaiknya dicoba.

### 13.1 Alur layar

1. **Unggah** — dropzone (§8.2) + catatan privasi: "Foto diproses di browsermu dan tidak dikirim ke server. Data lokasi GPS tidak dibaca."
2. **Memproses** — progres singkat "Membaca EXIF… · Mengukur piksel…".
3. **Hasil**:

```
┌──────────────────────────────────────────────────────────────────────┐
│ ┌ Zona foto ─────────────────────┐  Ringkasan                         │
│ │  Foto (fit, tidak dipotong)     │  f/1.8 · 1/30 · ISO 200 · 85 mm    │
│ │                                 │  Canon EOS R6 · RF 85mm F2         │
│ └─────────────────────────────────┘  Status: Kurang ⅔ stop ↓          │
│                                      Ketajaman: Perlu dicek            │
├──────────────────────────────────────────────────────────────────────┤
│ Tabs: Saran · Histogram · Data EXIF · Mengapa saran ini muncul       │
│ (Saran) Kartu Saran #1, #2, …                                         │
└──────────────────────────────────────────────────────────────────────┘
```

### 13.2 Aturan

- Saran diurutkan dari dampak terbesar. Saran yang bergantung pada maksud fotografer ditulis bersyarat ("Jika ini foto potret, latar bisa lebih kabur dengan f/2").
- Skor ketajaman dan warna dominan diberi label "perkiraan".
- **EXIF tidak ada** → banner Peringatan "Foto ini tidak memiliki data EXIF (biasanya dari WhatsApp atau screenshot). Saran berbasis histogram tetap ditampilkan." + form setelan manual.
- **EXIF sebagian** → aturan yang datanya kurang tampil "Dilewati" di tabel jejak, dengan alasan.
- **Foto ponsel** → caption "Aperture ponsel umumnya tetap, jadi saran aperture tidak ditampilkan."
- **Format tidak bisa ditampilkan** (mis. HEIC di Chrome) → zona foto menampilkan ikon + "Pratinjau tidak tersedia di browser ini"; data EXIF tetap ditampilkan.
- Tombol Primary di akhir: "Analisis foto lain". Kartu Saran memberi aksi sekunder "Coba di simulator".

---

## 14. Halaman Publik & Autentikasi

### 14.1 Beranda (`/`)
- **Tanpa navbar aplikasi.** Landing page berdiri sendiri (route group di `app/page.js`, di luar `app/(app)/`): hanya menjual produk. Urutan: hero → angka singkat → mengapa Akademi Kamera → fitur unggulan → FAQ → CTA → footer. Akses Masuk/Daftar lewat hero, CTA penutup, dan footer.
- Hero: judul `display` ("Pahami exposure dengan memotret, bukan menghafal"), subjudul, CTA Primary "Coba simulator" + Secondary "Lihat kursus", ilustrasi kamera/diafragma di kanan.
- Tiga kartu fitur sesuai pilar: Kursus · Simulator kamera · Analisis foto, masing-masing dengan tautan.
- Bagian "Cara kerja": Pahami → Coba → Terapkan → Ukur (stepper horizontal).
- CTA penutup di kartu Ink: "Daftar gratis untuk menyimpan progresmu".

### 14.2 Autentikasi (`/masuk`, `/daftar`)
- Layout dua kolom (desktop): kiri panel Ink dengan ilustrasi + satu kalimat manfaat; kanan form 440px. Mobile: form saja dengan logo di atas.
- **Masuk:** email, password (tampil/sembunyi), tombol Primary "Masuk", tautan "Belum punya akun? Daftar".
- **Daftar:** nama, email, password + indikator kekuatan, tombol Primary "Buat akun", tautan "Sudah punya akun? Masuk". Akun baru otomatis berperan siswa.
- Supabase belum dikonfigurasi → kartu Info berisi petunjuk konfigurasi (bukan form yang rusak), dengan tautan ke Simulator dan Analisis yang tetap bisa dipakai.
- Lupa password dan masuk dengan Google **belum ada**; tambahkan pola ini hanya bila fiturnya dibuat.

---

## 15. Area Instruktur & Admin

Area ini adalah **prioritas pengembangan berikutnya** di README (dasbor instruktur dan editor kursus). Halaman ini memakai sidebar Ink (§9.2).

| Menu | Isi utama |
|---|---|
| **Ringkasan** | 4 Stat Card (Siswa terdaftar, Kursus terbit, Materi diselesaikan minggu ini, Rata-rata nilai kuis) + daftar aktivitas siswa terbaru |
| **Kursus saya** | Tabel kursus: Judul · Level · Status (Draf/Terbit) · Siswa · Diperbarui · Aksi. Tombol Primary "Buat kursus" |
| **Editor kursus** | Pohon konten kiri: Kursus → Modul → Materi (+ Kuis). Panel kanan: form item terpilih. Urutan bisa diubah dengan seret atau tombol naik/turun |
| **Editor materi** | Judul, editor Markdown dengan pratinjau, select "Latihan simulator terkait" (opsional, dari daftar latihan) |
| **Editor kuis** | Judul, ambang lulus (0–100), daftar soal; tiap soal punya opsi dengan satu/lebih penanda benar |
| **Siswa & nilai** | Filter kursus; tabel Siswa · Progres materi · Nilai kuis terbaik · Latihan lulus · Aktivitas terakhir. Klik baris → drawer detail siswa (riwayat kuis dan latihan) |
| **Pengguna & peran** (admin) | Pencarian; tabel Nama · Email · Peran · Bergabung; ubah peran lewat select + modal konfirmasi |

**Aturan:**
- Kepadatan lebih tinggi: padding kartu 20px, baris tabel 52px.
- Kursus baru selalu berstatus **Draf**. "Terbitkan" (Dark) memakai modal konfirmasi yang menyebut jumlah modul & materi.
- Tombol simpan nonaktif sampai ada perubahan; pindah item dengan perubahan belum disimpan → modal "Buang perubahan?".
- Menghapus modul/materi/kuis selalu lewat modal konfirmasi destruktif yang menyebut isi yang ikut terhapus.
- Grafik memakai Sprout (seri utama), Slate (seri pembanding), Ink-200 (grid).
- Penilaian kuis dan kunci jawaban **tidak boleh** dikirim ke browser siswa (lihat roadmap); UI siswa hanya menerima hasil dari server.

---

## 16. Alur End-to-End

### 16.1 Peta besar perjalanan siswa

```
Pengunjung ─▶ Beranda ─▶ Coba Simulator / Analisis (tanpa akun)
                 │
                 ▼
            Katalog Kursus ─▶ Detail Kursus ─▶ Daftar akun ─▶ Mulai kursus
                                                                 │
       ┌──────────────────── Dasbor (pusat) ◀────────────────────┤
       │                                                         │
       ▼                                                         │
  Materi ─▶ Coba di simulator (latihan) ─▶ Kembali ke materi ────┤
       │                                                         │
       ▼                                                         │
  Kuis ─▶ Lulus? ── tidak ─▶ ulang materi terkait ───────────────┤
       │ ya                                                      │
       ▼                                                         │
  Materi berikutnya … ─▶ Kursus selesai ─▶ Analisis foto sendiri ─┘
```

### 16.2 Mulai belajar

1. Katalog → Detail Kursus → **Mulai kursus** (belum masuk → ke `/masuk`, lalu kembali ke detail kursus).
2. Hero berubah menjadi "Lanjutkan materi" → materi pertama.
3. Baca materi → (bila ada) **Coba di simulator** → latihan lulus → kembali ke materi.
4. **Tandai selesai & lanjut** → toast, daftar materi tercentang, bar progres bergerak.
5. Materi berkuis → **Kerjakan kuis** → hasil → lanjut atau ulangi.
6. Semua materi selesai → layar "Kursus selesai" (ilustrasi + ringkasan nilai) + ajakan "Analisis foto milikmu".

### 16.3 Latihan simulator

Buka latihan → baca tujuan & kriteria → atur dial sambil melihat kriteria tercentang → **Ambil foto** → hasil lulus/belum per kriteria → coba lagi atau kembali ke materi. Percobaan tercatat (akun atau browser).

### 16.4 Analisis foto

Unggah → proses → lihat status exposure → baca saran → (opsional) buka tab "Mengapa saran ini muncul" → **Coba di simulator** dengan setelan saran → "Analisis foto lain". Metrik (bukan file foto) tersimpan bila sudah masuk.

### 16.5 Instruktur

Masuk → Area Instruktur › Ringkasan → Kursus saya → **Buat kursus** (Draf) → tambah modul → tambah materi (Markdown, tautkan latihan) → tambah kuis → pratinjau sebagai siswa → **Terbitkan** → pantau di Siswa & nilai.

### 16.6 Admin

Masuk → Pengguna & peran → cari pengguna → ubah peran menjadi Instruktur → konfirmasi → toast "Peran diperbarui".

---

## 17. State: Loading, Kosong, Error, Sukses

| State | Pola | Contoh teks |
|---|---|---|
| **Loading awal** | Skeleton berbentuk konten | — |
| **Loading aksi** | Tombol loading, form tidak bisa dikirim ganda | "Menyimpan…", "Mengirim jawaban…" |
| **Loading lama** (> 3 detik) | Progres + penjelasan | "Membaca EXIF…", "Mengukur piksel foto…" |
| **Kosong — pertama kali** | Ilustrasi + ajakan | "Kamu belum mengikuti kursus." [Jelajahi kursus] |
| **Kosong — hasil filter** | Teks + reset | "Tidak ada kursus untuk level ini." [Tampilkan semua] |
| **Data tidak lengkap** | Banner Peringatan + jalan keluar | "Foto ini tidak memiliki data EXIF. Isi setelan secara manual untuk saran yang lebih lengkap." |
| **Belum dikonfigurasi** | Kartu Info + petunjuk | "Fitur akun belum aktif. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY." |
| **Belum masuk** | Banner Info, fitur tetap jalan | "Hasil disimpan di browser ini saja." [Masuk] |
| **Error memuat** | Kartu error + coba lagi | "Kursus gagal dimuat. Periksa koneksi lalu coba lagi." [Coba lagi] |
| **Error form** | Inline per field + ringkasan di atas form bila > 2 error | "Email atau password tidak sesuai." |
| **Sukses** | Toast; untuk pencapaian besar gunakan banner/layar perayaan | "Materi ditandai selesai." |

Halaman yang memuat data **tidak boleh** kosong polos ketika gagal; selalu tampilkan state error dengan tombol "Coba lagi".

---

## 18. Aksesibilitas

- Kontras teks minimum 4.5:1 (teks besar 3:1). Ikuti tabel §4.6; **jangan** menaruh teks di atas Sprout selain Ink.
- Fokus keyboard selalu terlihat: cincin 3px Sprout + jarak 2px (di latar gelap dan zona foto cincin Mint).
- Target sentuh minimum 44×44px, termasuk ibu jari dial.
- **Dial** memakai elemen `input type="range"` dengan `aria-valuetext` berisi nilai terbaca ("f/5.6", "1/250 detik").
- **Meter exposure** punya teks status yang dibacakan (`aria-live="polite"`), misalnya "Kurang satu sepertiga stop".
- **Pratinjau & histogram** punya ringkasan teks ("Highlight terpotong 3%, shadow terpotong 0%").
- Status tidak boleh hanya dibedakan warna: tambahkan ikon/teks (✓ Lulus, ↓ Kurang, Dilewati).
- Progress bar memiliki label teks ("7 dari 10 materi").
- Modal mengunci fokus di dalamnya dan mengembalikan fokus ke pemicu saat ditutup.
- Animasi mobil di simulator bisa dijeda dan dijeda otomatis jika "kurangi gerakan" aktif.

---

## 19. Bahasa & Microcopy

**Nada:** ramah, menyemangati, ringkas; menyapa dengan "kamu". Menjelaskan sebab, bukan menyalahkan ("Foto ini terlalu gelap karena…", bukan "Foto kamu salah").

| Aturan | ✅ Lakukan | ❌ Hindari |
|---|---|---|
| Bahasa utama Indonesia | "Kursus yang kamu ikuti", "Analisis foto" | "My Courses", "Photo Analyzer" |
| Istilah fotografi baku tetap dipakai | aperture, shutter speed, ISO, exposure, focal length, EXIF, histogram, bokeh | Terjemahan yang tidak lazim: "bukaan rana", "kecepatan penutup" |
| Istilah teknis dijelaskan sekali | "Aperture (bukaan lensa)" pada kemunculan pertama di materi | Mengandaikan siswa sudah tahu |
| Tombol = kata kerja + objek | "Kerjakan kuis", "Analisis foto", "Coba di simulator" | "OK", "Submit", "Klik di sini" |
| Error menjelaskan solusi | "Ukuran foto maks. 25 MB. Pilih foto lain atau kecilkan resolusinya." | "Upload gagal." |
| Konsisten satu istilah | Kursus › Modul › Materi; Kuis; Latihan (simulator) | Bergantian Lesson/Pelajaran/Unit |
| Angka format Indonesia | "12 Mei 2026", "85,5", "ISO 6.400" | "May 12", "85.5" |
| Kecuali notasi kamera | "f/5.6" (titik, sesuai yang tertulis di kamera) | "f/5,6" |
| Sentence case | "Latihan simulator terakhir" | "LATIHAN SIMULATOR TERAKHIR" |

**Glosarium:**
Kursus (program belajar lengkap) · Modul (kelompok materi) · Materi (unit belajar terkecil) · Kuis (soal pilihan ganda dengan ambang lulus) · Latihan (tantangan di simulator dengan kriteria lulus) · Analisis (pemeriksaan foto unggahan) · Exposure (banyaknya cahaya yang direkam) · EV (satuan perubahan exposure; 1 EV = 1 stop) · Stop (kelipatan dua atau setengah jumlah cahaya) · Clipping / terpotong (detail hilang karena terlalu gelap atau terang).

---

## 20. Responsif

| Breakpoint | Lebar | Shell | Grid |
|---|---|---|---|
| Mobile | < 768px | Navbar ringkas + bottom navigation (siswa) / drawer (instruktur) | 4 kolom, padding 16px |
| Tablet | 768–1023px | Navbar penuh; sidebar instruktur ikon 72px | 8 kolom, padding 24px |
| Desktop | 1024–1439px | Navbar penuh; sidebar instruktur 264px | 12 kolom, padding 32px |
| Wide | ≥ 1440px | Konten maks. 1200px di tengah | 12 kolom, padding 40px |

**Aturan adaptasi:**
- Grid kartu 3 kolom → 2 (tablet) → 1 (mobile); Stat Card → 1 kolom atau geser horizontal di mobile.
- Panel kanan yang menempel (daftar materi, progres kursus) pindah ke atas/bawah konten atau menjadi tombol yang membuka drawer.
- Simulator mobile mengikuti §12.3; analisis foto mobile: foto → ringkasan → tab.
- Tabel instruktur di mobile berubah menjadi kartu per baris.
- Modal di mobile menjadi *bottom sheet* setinggi isi, tombol lebar penuh.

---

## 21. Checklist Review Desain

Gunakan sebelum layar baru dianggap selesai.

**Visual**
- [ ] Hanya Sprout/Mint sebagai aksen; tidak ada amber/biru/oranye sisa tema lama
- [ ] Tidak ada teks di atas Sprout selain Ink; tidak ada teks Sprout di latar putih
- [ ] Foto, pratinjau, dan histogram berada di zona foto netral (§4.4)
- [ ] Radius memakai 5 token; bayangan berbasis Ink
- [ ] Tidak ada teks < 12px; kapital penuh hanya untuk overline
- [ ] Ikon dari satu set garis; emoji hanya untuk konten emosional

**Struktur**
- [ ] Ada judul halaman dan (bila tingkat 2+) breadcrumb
- [ ] Hanya satu tombol Primary per area pandang
- [ ] Langkah berikutnya untuk pengguna terlihat jelas

**Konten fotografi**
- [ ] Notasi setelan mengikuti §5.3 dan memakai angka tabular
- [ ] Status exposure memakai ikon + teks, bukan warna saja (§4.5)
- [ ] Saran yang bergantung maksud fotografer ditulis bersyarat

**State**
- [ ] Skeleton, kosong, error (dengan coba lagi), dan sukses sudah didesain
- [ ] Varian belum masuk dan Supabase belum dikonfigurasi sudah dipertimbangkan
- [ ] Tombol memiliki state hover, focus, disabled, loading

**Aksesibilitas & konten**
- [ ] Kontras lolos §4.6, target sentuh ≥ 44px, fokus terlihat
- [ ] Dial dan meter bisa dipakai dengan keyboard dan pembaca layar
- [ ] Teks mengikuti §19 (bahasa, format angka, nada)

**Responsif**
- [ ] Diuji di 375px, 768px, 1280px, 1440px
