# Learnify — Kaidah Desain UI/UX

**Versi:** 1.0 · **Tema:** Ink & Sprout (aksen hijau)
**Cakupan:** fondasi visual, komponen, struktur halaman (Dashboard, Profil, Pengaturan, dan seluruh area produk), serta alur pengguna end-to-end.

Dokumen ini disusun dari hasil membaca seluruh halaman dan komponen pada project *virtual-internship* (produk bernama **Learnify**). Semua elemen yang sudah ada dipertahankan strukturnya, lalu dirapikan dan diselaraskan dengan palet warna baru.

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
9. [App Shell (Navbar, Sidebar, Kerangka Halaman)](#9-app-shell)
10. [Struktur Dashboard](#10-struktur-dashboard)
11. [Struktur Profil](#11-struktur-profil)
12. [Struktur Pengaturan (Settings)](#12-struktur-pengaturan-settings)
13. [Halaman Produk Lainnya](#13-halaman-produk-lainnya)
14. [Area Admin](#14-area-admin)
15. [Alur End-to-End](#15-alur-end-to-end)
16. [State: Loading, Kosong, Error, Sukses](#16-state-loading-kosong-error-sukses)
17. [Aksesibilitas](#17-aksesibilitas)
18. [Bahasa & Microcopy](#18-bahasa--microcopy)
19. [Responsif](#19-responsif)
20. [Checklist Review Desain](#20-checklist-review-desain)

---

## 1. Ringkasan Produk & Peran Pengguna

Learnify adalah platform *virtual internship* / bootcamp yang menggabungkan pembelajaran terstruktur, mentoring langsung, gamifikasi, dan persiapan karier.

| Peran | Tujuan utama | Area yang dipakai |
|---|---|---|
| **Pengunjung** | Mengenal program dan mendaftar | Beranda, Tentang, Katalog Bootcamp, Kebijakan Privasi, Masuk/Daftar |
| **Peserta (Learner)** | Belajar, menjaga konsistensi, siap kerja | Dashboard, Kursus Saya, Materi, Misi & Lencana, Leaderboard, Level, Streak, Mentoring, Career Center, Profil, Pengaturan |
| **Admin** | Mengelola konten dan peserta | Dashboard Admin: Ringkasan, Pengguna, Kursus, Sesi, Misi |

**Pilar pengalaman** yang harus terasa di setiap layar:

1. **Belajar** — bootcamp, kurikulum per hari, materi video, catatan, transkrip, playground, tugas.
2. **Konsistensi** — target mingguan, daily streak, misi harian/mingguan/spesial.
3. **Kompetisi sehat** — XP, level/evolusi, leaderboard, lencana.
4. **Karier** — CV Analyzer, Bot Interview, Final Project, rekomendasi pekerjaan, Talent License.
5. **Bimbingan** — jadwal mentoring dan live mentoring.

---

## 2. Prinsip Desain

**1. Satu aksen, satu makna.**
Hijau (`#B7D894`) adalah satu-satunya warna aksen merek. Hijau berarti *aksi utama, posisi aktif, dan progres*. Jangan gunakan hijau untuk dekorasi tanpa makna.

**2. Tenang di dasar, hidup di progres.**
Permukaan memakai netral hangat dan biru-tinta. Energi visual dipusatkan pada progress bar, XP, streak, dan pencapaian, karena di situlah motivasi pengguna tumbuh.

**3. Selalu ada "langkah berikutnya".**
Setiap layar menjawab: *apa yang harus saya lakukan sekarang?* Contoh: "Lanjutkan materi", "Ikut sesi", "Perbaiki CV".

**4. Rayakan, tapi jangan berisik.**
Gamifikasi muncul pada momen yang tepat (selesai materi, naik level, target tercapai), bukan sebagai animasi yang terus berjalan.

**5. Konsisten lebih penting daripada unik.**
Satu pola kartu, satu pola tombol, satu pola form, dipakai ulang di seluruh area.

---

## 3. Audit Singkat UI Saat Ini

Temuan dari project yang perlu diluruskan oleh kaidah ini:

| Temuan | Dampak | Keputusan baru |
|---|---|---|
| Aksen bercampur: biru, indigo, ungu, oranye, amber, hijau dipakai bergantian per fitur | Identitas lemah, makna warna tidak jelas | Satu aksen hijau + netral tinta; warna status hanya untuk status |
| Gradien ungu-biru animatif dan kartu Career Center gradien oranye | Bertabrakan dengan palet baru | Diganti kartu **Ink** (`#202734`) dengan aksen hijau |
| 10+ variasi radius (dari 8px sampai 56px) | Tampilan kurang rapi | Skala radius 5 tingkat (lihat §6) |
| Teks 9–11px sangat sering dipakai, banyak huruf kapital + tracking lebar | Sulit dibaca, terutama di mobile | Minimum 12px; label kapital hanya untuk *overline* |
| Ketebalan huruf hampir selalu paling tebal (black) | Hierarki datar karena semua "berteriak" | Skala bobot 400/500/600/700 dengan peran jelas |
| Ikon campuran emoji dan ikon garis | Gaya tidak seragam | Ikon garis 1 set; emoji hanya untuk konten perayaan |
| Pengaturan tersebar: sebagian di "Edit Profil" (tab Dasar & Keamanan), sebagian di komponen terpisah (email, 2FA, sesi perangkat) | Pengguna sulit menemukan pengaturan | Halaman **Pengaturan** tersendiri dengan navigasi kiri (lihat §12) |
| Notifikasi berupa dialog bawaan peramban ("Berhasil!") | Mengganggu, tidak sesuai merek | Komponen **Toast** |
| Label "UI/UX Designer" di profil tertulis tetap | Informasi tidak akurat | Ambil dari jalur bootcamp yang diikuti |
| Bahasa campur (Indonesia/Inggris) tanpa pola: "Daily Streak", "Top Players", "Evolution Path" | Nada tidak konsisten | Bahasa Indonesia sebagai utama; istilah Inggris hanya untuk nama fitur resmi (lihat §18) |

---

## 4. Fondasi: Warna

### 4.1 Warna merek (inti)

| Token | Hex | Nama | Peran |
|---|---|---|---|
| `color.ink` | **#202734** | Ink | Teks utama, sidebar, kartu sorotan, tombol sekunder gelap |
| `color.slate` | **#36415A** | Slate | Teks sekunder kuat, permukaan gelap tingkat 2, hover pada Ink |
| `color.sprout` | **#B7D894** | Sprout | Aksen utama: tombol primer, item aktif, progres, fokus |
| `color.mint` | **#E0F8C7** | Mint | Latar aksen lembut: badge, highlight, state terpilih, latar sukses |

### 4.2 Skala turunan

**Hijau (Sprout)** — untuk variasi state dan teks hijau yang terbaca di latar terang.

| Step | Hex | Penggunaan |
|---|---|---|
| 50 | #F3FCEB | Latar halaman bagian sorotan, hover baris tabel |
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
| Sukses | #4A6E2C | #E0F8C7 | #CDEAAE | "Goal Tercapai", "Unlocked", "Selesai" |
| Peringatan | #8E6A12 | #FDF3DC | #F3DFA8 | "Sesi dimulai 10 menit lagi", streak hampir putus |
| Bahaya | #B3372F | #FDECEA | #F5C6C2 | Error form, "Matikan 2FA", logout semua sesi, banned |
| Info | #45506A | #E6E9EF | #C9CEDA | "Email dikelola oleh Google", tips |
| Live | #FFFFFF di #B3372F | — | — | Label **LIVE** pada sesi yang sedang berlangsung |

### 4.4 Pengecualian gamifikasi

Hanya untuk peringkat 1–3 di Leaderboard dan lencana langka:

| Medali | Latar | Teks/ikon |
|---|---|---|
| Emas | #FBF1D3 | #8E6A12 |
| Perak | #E6E9EF | #45506A |
| Perunggu | #F6E4D6 | #8A4E24 |

Streak tidak lagi oranye. Ikon api memakai **Sprout di atas Ink** (kartu gelap) atau **Hijau-700 di atas Mint** (kartu terang), sehingga streak terasa sebagai bagian dari identitas merek.

### 4.5 Aturan kombinasi (kontras)

| Kombinasi | Rasio | Boleh untuk |
|---|---|---|
| Ink di atas Putih | 15.0 : 1 | Semua teks |
| Slate di atas Putih | 10.2 : 1 | Semua teks |
| Ink di atas Sprout | 9.5 : 1 | **Teks tombol primer** |
| Ink di atas Mint | 13.2 : 1 | Teks badge / chip |
| Sprout di atas Ink | 9.5 : 1 | Teks/ikon aksen di kartu gelap, item aktif sidebar |
| Mint di atas Slate | 8.9 : 1 | Teks di permukaan gelap tingkat 2 |
| Hijau-700 di atas Putih | 5.9 : 1 | Tautan, angka XP, persentase |
| **Sprout di atas Putih** | **1.6 : 1** | ❌ **Dilarang untuk teks.** Hanya isian bar progres, titik indikator, garis aksen |
| Putih di atas Sprout | 1.6 : 1 | ❌ **Dilarang.** Tombol hijau selalu memakai teks Ink |

### 4.6 Proporsi warna (60-30-10)

- **60%** — Latar `#F6F8F3` dan kartu putih.
- **30%** — Ink & Slate (teks, sidebar, kartu sorotan).
- **10%** — Sprout & Mint (aksi, progres, status aktif).

Jika satu layar terlihat "terlalu hijau", kurangi Mint lebih dulu, baru Sprout.

### 4.7 Mode gelap (opsional, disiapkan sejak awal)

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

---

## 5. Fondasi: Tipografi

**Typeface:** Instrument Sans (sudah dipakai). Bentuknya modern dan cukup karakter untuk heading, tetap nyaman untuk teks panjang.
**Angka:** gunakan *tabular figures* untuk XP, peringkat, skor CV, timer, dan tabel agar angka tidak "bergoyang" saat berubah.

### 5.1 Skala

| Token | Ukuran / tinggi baris | Bobot | Penggunaan |
|---|---|---|---|
| `display` | 48 / 56 | 700 | Hero beranda, angka streak besar |
| `h1` | 32 / 40 | 700 | Judul halaman ("Halo, Dewi!", "Peringkat Global") |
| `h2` | 24 / 32 | 700 | Judul section ("Sesi Mentoring Mendatang") |
| `h3` | 20 / 28 | 600 | Judul kartu, judul modal |
| `h4` | 16 / 24 | 600 | Sub-judul kartu, nama item list |
| `body-lg` | 16 / 26 | 400 | Teks paragraf, deskripsi materi |
| `body` | 14 / 22 | 400 | Teks UI umum |
| `body-strong` | 14 / 22 | 600 | Label tombol, nilai di tabel |
| `caption` | 12 / 16 | 500 | Metadata (tanggal, durasi, "Reset tiap Senin") |
| `overline` | 12 / 16 | 600, kapital, tracking +0.06em | Label kecil di atas angka statistik ("TOTAL XP") |
| `stat` | 28 / 32 | 700 | Angka utama kartu statistik |

### 5.2 Aturan

- **Tidak ada teks di bawah 12px.** Ganti semua label 9–11px menjadi `caption` atau `overline`.
- Huruf kapital penuh **hanya** untuk `overline` dan label status singkat (LIVE). Judul sesi, nama misi, dan tombol memakai *sentence case*.
- Maksimal 3 ukuran huruf dalam satu kartu.
- Panjang baris teks bacaan 60–75 karakter (deskripsi materi, catatan, kebijakan privasi).
- Bobot 800–900 tidak dipakai; hierarki dibangun dari ukuran dan warna, bukan ketebalan saja.

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
| Area aplikasi (dengan sidebar) | 1440px total; konten 1200px | 12 | 24px |
| Halaman baca (Profil, Pengaturan, Detail Sesi) | 960px | 12 | 24px |
| Form tunggal (Masuk, Daftar, Lupa Password) | 440px | 1 | — |
| Halaman publik | 1200px | 12 | 32px |

### 6.3 Radius (5 tingkat saja)

| Token | Nilai | Untuk |
|---|---|---|
| `radius-sm` | 8px | Chip kecil, badge, tooltip |
| `radius-md` | 12px | Tombol, input, item menu, tab pill |
| `radius-lg` | 16px | Kartu kecil (stat, badge card), dropdown |
| `radius-xl` | 24px | Kartu utama, modal, panel |
| `radius-full` | 999px | Avatar, progress bar, toggle, pill status |

Variasi 32px, 40px, 48px, dan 56px yang ada sekarang dirampingkan ke `radius-xl`.

### 6.4 Elevasi

| Level | Bayangan | Untuk |
|---|---|---|
| 0 | Tidak ada, border `#E6E9EF` | Kartu default di latar `#F6F8F3` |
| 1 | 0 1px 2px rgba(32,39,52,.06) | Kartu interaktif saat diam |
| 2 | 0 8px 24px rgba(32,39,52,.08) | Kartu saat hover, dropdown, navbar saat scroll |
| 3 | 0 24px 48px rgba(32,39,52,.16) | Modal, toast |

Bayangan berwarna (biru/oranye) yang ada sekarang dihapus. Bayangan selalu berbasis Ink.

---

## 7. Fondasi: Ikon, Ilustrasi, Motion

### 7.1 Ikon

- Satu set ikon **garis** (stroke 1.75px, sudut membulat), ukuran 16 / 20 / 24px.
- Warna ikon mengikuti teks di sekitarnya; ikon aksen memakai Hijau-600 (latar terang) atau Sprout (latar gelap).
- Wadah ikon pada kartu statistik: kotak 44×44px, `radius-md`, latar Mint, ikon Hijau-800.

**Pemetaan menu (pengganti emoji di sidebar):**

| Menu | Ikon |
|---|---|
| Dashboard | grid / layout |
| Kursus Saya | buku terbuka |
| Misi & Lencana | target |
| Career Center | koper |
| Leaderboard | piala |
| Mentoring | video / dua orang |
| Profil | pengguna |
| Pengaturan | roda gigi |

### 7.2 Emoji

Emoji boleh dipakai **hanya** di konten emosional: sapaan ("Halo, Dewi 👋"), perayaan ("Goal tercapai 🎉"), dan reaksi chat live. Tidak untuk navigasi, label, atau ikon fungsional.

### 7.3 Ilustrasi

- Gaya datar, dua warna (Ink + Sprout) dengan Mint sebagai latar bentuk.
- Dipakai pada empty state, onboarding, dan halaman sukses.

### 7.4 Motion

| Token | Durasi | Easing | Untuk |
|---|---|---|---|
| `motion-fast` | 120ms | ease-out | Hover tombol, warna |
| `motion-base` | 200ms | ease-out | Dropdown, tab, toggle |
| `motion-slow` | 320ms | cubic-bezier(.2,.8,.2,1) | Modal, drawer, toast |
| `motion-progress` | 800ms | ease-out | Pengisian progress bar saat halaman dibuka |

- Hover kartu: naik 2px + elevasi 1 → 2. Tidak ada rotasi atau skala ikon.
- Animasi berulang (memantul, berdenyut) **hanya** untuk indikator LIVE dan skeleton.
- Perayaan (konfeti kecil, naik level) diputar **sekali** lalu berhenti.
- Hormati preferensi "kurangi gerakan": matikan semua transisi selain perubahan opasitas.

---

## 8. Komponen

Setiap komponen di bawah mencantumkan anatomi, varian, state, dan aturan pakai.

### 8.1 Button

| Varian | Latar | Teks | Hover | Penggunaan |
|---|---|---|---|---|
| **Primary** | Sprout #B7D894 | Ink | Hijau-400 | Satu aksi utama per layar/kartu: "Simpan Target", "Daftar Bootcamp", "Lanjutkan Materi" |
| **Dark** | Ink #202734 | Putih | Slate | Aksi kuat sekunder: "Lihat Sesi", "Ubah Password", "Log Out Sesi Lain" |
| **Secondary** | Putih, border Ink-200 | Ink | Ink-50 | "Sertifikat Saya", "Batal" berbentuk tombol |
| **Ghost** | Transparan | Ink-600 | Ink-50 | Aksi tersier di toolbar, "Batal" di modal |
| **Link** | — | Hijau-700, garis bawah saat hover | — | "Semua Jadwal →", "Lihat Semua Bootcamp" |
| **Danger** | #B3372F | Putih | lebih gelap 8% | "Matikan 2FA", "Ban Pengguna", "Hapus Misi" |

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
| Disabled / terkunci | Latar Ink-50, teks Ink-400, ikon gembok + alasan ("Email dikelola oleh Google") |
| Sukses (opsional) | Ikon centang Hijau-600 di kanan |

**Jenis input khusus:**
- **Password** — tombol tampil/sembunyikan; indikator kekuatan (bar 4 segmen: merah → kuning → hijau).
- **Kode OTP / 2FA** — 6 kotak terpisah 48×56px, angka tabular, auto-pindah ke kotak berikutnya, bisa tempel kode.
- **Angka dengan unit** (target mingguan) — stepper −/+ di kiri-kanan, sufiks "materi" di dalam field.
- **Upload file** (CV, Final Project, tugas) — dropzone border putus-putus Ink-200, ikon dokumen, teks "Tarik file ke sini atau pilih file", aturan format di caption ("PDF atau DOCX, maks. 2 MB"). Saat file di-drag: border Hijau-600, latar Mint. Setelah dipilih: baris file dengan nama, ukuran, progres unggah, tombol hapus.
- **Upload foto profil** — avatar bulat dengan tombol kamera kecil di pojok kanan bawah; pratinjau sebelum simpan.
- **Select / Dropdown** — sama seperti input, chevron di kanan, daftar opsi dengan elevasi 2.

**Aturan form:**
- Label selalu terlihat (tidak hanya placeholder).
- Validasi saat field kehilangan fokus, bukan saat mengetik.
- Pesan error menjelaskan cara memperbaiki: "Password minimal 8 karakter" — bukan "Input tidak valid".

### 8.3 Card

| Varian | Tampilan | Contoh |
|---|---|---|
| **Base** | Putih, border Ink-100, `radius-xl`, padding 24px | Kartu Aktivitas Belajar, form Pengaturan |
| **Interactive** | Base + elevasi 1; hover: naik 2px, elevasi 2, border Hijau-200 | Kartu Streak, Level, kartu Bootcamp |
| **Highlight (Ink)** | Latar Ink, teks putih/Mint, aksen Sprout, dekorasi lingkaran Slate samar | Career Center di Dashboard, Talent License, hero detail Bootcamp |
| **Soft (Mint)** | Latar Mint, border Hijau-200 | Tips misi, info sertifikat, banner "Goal tercapai" |
| **Stat** | Base kecil (`radius-lg`, padding 20px): ikon dalam wadah Mint + overline + angka `stat` | Total XP, Level, Day Streak |

**Anatomi kartu standar:** header (ikon + judul + aksi tautan di kanan) → isi → footer opsional dipisah divider.

### 8.4 Progress

- **Bar linear** — track Ink-100, isian Sprout, tinggi 8px (kompak) atau 12px (kartu target), `radius-full`. Persentase di kanan atas dengan Hijau-700. Saat 100%: isian Hijau-500 + ikon centang.
- **Ring / lingkaran** — untuk skor CV (/100), progres hari ini di materi, evolusi level. Ketebalan 8px, track Ink-100, isian Sprout, angka di tengah.
- **Stepper** — untuk kurikulum per hari dan roadmap level: titik 12px; selesai = Sprout berisi centang, aktif = cincin Sprout, terkunci = Ink-200 + gembok.

Tanpa gradien, tanpa efek berdenyut di dalam bar.

### 8.5 Badge, Chip, Tag

| Jenis | Tampilan | Contoh |
|---|---|---|
| Status | Pill, latar + teks semantik (§4.3) | Selesai, Aktif, Terjadwal, Banned |
| XP | Pill Mint, teks Hijau-800, ikon bintang | "+200 XP", "1.250 XP" |
| Level/Rank | Pill Ink, teks Sprout | "Level 3 · Explorer" |
| Kategori | Pill Ink-50, teks Ink-600 | Misi Harian, Video, Quiz, PDF |
| LIVE | Pill merah, titik putih berdenyut | Sesi sedang berlangsung |
| Wajib | Teks caption Hijau-700 dengan titik | "• Wajib" pada materi harian |

### 8.6 Tabs

- **Underline tabs** — untuk berpindah konten dalam satu halaman (Materi: Ringkasan · Catatan · Transkrip · Playground · Tugas; Misi: Harian · Mingguan · Spesial). Aktif: teks Ink + garis bawah 2px Sprout; tidak aktif: Ink-500.
- **Segmented control** — untuk filter singkat (Leaderboard: Mingguan · Bulanan · Sepanjang Masa). Wadah Ink-50, item aktif putih dengan elevasi 1.

### 8.7 Navigasi pendukung

- **Breadcrumb** — caption Ink-500, pemisah "›", item terakhir Ink tanpa tautan. Wajib di halaman tingkat 2+ (Detail Sesi, Materi, CV Analyzer, Bot Interview, Final Project).
- **Tautan kembali** — "← Kembali ke Dashboard" dipakai di mobile; di desktop cukup breadcrumb.
- **Pagination** — tombol angka 36×36px `radius-md`; aktif = latar Ink, teks putih.

### 8.8 List & Table

- **List item** — tinggi minimum 56px, avatar/ikon kiri, judul + metadata tengah, nilai/aksi kanan. Hover latar Hijau-50.
- **Leaderboard row** — peringkat (wadah 40×40px; 1–3 memakai warna medali), avatar, nama + rank, XP rata kanan tabular. Baris pengguna sendiri: latar Mint, border kiri 3px Sprout, label "Kamu", dan dipin di bawah daftar jika di luar layar.
- **Data table (admin)** — header overline Ink-500 di latar Ink-50, baris 56px, zebra tidak dipakai (cukup divider), kolom aksi ikon dengan tooltip, checkbox untuk aksi massal.

### 8.9 Avatar

Ukuran 24 / 32 / 40 / 64 / 112px. Tanpa foto: inisial dua huruf, latar Mint, teks Hijau-800. Status online: titik 10px Hijau-500 dengan border putih 2px.

### 8.10 Modal, Drawer, Dropdown

- **Modal** — lebar 440px (konfirmasi) / 560px (form), `radius-xl`, padding 32px, overlay Ink-950 60% + blur ringan. Judul h3, deskripsi body Ink-500, aksi di bawah. Tutup lewat tombol ×, Esc, atau klik overlay (kecuali modal destruktif yang sedang memproses).
- **Modal konfirmasi destruktif** — ikon peringatan dalam lingkaran merah lembut, judul berupa pertanyaan ("Keluar dari semua perangkat lain?"), tombol Danger + Ghost "Batal". Untuk aksi keamanan, minta verifikasi sesuai jenis akun: password, kode 2FA, atau konfirmasi akun Google.
- **Drawer** — untuk menu mobile dan panel chat live di mobile; masuk dari kanan/bawah.
- **Dropdown akun** — dari avatar di navbar: blok email (caption), lalu Profil Saya, Pengaturan, divider, Keluar (teks merah).

### 8.11 Toast & Banner

- **Toast** — muncul kanan atas (desktop) / atas tengah (mobile), lebar 360px, latar Ink, teks putih, ikon status berwarna (Sprout untuk sukses), hilang setelah 4 detik, bisa ditutup. Contoh: "Profil berhasil diperbarui", "Kamu mendapat +10 XP ✨".
- **Banner inline** — di dalam halaman, latar semantik lembut, untuk informasi yang harus tetap terlihat (mis. "Akun ini terhubung dengan Google, email tidak bisa diubah").

### 8.12 Skeleton

Blok Ink-100 dengan kilau halus, bentuk **sama persis** dengan konten akhir (kartu, baris list, avatar), radius mengikuti komponen aslinya.

### 8.13 Empty State

Ilustrasi kecil (maks. 120px) → judul h4 → satu kalimat penjelas → satu tombol aksi. Wadah: border putus-putus Ink-200, `radius-xl`, latar putih.

### 8.14 Komponen khusus gamifikasi

| Komponen | Anatomi |
|---|---|
| **XP Pill (navbar)** | Ikon bintang Sprout + angka XP, latar Ink, teks putih. Klik → halaman Level |
| **Streak Counter** | Ikon api + angka besar `display` + label "hari beruntun"; kalender 7 hari (lingkaran: aktif = Sprout, terlewat = Ink-100, hari ini = cincin Sprout) |
| **Level/Evolution Card** | Ilustrasi karakter level, nama level, bar menuju level berikutnya ("30 / 150 XP"), tombol "Lihat Roadmap" |
| **Badge Card** | Ikon dalam wadah 48px, judul, deskripsi syarat, status. Terkunci: ikon abu + bar progres + persentase; terbuka: wadah Mint + pill "Terbuka" |
| **Mission Card** | Ikon kategori, nama misi, deskripsi, bar progres (mis. 3/5), reward XP di kanan, status. Selesai: centang + latar Hijau-50 |
| **Level Up Modal** | Ilustrasi level baru, "Kamu naik ke Level 4!", daftar hadiah yang terbuka, tombol Primary "Lanjut Belajar" |

---

## 9. App Shell

### 9.1 Navbar (tinggi 64px, menempel di atas)

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Logo] Learnify      [ 🔍 Cari bootcamp, materi…       ]   ★ 1.250 XP  🔔  (Avatar ▾) │
└────────────────────────────────────────────────────────────────────────┘
```

- Latar putih, border bawah Ink-100; elevasi 2 saat halaman di-scroll.
- **Logo:** kotak 36px `radius-md` latar Ink dengan huruf "L" Sprout + wordmark Ink.
- **Pencarian global** (desktop ≥1024px): lebar 360px, input Ink-50. Di mobile menjadi ikon.
- **XP pill, notifikasi, avatar** di kanan. Notifikasi dengan titik merah bila ada yang belum dibaca.
- **Belum masuk:** tombol Ghost "Masuk" + Primary "Daftar".

### 9.2 Sidebar (desktop, lebar 264px)

Sidebar berubah dari kartu putih mengambang menjadi **panel Ink** setinggi layar, sehingga hijau terlihat paling kuat di navigasi.

```
┌──────────────────────┐
│  BELAJAR             │  ← overline Ink-300
│  ▣ Dashboard         │  ← aktif: latar Slate, teks putih, ikon & garis kiri Sprout
│  ▢ Kursus Saya       │
│  ▢ Mentoring         │
│                      │
│  PROGRES             │
│  ▢ Misi & Lencana    │
│  ▢ Leaderboard       │
│                      │
│  KARIER              │
│  ▢ Career Center     │
│                      │
│ ──────────────────── │
│ ┌──────────────────┐ │
│ │ 🔥 7 hari        │ │  ← mini kartu streak (Slate) + bar target mingguan
│ │ ▓▓▓▓▓░░ 3/5      │ │
│ └──────────────────┘ │
│  ▢ Profil            │
│  ▢ Pengaturan        │
└──────────────────────┘
```

- Item menu: tinggi 44px, `radius-md`, teks body-strong Ink-300; hover latar Slate 50%.
- Item aktif: latar Slate, teks putih, ikon Sprout, garis kiri 3px Sprout.
- Menu dikelompokkan (Belajar · Progres · Karier) agar 8 item tidak terasa panjang.
- **Tablet (768–1023px):** sidebar diciutkan menjadi 72px, hanya ikon dengan tooltip.
- **Mobile (<768px):** sidebar diganti **bottom navigation** 5 item: Beranda, Kursus, Misi, Karier, Profil. Leaderboard dan Mentoring bisa diakses dari Dashboard dan menu "Lainnya".

### 9.3 Kerangka halaman

```
┌ Navbar ───────────────────────────────────────────────┐
├ Sidebar ┬ Breadcrumb (opsional)                       │
│         │ Page Header: Judul h1 + deskripsi + aksi kanan│
│         │ ───────────────────────────────────────────── │
│         │ Konten (grid 12 kolom, gap 24px)              │
│         │                                               │
└─────────┴───────────────────────────────────────────────┘
```

- Padding konten: 40px desktop, 24px tablet, 16px mobile.
- Jarak antar section: 32–48px.
- Footer hanya muncul di halaman publik.

---

## 10. Struktur Dashboard

**Tujuan:** dalam 5 detik pengguna tahu (1) progres minggu ini, (2) apa yang harus dilanjutkan, (3) jadwal terdekat.

### 10.1 Tata letak (desktop)

```
┌──────────────────────────────────────────────────────────────────────┐
│ A. Greeting                                   B. Target Mingguan      │
│ Halo, Dewi! 👋                                ┌──────────────────────┐ │
│ Senang melihatmu kembali…                     │ Target Mingguan  ✎   │ │
│ [Lanjutkan: Day 3 – Auto Layout →] (Primary)  │ 3 / 5 materi  ▓▓▓░░  │ │
│                                               │ Reset tiap Senin 60% │ │
│                                               └──────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ C. Ringkasan (3 kartu)                                                │
│ ┌ Aktivitas Belajar ─────┐ ┌ Daily Streak ──┐ ┌ Level Belajar ──────┐ │
│ │ 2 bootcamp aktif       │ │ 🔥 7 hari      │ │ Explorer · Lv 3      │ │
│ │ UI/UX Design   ▓▓▓ 64% │ │ ●●●●●●○        │ │ 1.250 XP ▓▓▓░ →Lv 4  │ │
│ │ Frontend       ▓░░ 20% │ │ Pertahankan!  →│ │                     →│ │
│ └────────────────────────┘ └────────────────┘ └─────────────────────┘ │
├───────────────────────────────────────────────┬──────────────────────┤
│ D. Sesi Mentoring Mendatang     Semua jadwal →│ E. Career Center     │
│ ┌──────────────────────────────────────────┐  │ (kartu Ink, aksen    │
│ │ [12 MEI] LIVE ONLINE · 19:00 WIB          │  │  Sprout)            │
│ │ Design System Fundamentals                │  │ Buka fitur →        │
│ │ Mentor: Dewi Sartika       [Lihat Sesi]  │  ├──────────────────────┤
│ └──────────────────────────────────────────┘  │ F. Top Players       │
│ ┌──────────────────────────────────────────┐  │ #1 Ahmad   2.400 XP  │
│ │ …                                         │  │ #2 Citra   2.150 XP  │
│ └──────────────────────────────────────────┘  │ #3 Budi    1.980 XP  │
│                                               │ ── #12 Kamu 1.250 XP │
│ G. Misi Hari Ini (baru, ringkas)              │ Semua peringkat →    │
│ ☐ Selesaikan 1 materi       +50 XP            │                      │
│ ☑ Login hari ini            +10 XP            │                      │
└───────────────────────────────────────────────┴──────────────────────┘
```

### 10.2 Spesifikasi blok

| Blok | Isi | Aturan |
|---|---|---|
| **A. Greeting** | Sapaan h1 dengan nama depan, satu kalimat motivasi, **tombol "Lanjutkan"** ke materi terakhir | Tombol Lanjutkan adalah satu-satunya Primary di Dashboard. Sembunyikan bila belum ada bootcamp; ganti dengan "Cari Bootcamp" |
| **B. Target Mingguan** | Judul + ikon edit, pill "3 / 5 materi", bar progres 12px, caption "Reset tiap Senin", persentase | Saat tercapai: pill Sukses, bar Hijau-500, teks "Goal tercapai 🎉" (animasi sekali). Edit membuka modal stepper 1–50 |
| **C1. Aktivitas Belajar** | Jumlah bootcamp aktif, maks. 3 bootcamp dengan bar progres | Lebih dari 3 → tautan "Lihat semua". Kosong → empty state "Belum ada bootcamp aktif" + "Cari Bootcamp" |
| **C2. Daily Streak** | Angka streak, 7 titik hari minggu ini | Seluruh kartu dapat diklik ke halaman Streak. Bila hari ini belum aktif: caption peringatan "Selesaikan 1 materi hari ini agar streak tidak putus" |
| **C3. Level Belajar** | Nama level, total XP, bar ke level berikutnya | Klik ke halaman Level |
| **D. Sesi Mentoring** | Maks. 3 sesi terdekat: blok tanggal (Mint, angka Hijau-800), label status, jam WIB, judul (sentence case), mentor, tombol Dark "Lihat Sesi" | Sesi sedang berlangsung naik ke atas dengan label LIVE dan tombol Primary "Gabung Sekarang" |
| **E. Career Center** | Kartu Highlight Ink: ikon, judul, deskripsi singkat, tautan | Menggantikan kartu gradien oranye |
| **F. Top Players** | 5 teratas + baris pengguna sendiri bila di luar 5 besar | Medali 1–3 sesuai §4.4 |
| **G. Misi Hari Ini** | 2–3 misi harian dengan checkbox dan reward | Opsional tapi disarankan: memperkuat loop harian |

### 10.3 Urutan di mobile

A (greeting + Lanjutkan) → B (target) → C2 streak & C3 level (2 kolom kecil) → D sesi → C1 aktivitas → G misi → F top players → E career center.

---

## 11. Struktur Profil

**Tujuan:** etalase pencapaian pengguna (untuk diri sendiri dan, ke depannya, untuk dibagikan ke rekruter). Profil **bukan** tempat mengubah password; itu pindah ke Pengaturan.

### 11.1 Tata letak

```
┌──────────────────────────────────────────────────────────────────┐
│ Profile Header (kartu, aksen pita Ink tipis di atas)              │
│ (Avatar 112px)  Dewi Saputri                                     │
│                 UI/UX Design · Batch 89 · Explorer               │
│                 Bergabung Mei 2026                               │
│                 [Edit Profil] (Secondary)  [Sertifikat Saya]     │
├──────────────────────────────────────────────────────────────────┤
│ Stat Row:  [★ Total XP 1.250] [🏆 Level Explorer] [🔥 Streak 7 hari] [📚 Kursus 2] │
├──────────────────────────────────────────────────────────────────┤
│ Tabs: Ringkasan · Pencapaian · Kursus · Sertifikat                │
│                                                                  │
│ (Ringkasan)                                                      │
│ ┌ Bootcamp Berjalan ─────────────┐ ┌ Lencana Terbaru ───────────┐ │
│ │ UI/UX Design      ▓▓▓▓░ 64%    │ │ [⚡][🔥][🔒] Lihat semua → │ │
│ └────────────────────────────────┘ └────────────────────────────┘ │
│ ┌ Aktivitas Terakhir ──────────────────────────────────────────┐  │
│ │ • Menyelesaikan "Day 3 – Auto Layout"    +200 XP · 2 jam lalu │  │
│ └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 11.2 Spesifikasi

| Bagian | Aturan |
|---|---|
| **Avatar** | 112px, border putih 4px, inisial pada Mint bila tanpa foto. Klik → modal ganti foto (pratinjau, potong bulat, Simpan/Batal) |
| **Identitas** | Nama h1; baris peran dinamis = jalur bootcamp + batch + level. Jangan tampilkan peran tetap |
| **Aksi** | "Edit Profil" membuka **modal/drawer** berisi nama, foto, bio singkat. Hanya data publik. Pengaturan akun ada di halaman Pengaturan |
| **Stat Row** | 4 Stat Card; di mobile jadi 2×2 |
| **Tab Pencapaian** | Grid Badge Card 3 kolom (2 di tablet, 1 di mobile); urutan: terbuka terbaru → hampir terbuka (progres tertinggi) → terkunci |
| **Tab Kursus** | List bootcamp: aktif & selesai, dengan progres dan tombol "Lanjutkan"/"Lihat Sertifikat" |
| **Tab Sertifikat** | Kartu pratinjau sertifikat, tombol Unduh & Bagikan. Kosong → "Selesaikan bootcamp untuk membuka sertifikat" |

---

## 12. Struktur Pengaturan (Settings)

**Masalah saat ini:** pengaturan terbagi antara "Edit Profil" (tab Pengaturan Dasar & Keamanan) dan bagian terpisah untuk email, 2FA, dan sesi perangkat.
**Keputusan:** satu halaman **Pengaturan** dengan navigasi kiri; setiap bagian berupa kartu dengan tombol simpan sendiri.

### 12.1 Tata letak

```
┌──────────────────────────────────────────────────────────────────┐
│ Pengaturan                                                       │
│ Kelola akun, keamanan, dan preferensi belajarmu.                  │
├──────────────┬───────────────────────────────────────────────────┤
│ ▣ Akun       │ ┌ Informasi Dasar ─────────────────────────────┐  │
│ ▢ Keamanan   │ │ Nama lengkap  [Dewi Saputri          ]       │  │
│ ▢ Perangkat  │ │ Foto profil   (Avatar) [Ganti] [Hapus]       │  │
│ ▢ Belajar    │ │                              [Simpan perubahan]│ │
│ ▢ Notifikasi │ └──────────────────────────────────────────────┘  │
│              │ ┌ Alamat Email ────────────────────────────────┐  │
│ ──────────── │ │ dewi@email.com                    [Ubah email]│  │
│ ▢ Zona Bahaya│ └──────────────────────────────────────────────┘  │
└──────────────┴───────────────────────────────────────────────────┘
```

- Navigasi kiri 220px, item aktif latar Mint + teks Ink + garis kiri Sprout. Di mobile menjadi daftar menu; tiap item membuka halaman bagiannya.
- Konten maks. 640px, kartu bertumpuk dengan jarak 24px.
- Setiap kartu: judul h3, deskripsi singkat Ink-500, isi, footer dengan tombol simpan rata kanan.
- Tombol simpan **nonaktif** sampai ada perubahan; muncul toast setelah berhasil.
- Bila pengguna pindah bagian dengan perubahan belum disimpan → modal "Buang perubahan?".

### 12.2 Isi tiap bagian

**A. Akun**
| Kartu | Isi |
|---|---|
| Informasi Dasar | Nama lengkap, foto profil |
| Alamat Email | Email saat ini + "Ubah email" → field email baru + konfirmasi password + info "Verifikasi mungkin diperlukan". **Akun Google:** field terkunci + banner Info "Email terhubung dengan Google dan dikelola oleh Google" |

**B. Keamanan**
| Kartu | Isi |
|---|---|
| Status Keamanan | Ringkasan: metode masuk (Email/Google), status 2FA. Badge Sukses "Proteksi ganda aktif" atau Peringatan "2FA belum aktif" |
| Ubah Password | Password lama, password baru (dengan indikator kekuatan), konfirmasi. **Akun Google:** diganti banner "Keamanan dikelola oleh Google" |
| Autentikasi Dua Faktor (2FA) | Nonaktif → tombol Primary "Aktifkan 2FA" → alur 3 langkah (lihat §15.6). Aktif → status, "Lihat kode cadangan", tombol Danger-ghost "Matikan 2FA" dengan modal konfirmasi |

**C. Perangkat (Sesi Browser Aktif)**
- List perangkat: ikon (laptop/ponsel), nama peramban & OS, lokasi perkiraan, waktu terakhir aktif. Perangkat ini ditandai pill Sukses "Perangkat ini".
- Tombol Dark "Keluar dari sesi lain" → modal konfirmasi destruktif dengan verifikasi sesuai jenis akun (password / kode 2FA / konfirmasi Google).

**D. Belajar (Preferensi)**
- Target mingguan (stepper, sama dengan modal di Dashboard; satu sumber data).
- Pengingat harian streak (toggle + pilihan jam).

**E. Notifikasi**
- Toggle per kategori: sesi mentoring akan dimulai, misi baru, naik level, pengumuman bootcamp. Kanal: email / dalam aplikasi.

**F. Zona Bahaya**
- Kartu border merah lembut: "Hapus akun" dengan penjelasan konsekuensi, tombol Danger, modal yang meminta pengguna mengetik ulang email.

> Bagian D, E, F adalah usulan perluasan. A, B, C sudah ada di project dan hanya disatukan.

---

## 13. Halaman Produk Lainnya

### 13.1 Katalog Bootcamp (publik & peserta)
- Header: "Katalog Bootcamp" + deskripsi + pencarian & filter (kategori, level kesulitan).
- Grid kartu 3 kolom: thumbnail 16:9 (`radius-lg` di dalam kartu), kategori, judul h4, mentor, durasi, jumlah materi, XP total, tombol "Lihat Detail".
- Kartu bootcamp yang sudah diikuti: pill "Terdaftar" + bar progres menggantikan harga/aksi.

### 13.2 Detail Bootcamp
```
┌ Hero (kartu Ink) ─────────────────────────────────────────────┐
│ Kategori · Level   Judul bootcamp (h1, putih)                  │
│ Deskripsi singkat (Ink-300)   Mentor · Durasi · Materi          │
│ [Daftar Bootcamp] / [Lanjutkan Belajar] (Primary)               │
├──────────────────────────────────────┬────────────────────────┤
│ Kurikulum (accordion per hari)       │ Progres Bootcamp (ring) │
│  Day 1  Intro…   ✓  45 menit  +200 XP │ Statistik Kamu          │
│  Day 2  …        ●                   │  Total waktu · XP ·      │
│  Day 3  …        🔒                  │  Sertifikat (terkunci)   │
└──────────────────────────────────────┴────────────────────────┘
```
Panel kanan menempel saat scroll (desktop).

### 13.3 Halaman Materi (Lesson / Day Material)
```
┌ Breadcrumb: Kursus Saya › UI/UX Design › Day 3 ─────────────────┐
├──────────────────────────────────────────┬─────────────────────┤
│ Pemutar video 16:9 (`radius-xl`)          │ Kurikulum Hari Ini  │
│ Judul materi (h2) · durasi · +XP          │  ✓ Video intro      │
│ Tabs: Ringkasan · Catatan · Transkrip ·   │  ● Latihan (Wajib)  │
│       Playground · Tugas                  │  ○ Quiz             │
│ Konten tab                                │ Progres hari ini ▓▓░│
│                                           │                     │
│ [← Sebelumnya]   [Tandai Selesai & Lanjut →] (Primary)          │
└──────────────────────────────────────────┴─────────────────────┘
```
- **Playground:** dua panel (editor | pratinjau hasil), toolbar dengan tab bahasa dan tombol "Jalankan".
- **Tugas:** instruksi, tenggat, dropzone (PDF), status kiriman (Belum dikirim / Menunggu penilaian / Dinilai).
- Selesai materi → toast "+200 XP" dan langsung tawarkan materi berikutnya.
- Kosong: "Belum ada catatan untuk materi ini", "Transkrip sedang disiapkan" memakai empty state ringkas.

### 13.4 Kursus Saya
Header + tab (Berjalan · Selesai). Kartu horizontal: thumbnail, judul, progres, materi terakhir, tombol "Lanjutkan". Kosong: ilustrasi + "Kamu belum mendaftar di bootcamp manapun" + "Jelajahi Bootcamp".

### 13.5 Misi & Lencana (Mission Center)
- Ringkasan atas: 2 Stat Card (Total XP misi, Lencana didapat "8 / 24").
- Tabs: Harian · Mingguan · Spesial. Mission Card dalam list, misi selesai turun ke bawah.
- Panel kanan: kartu Soft "Tips Misi".
- Bagian lencana: grid Badge Card (sama dengan Profil).

### 13.6 Leaderboard (Peringkat Global)
- Header + segmented control periode.
- **Podium** 3 teratas (kartu medali, avatar 64px).
- Tabel/list peringkat 4+ dengan pencarian pemain.
- Baris "Kamu" dipin.
- Klik pemain → **drawer profil ringkas**: avatar, level, total XP, streak, jalur evolusi (stepper), status online.

### 13.7 Level (Status Karakter)
- Kartu Highlight Ink: ilustrasi evolusi saat ini, nama level, ring progres, "XP dibutuhkan untuk level berikutnya".
- **Evolution Roadmap**: slider horizontal kartu level (terbuka = Mint, aktif = border Sprout, terkunci = abu + gembok).
- Saat level maksimum: banner Sukses "Evolusi maksimum tercapai".

### 13.8 Streak
- Angka streak `display` di tengah + ikon api Sprout di kartu Ink.
- Kalimat: "Jangan biarkan apimu padam. Selesaikan satu materi setiap hari."
- Kalender aktivitas minggu ini (7 lingkaran) + riwayat bulanan (grid kecil seperti heatmap Mint → Hijau-600).
- Banner Peringatan bila hari ini belum aktif, dengan tombol "Lanjutkan materi".

### 13.9 Mentoring
- **Jadwal Mentoring:** banner Soft "Upgrade skill bersama mentor terbaik", list/tabel sesi (Jadwal · Informasi Sesi · Aksi). Filter: Mendatang · Selesai.
- **Detail Sesi:** breadcrumb, judul, mentor (avatar + peran), grid info (Tanggal · Jam WIB · Status), detail pembahasan, tombol "Gabung" (aktif 10 menit sebelum mulai) atau "Tambahkan ke kalender".
- **Live Mentoring:**
  ```
  ┌──────────────────────────────────────┬─────────────────┐
  │ Video live (LIVE badge, penonton)    │ Live Chat       │
  │ Kontrol: putar · volume · kualitas · │ pesan…          │
  │ layar penuh                          │ reaksi 😊       │
  │ Judul sesi · Mentor                  │ [Tulis pesan…]  │
  ├──────────────────────────────────────┤                 │
  │ Misi Harian (sesi)  ·  Top Leaderboard│                │
  └──────────────────────────────────────┴─────────────────┘
  ```
  Reward menonton ("Kamu mendapat +10 XP ✨") memakai toast, bukan pop-up yang menutup video. Di mobile chat menjadi drawer bawah.

### 13.10 Career Center
```
┌ Talent License (kartu Ink) ───────────────────────────────────┐
│ UI/UX Designer – Batch 89   Level 1 – Novice Learner           │
│ Next goal: Level 7  ▓░░░░ 30 / 150 XP                          │
│ Milestone: Lv1 ● ── Lv5 ○ ── Lv7 ○   "Kamu akan mendapatkan…"   │
├───────────────────────────────────────────────────────────────┤
│ Readiness: [Project] [Bot Interview] [CV Score] [Engagement]   │ ← 4 Stat Card dengan ring
├───────────────────────────────────────────────────────────────┤
│ Career Tools: [CV Analyzer] [Bot Interview] [Final Project]     │ ← kartu Interactive
├───────────────────────────────────────────────────────────────┤
│ Rekomendasi Pekerjaan  — terkunci: overlay blur + gembok +      │
│ "Tingkatkan CV Score untuk membuka peluang kerja premium"       │
└───────────────────────────────────────────────────────────────┘
```

- **CV Analyzer:** langkah 1 dropzone → langkah 2 memindai (progres) → langkah 3 hasil: ring skor /100, jumlah masalah, bar per kategori (Kualitas Konten, Kelengkapan Bagian), lalu accordion per kriteria (Keterbacaan ATS, Dampak Terukur, Variasi Kata Kerja, Ejaan & Tata Bahasa) dengan label penilaian:
  | Label | Gaya |
  |---|---|
  | Sangat baik | Sukses |
  | Baik | Info |
  | Perlu diperbaiki | Peringatan |
  | Kurang | Bahaya |
  Saran ejaan ditampilkan sebagai pasangan "salah → benar" yang bisa diterima satu per satu.
- **Bot Interview:** 3 tahap.
  1. *Persiapan* — pratinjau kamera, uji mikrofon (bar level suara Sprout), pilih kamera/mikrofon, pilih role, bahasa, jenis wawancara, tingkat kesulitan (chip). Tombol Primary "Mulai Interview".
  2. *Wawancara* — video pengguna + avatar pewawancara, indikator "sedang berbicara", timer, tombol akhiri (Danger).
  3. *Evaluasi* — status "Menyusun evaluasi…" (skeleton), lalu ringkasan skor, kekuatan, area perbaikan, transkrip.
- **Final Project:** dropzone + riwayat kiriman + status penilaian.

### 13.11 Halaman publik
- **Beranda:** hero (judul display, subjudul, CTA "Daftar Sekarang" Primary + "Lihat Bootcamp" Secondary), katalog jalur karier, keunggulan Learnify, testimoni alumni ("Kata Mereka"), FAQ (accordion), CTA penutup di kartu Ink. Gradien ungu-biru animatif diganti latar Ink dengan bentuk organik Sprout/Mint samar.
- **Tentang:** misi, metode belajar (Project Based Learning · Mentoring Intensif · Career Support) dalam 3 kartu, lokasi kantor & kontak.
- **Kebijakan Privasi:** halaman baca 720px, daftar isi melayang di kiri.

### 13.12 Autentikasi
- Layout dua kolom (desktop): kiri panel Ink dengan ilustrasi + kutipan alumni; kanan form 440px. Mobile: form saja dengan logo di atas.
- **Masuk:** email, password (tampil/sembunyi), "Lupa password?", tombol Primary "Masuk", pemisah "atau masuk dengan", tombol Secondary Google, tautan "Belum punya akun? Daftar".
- **Daftar:** nama, email, password + indikator kekuatan, konfirmasi, persetujuan kebijakan, Primary "Buat Akun", opsi Google.
- **Lupa / Reset password:** satu field per layar, layar konfirmasi "Cek email kamu" dengan ilustrasi.
- **Verifikasi 2FA:** input OTP 6 kotak, "Gunakan kode cadangan", tautan kembali.

---

## 14. Area Admin

Admin memakai shell yang sama, namun sidebar menampilkan menu admin dan label "Admin" pada navbar.

| Menu | Isi utama |
|---|---|
| **Ringkasan** | 4 Stat Card (Total Siswa, Kursus Aktif, Materi Selesai, Pendapatan) + grafik aktivitas + daftar aktivitas terbaru |
| **Pengguna** | Pencarian, filter status; tabel Siswa · Aktivitas Terakhir · Status · Aksi; aksi "Ban/Buka ban" dengan modal konfirmasi |
| **Kursus** | Pohon konten: Bootcamp → Hari → Materi (Video, Quiz, PDF, Template); tombol "Tambah Kursus" membuka form multi-langkah |
| **Sesi** | Daftar sesi mentoring + form jadwal baru |
| **Misi** | Tabel Nama Misi · Kategori · Aktivitas · Target · Reward · Tanggal · Status · Aksi; form "Tambah Misi" (nama, kategori, deskripsi, jenis aktivitas, target & satuan, reward XP) |

**Aturan admin:**
- Kepadatan lebih tinggi: padding kartu 20px, baris tabel 52px.
- Grafik memakai Sprout (seri utama), Slate (seri pembanding), Ink-200 (grid).
- Semua aksi destruktif melalui modal konfirmasi; aksi massal menampilkan jumlah item terpilih.
- Status aktif/nonaktif memakai toggle, bukan teks.

---

## 15. Alur End-to-End

### 15.1 Peta besar perjalanan peserta

```
Pengunjung ─▶ Beranda ─▶ Katalog ─▶ Detail Bootcamp ─▶ Daftar akun
                                                        │
                                                        ▼
                         Onboarding singkat (pilih jalur, target mingguan)
                                                        │
                                                        ▼
       ┌────────────── Dashboard (pusat) ◀──────────────────────────┐
       │                    │                                       │
       ▼                    ▼                                       │
  Materi harian ─▶ Selesai ─▶ +XP, streak, misi, progres ───────────┤
       │                                                           │
       ▼                                                           │
  Mentoring (jadwal ─▶ live) ─▶ +XP ───────────────────────────────┤
       │                                                           │
       ▼                                                           │
  Bootcamp selesai ─▶ Sertifikat ─▶ Career Center                  │
                                     (CV Analyzer ─▶ Bot Interview  │
                                      ─▶ Final Project) ─▶ Talent    │
                                      License naik ─▶ Rekomendasi    │
                                      pekerjaan terbuka ────────────┘
```

### 15.2 Registrasi & onboarding

| Langkah | Layar | Kriteria UX |
|---|---|---|
| 1 | Daftar (email atau Google) | ≤ 4 field; error inline |
| 2 | Verifikasi email (bila bukan Google) | Layar "Cek email kamu" + kirim ulang (cooldown 60 detik) |
| 3 | Onboarding 1/3 — pilih jalur karier | Kartu pilihan besar, bisa dilewati |
| 4 | Onboarding 2/3 — atur target mingguan | Stepper, default 5 materi, penjelasan singkat |
| 5 | Onboarding 3/3 — kenalan gamifikasi | 3 poin: XP, streak, level |
| 6 | Dashboard dengan state "pengguna baru" | Greeting + CTA "Mulai materi pertama" + checklist awal (Lengkapi profil, Ikuti bootcamp, Selesaikan materi pertama) |

### 15.3 Mendaftar & belajar

1. Katalog → Detail Bootcamp → **Daftar Bootcamp** → modal konfirmasi singkat → toast "Kamu terdaftar di UI/UX Design".
2. Hero berubah menjadi "Lanjutkan Belajar" → materi Day 1.
3. Menonton/membaca → tab Tugas bila ada → **Tandai Selesai**.
4. Umpan balik: toast XP, titik kurikulum berubah centang, bar progres hari bergerak.
5. Bila target mingguan tercapai → banner perayaan sekali di Dashboard.
6. Bila naik level → Level Up Modal.
7. Semua hari selesai → layar "Bootcamp selesai" + sertifikat + CTA ke Career Center.

### 15.4 Loop harian (retensi)

Notifikasi pengingat → buka aplikasi → Dashboard menampilkan streak + misi hari ini → "Lanjutkan" → selesai materi → misi tercentang → streak bertambah → Leaderboard posisi naik (indikator ▲ di Top Players).

### 15.5 Mentoring

Dashboard/Jadwal → Detail Sesi → (H-10 menit) tombol "Gabung" aktif, label LIVE → Live Mentoring → chat & reaksi → reward XP via toast → sesi berakhir → layar ringkasan (rekaman bila ada, materi pendukung).

### 15.6 Profil & Pengaturan

**Ubah profil:** Profil → Edit Profil (drawer) → ganti nama/foto → pratinjau → Simpan → toast + header profil langsung berubah.

**Ubah password:** Pengaturan › Keamanan → isi 3 field → Simpan → toast "Password diperbarui" → opsi "Keluar dari sesi lain sekarang?".

**Aktifkan 2FA:**
1. Pengaturan › Keamanan → "Aktifkan 2FA".
2. Modal langkah 1/3: pindai kode QR dengan aplikasi authenticator (+ kode manual).
3. Langkah 2/3: masukkan kode 6 digit (input OTP).
4. Langkah 3/3: tampilkan kode cadangan, tombol "Salin" & "Unduh", checkbox "Saya sudah menyimpan kode".
5. Selesai → status kartu menjadi "Proteksi ganda aktif".

**Kelola perangkat:** Pengaturan › Perangkat → tinjau daftar → "Keluar dari sesi lain" → verifikasi → daftar menyisakan "Perangkat ini" + toast.

**Login dengan 2FA:** Masuk → layar Verifikasi Keamanan (OTP) → Dashboard. Salah 3 kali → pesan penjelas + tautan kode cadangan.

### 15.7 Persiapan karier

Career Center → lihat readiness (4 indikator) → **CV Analyzer** (unggah → skor → perbaiki → unggah ulang) → **Bot Interview** (persiapan perangkat → wawancara → evaluasi) → **Final Project** (unggah → dinilai) → Talent License naik level → kartu **Rekomendasi Pekerjaan** terbuka (animasi gembok terbuka sekali).

### 15.8 Admin

Masuk sebagai admin → Ringkasan → Pengguna (cari → tinjau → ban/buka ban) → Kursus (tambah bootcamp → tambah hari → tambah materi) → Misi (tambah misi → atur target & reward → aktifkan) → Sesi (jadwalkan sesi).

---

## 16. State: Loading, Kosong, Error, Sukses

| State | Pola | Contoh teks |
|---|---|---|
| **Loading awal** | Skeleton berbentuk konten | — |
| **Loading aksi** | Tombol loading, form tidak bisa dikirim ganda | "Menyimpan…", "Memproses…" |
| **Loading lama** (> 3 detik) | Progres + penjelasan | "Memindai CV kamu…", "Menyusun evaluasi wawancara…" |
| **Kosong — pertama kali** | Ilustrasi + ajakan | "Belum ada bootcamp aktif. Yuk mulai perjalananmu." [Cari Bootcamp] |
| **Kosong — hasil filter** | Teks + reset | "Tidak ada siswa ditemukan." [Hapus filter] |
| **Error memuat** | Kartu error + coba lagi | "Profil gagal dimuat. Periksa koneksi lalu coba lagi." [Coba lagi] |
| **Error form** | Inline per field + ringkasan di atas form bila > 2 error | "Password lama tidak sesuai." |
| **Tanpa akses / terkunci** | Overlay blur + gembok + syarat membuka | "Capai CV Score 70 untuk membuka rekomendasi pekerjaan." |
| **Sukses** | Toast; untuk pencapaian besar gunakan modal perayaan | "Profil berhasil diperbarui." |

Halaman yang memuat data **tidak boleh** kosong polos ketika gagal; selalu tampilkan state error dengan tombol "Coba lagi".

---

## 17. Aksesibilitas

- Kontras teks minimum 4.5:1 (teks besar 3:1). Ikuti tabel §4.5; **jangan** menaruh teks di atas Sprout selain Ink.
- Fokus keyboard selalu terlihat: cincin 3px Sprout + jarak 2px (di latar gelap cincin Mint).
- Target sentuh minimum 44×44px.
- Status tidak boleh hanya dibedakan warna: tambahkan ikon/teks (✓ Selesai, 🔒 Terkunci, LIVE).
- Progress bar memiliki label teks ("3 dari 5 materi").
- Modal mengunci fokus di dalamnya dan mengembalikan fokus ke pemicu saat ditutup.
- Video materi dan live mentoring: sediakan transkrip/teks; kontrol pemutar bisa dioperasikan keyboard.
- Kamera/mikrofon di Bot Interview: jelaskan alasan izin sebelum meminta, sediakan jalur bila izin ditolak.
- Animasi perayaan mengikuti preferensi kurangi gerakan.

---

## 18. Bahasa & Microcopy

**Nada:** ramah, menyemangati, ringkas; menyapa dengan "kamu".

| Aturan | ✅ Lakukan | ❌ Hindari |
|---|---|---|
| Bahasa utama Indonesia | "Peringkat Global", "Sesi Mentoring" | Campur dalam satu judul: "Top Players Mingguan" |
| Istilah Inggris hanya untuk nama fitur resmi | Career Center, CV Analyzer, Bot Interview, Final Project, Talent License, Leaderboard | "Evolution Path", "Scanning Player…", "Online Now" (ganti: "Jalur Evolusi", "Mencari pemain…", "Sedang online") |
| Tombol = kata kerja + objek | "Simpan target", "Gabung sesi", "Unggah CV" | "OK", "Submit", "Klik di sini" |
| Error menjelaskan solusi | "Ukuran file maks. 2 MB. Coba kompres atau pilih file lain." | "Upload gagal." |
| Konsisten satu istilah | "Materi" (bukan bergantian Lesson/Modul/Unit) | "Target Baru (Lesson)" + "Unit" |
| Angka format Indonesia | "1.250 XP", "19:00 WIB", "12 Mei 2026" | "1,250 XP" |
| Sentence case | "Sesi mentoring mendatang" | "SESI MENTORING MENDATANG" |

**Glosarium:** XP (poin pengalaman) · Level (tahap evolusi) · Streak (hari beruntun belajar) · Misi (tugas berhadiah XP) · Lencana (badge pencapaian) · Materi (unit belajar terkecil) · Hari / Day (kelompok materi dalam bootcamp) · Bootcamp (program belajar lengkap).

---

## 19. Responsif

| Breakpoint | Lebar | Shell | Grid |
|---|---|---|---|
| Mobile | < 768px | Navbar ringkas + bottom navigation | 4 kolom, padding 16px |
| Tablet | 768–1023px | Sidebar ikon 72px | 8 kolom, padding 24px |
| Desktop | 1024–1439px | Sidebar penuh 264px | 12 kolom, padding 32px |
| Wide | ≥ 1440px | Sidebar penuh, konten maks. 1200px di tengah | 12 kolom, padding 40px |

**Aturan adaptasi:**
- Grid kartu 3 kolom → 2 (tablet) → 1 (mobile); Stat Card → 2×2 di mobile.
- Panel kanan yang menempel (kurikulum, statistik) pindah ke bawah konten utama atau menjadi tombol yang membuka drawer.
- Tabel admin di mobile berubah menjadi kartu per baris.
- Modal di mobile menjadi *bottom sheet* setinggi isi, tombol lebar penuh.
- Live Mentoring mobile: video di atas, chat sebagai drawer.

---

## 20. Checklist Review Desain

Gunakan sebelum layar baru dianggap selesai.

**Visual**
- [ ] Hanya Sprout/Mint sebagai aksen; tidak ada biru/ungu/oranye sisa
- [ ] Tidak ada teks di atas Sprout selain Ink; tidak ada teks Sprout di latar putih
- [ ] Radius memakai 5 token; bayangan berbasis Ink
- [ ] Tidak ada teks < 12px; kapital penuh hanya untuk overline/LIVE
- [ ] Ikon dari satu set garis; emoji hanya untuk konten emosional

**Struktur**
- [ ] Ada judul halaman dan (bila tingkat 2+) breadcrumb
- [ ] Hanya satu tombol Primary per area pandang
- [ ] Langkah berikutnya untuk pengguna terlihat jelas

**State**
- [ ] Skeleton, kosong, error (dengan coba lagi), dan sukses sudah didesain
- [ ] Tombol memiliki state hover, focus, disabled, loading
- [ ] Varian akun Google dan akun email (di Pengaturan) sudah dipertimbangkan

**Aksesibilitas & konten**
- [ ] Kontras lolos §4.5, target sentuh ≥ 44px, fokus terlihat
- [ ] Status tidak hanya dibedakan warna
- [ ] Teks mengikuti §18 (bahasa, format angka, nada)

**Responsif**
- [ ] Diuji di 375px, 768px, 1280px, 1440px
