# Akademi Kamera

Learning Management System (LMS) fotografi berbasis web untuk mempelajari segitiga exposure: aperture, shutter speed, dan ISO. Proyek tugas akhir Program Studi S1 Sistem Informasi, Fakultas Ilmu Komputer, UPN "Veteran" Jakarta.

Status: **prototype**. Tiga fitur utama sudah berjalan: simulator kamera, analisis foto, dan LMS inti (login, katalog kursus, materi, kuis, progres, dasbor siswa). Penyuntingan kursus lewat UI dan dasbor instruktur belum tersedia.

## Daftar isi

1. [Fitur](#fitur)
2. [Teknologi](#teknologi)
3. [Menjalankan secara lokal](#menjalankan-secara-lokal)
4. [Deploy ke Vercel](#deploy-ke-vercel)
5. [Menghubungkan Supabase](#menghubungkan-supabase)
6. [Struktur folder](#struktur-folder)
7. [Rumus yang dipakai](#rumus-yang-dipakai)
8. [Basis pengetahuan sistem pakar](#basis-pengetahuan-sistem-pakar)
9. [Pengujian](#pengujian)
10. [Penyederhanaan dan batasan](#penyederhanaan-dan-batasan)
11. [Keamanan dan privasi](#keamanan-dan-privasi)
12. [Rencana pengembangan](#rencana-pengembangan)

## Fitur

### 1. Simulator kamera (`/simulator`)

Kamera virtual dalam mode manual. Setiap perubahan setelan langsung terlihat pada pratinjau.

| Setelan | Efek pada pratinjau |
|---|---|
| Aperture (f/1.4 – f/22) | Blur latar belakang (depth of field), kecerahan |
| Shutter speed (1" – 1/4000) | Motion blur mobil yang melaju, goyangan tangan, kecerahan |
| ISO (100 – 25600) | Noise/bintik, kecerahan |
| Focal length (24 – 200 mm) | Kekuatan blur latar, motion blur, batas aman goyangan |
| Tripod | Menghilangkan goyangan tangan |

Pendukung lain:

- Meter exposure −3 sampai +3 EV dengan langkah 1/3 stop (status kurang, tepat, atau berlebih).
- Empat kondisi cahaya: siang terik (EV 15), berawan (EV 12), senja (EV 9), jalan kota malam (EV 5).
- Petunjuk shutter yang tepat untuk aperture dan ISO saat ini.
- Lima latihan terpandu dengan kriteria lulus otomatis:
  1. Bekukan mobil yang melaju
  2. Blur latar pada potret
  3. Tunjukkan kecepatan dengan motion blur
  4. Memotret malam tanpa tripod
  5. Aturan Sunny 16

### 2. Analisis foto dan saran setelan (`/analisis`)

1. Pengguna mengunggah foto (JPG, PNG, WEBP, HEIC, TIFF, maks. 25 MB).
2. Sistem membaca metadata EXIF: aperture, shutter, ISO, focal length (termasuk setara 35 mm), kamera, lensa, flash, white balance, mode exposure, mode metering, kompensasi exposure.
3. Sistem mengukur piksel foto: histogram, persentase shadow/highlight terpotong, skor ketajaman, dan warna dominan.
4. Sistem pakar berbasis aturan (14 aturan) menghasilkan saran beserta nilai setelan baru, contoh: *"Shutter 1/30 pada 85 mm berisiko goyang. Coba 1/100 dan naikkan ISO ke 640."*
5. Tabel "Mengapa saran ini muncul" menampilkan status tiap aturan: terpicu, tidak terpicu, atau dilewati karena data tidak tersedia.

Penanganan EXIF yang hilang:

- **EXIF terhapus seluruhnya** (foto dari WhatsApp, media sosial, screenshot): aturan berbasis histogram tetap berjalan, dan pengguna dapat mengisi setelan secara manual.
- **EXIF sebagian**: aturan yang datanya lengkap tetap dijalankan, sisanya dilewati.
- **Fallback tag**: jika `FNumber` atau `ExposureTime` kosong, sistem memakai `ApertureValue` / `ShutterSpeedValue` (format APEX).
- **Foto ponsel** (focal length asli < 12 mm): aturan yang menyarankan perubahan aperture dimatikan karena aperture ponsel umumnya tetap.
- **Format yang tidak bisa ditampilkan browser** (misalnya HEIC di Chrome): EXIF tetap dibaca, analisis piksel dilewati.

### 3. LMS inti (`/kursus`, `/dasbor`)

Alur belajar terstruktur di atas Supabase Auth dan PostgreSQL:

- **Akun** — daftar dan masuk dengan email/kata sandi (`/daftar`, `/masuk`). Akun baru otomatis berperan `student`.
- **Katalog kursus publik** (`/kursus`) — hanya kursus `is_published` yang tampil, dengan pencarian dan filter level.
- **Pendaftaran kursus** — satu klik; progres disimpan per pengguna.
- **Materi** — modul dan lesson berisi Markdown; tombol "Tandai selesai" mencatat `lesson_progress` dan sekaligus mendaftarkan kursus.
- **Tautan simulator** — `lessons.simulator_exercise_id` membuka latihan yang relevan lewat `/simulator?latihan=...`.
- **Kuis** — pilihan ganda dengan ambang lulus (`pass_score`); nilai disimpan di `quiz_attempts` dan riwayat percobaan ditampilkan.
- **Dasbor siswa** (`/dasbor`) — kursus diikuti, persentase materi selesai, kuis terakhir, latihan simulator, dan analisis foto.

Halaman LMS menampilkan petunjuk konfigurasi jika `NEXT_PUBLIC_SUPABASE_*` belum diisi. Simulator dan analisis foto tetap berfungsi tanpa akun.

## Teknologi

| Komponen | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 15.5 (App Router) | Didukung langsung oleh Vercel, satu bahasa untuk frontend dan backend |
| UI | React 19 + Tailwind CSS 4 | Komponen interaktif untuk simulator; styling cepat dan konsisten |
| Bahasa | JavaScript (ES Modules) | Kurva belajar lebih rendah dibanding TypeScript untuk tenggat yang singkat |
| Basis data & autentikasi | Supabase (PostgreSQL + Auth) | Gratis untuk skala proyek, Row Level Security untuk hak akses per peran |
| Pembaca EXIF | exifr 7.1.3 | Berjalan di browser, mendukung JPEG, HEIC, TIFF |
| Hosting | Vercel | Deploy otomatis dari GitHub, HTTPS gratis |
| Pengujian unit | `node:test` bawaan Node.js | Tanpa dependensi tambahan |

## Menjalankan secara lokal

Prasyarat: Node.js 20 atau lebih baru, dan Git.

```bash
npm install        # pasang dependensi
npm run dev        # mode pengembangan di http://localhost:3000
npm test           # jalankan 18 unit test
npm run build      # build produksi (cek sebelum deploy)
npm start          # jalankan hasil build
```

Aplikasi berjalan tanpa konfigurasi tambahan. Tanpa Supabase, hasil latihan disimpan di `localStorage` browser.

## Deploy ke Vercel

1. Unggah proyek ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "Prototype Akademi Kamera"
   git branch -M main
   git remote add origin https://github.com/<username>/akademi-kamera.git
   git push -u origin main
   ```
2. Buka [vercel.com](https://vercel.com), pilih **Add New > Project**, lalu impor repository tersebut.
3. Framework terdeteksi otomatis sebagai Next.js. Klik **Deploy** tanpa mengubah pengaturan.
4. Setiap `git push` ke branch `main` akan memicu deploy ulang otomatis.

Jika build di Vercel gagal, jalankan `npm run build` di komputer sendiri dulu; pesan error-nya sama dan lebih mudah dibaca.

## Menghubungkan Supabase

Langkah ini dibutuhkan agar halaman login, kursus, kuis, dan dasbor aktif.

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, tempel seluruh isi `supabase/schema.sql`, lalu klik **Run**.
3. Ambil **Project URL** dan **anon public key** dari **Project Settings > API**.
4. Salin `.env.example` menjadi `.env.local`, lalu isi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
5. Jalankan `npm run dev`, lalu daftar satu akun lewat `/daftar`. Akun baru otomatis berperan `student`.
6. Jadikan akun itu instruktur, lalu isi contoh kursus. Di **SQL Editor**:
   ```sql
   update public.profiles
   set role = 'instructor'
   where id = (select id from auth.users where email = 'emailkamu@contoh.com');
   ```
   Setelah itu tempel dan jalankan `supabase/lms-seed.sql`. Skrip ini membuat 2 kursus, 10 materi, dan 3 kuis, dan aman dijalankan ulang.
7. Masukkan dua variabel lingkungan yang sama di Vercel: **Project > Settings > Environment Variables**, lalu redeploy.

> Jika basis data sudah dibuat sebelum halaman LMS ada, jalankan sekali `supabase/migrations/20261109000000_lms_profiles.sql` agar nama instruktur dapat ditampilkan di katalog.

Setelah pengguna login, `lib/progress.js` otomatis menyimpan hasil ke tabel `exercise_attempts` dan `photo_analyses`. Jika belum login, data tetap disimpan di browser.

> **Penting:** jangan pernah memasukkan `service_role` key ke kode atau ke variabel berawalan `NEXT_PUBLIC_`. Kunci itu melewati seluruh aturan keamanan basis data.

### Tabel basis data

| Tabel | Isi |
|---|---|
| `profiles` | Data pengguna dan peran (`student`, `instructor`, `admin`) |
| `courses`, `modules`, `lessons` | Struktur materi kursus |
| `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts` | Kuis dan nilai |
| `enrollments`, `lesson_progress` | Pendaftaran kursus dan progres belajar |
| `exercise_attempts` | Hasil latihan simulator (setelan, metrik, lulus/tidak) |
| `photo_analyses` | Ringkasan EXIF, metrik foto, dan aturan yang terpicu (tanpa file foto) |

Aturan hak akses (Row Level Security):

- Siswa hanya dapat membaca dan menulis data aktivitasnya sendiri.
- Instruktur mengelola kursusnya sendiri dan dapat melihat progres siswa.
- Admin mengelola semua data dan satu-satunya yang dapat mengubah peran pengguna.
- Pengguna baru otomatis berperan `student` dan tidak dapat menaikkan perannya sendiri.

## Struktur folder

```
akademi-kamera/
├── app/
│   ├── layout.js              Layout utama, AuthProvider, dan navigasi
│   ├── globals.css            Token warna, tipografi, gaya dial
│   ├── page.js                Beranda
│   ├── simulator/page.js      Halaman simulator kamera
│   ├── analisis/page.js       Halaman analisis foto
│   ├── kursus/page.js         Katalog kursus
│   ├── kursus/[courseId]/page.js             Detail kursus dan pendaftaran
│   ├── kursus/[courseId]/lesson/[lessonId]/page.js  Materi
│   ├── kursus/[courseId]/kuis/[quizId]/page.js      Kuis
│   ├── dasbor/page.js         Dasbor siswa
│   ├── masuk/page.js          Formulir masuk
│   └── daftar/page.js         Formulir pendaftaran
├── components/
│   ├── SiteHeader.js
│   ├── simulator/
│   │   ├── CameraSimulator.js Logika halaman simulator dan latihan
│   │   ├── SceneView.js       Render lapisan adegan dan efek
│   │   ├── ExposureMeter.js   Skala meter −3 s.d. +3 EV
│   │   └── SettingDial.js     Kontrol satu setelan
│   ├── analyzer/
│   │   └── PhotoAnalyzer.js   Unggah, tabel EXIF, histogram, saran
│   ├── auth/
│   │   ├── LoginForm.js       Formulir masuk
│   │   └── RegisterForm.js    Formulir daftar
│   └── lms/
│       ├── CourseCatalog.js   Daftar dan filter kursus
│       ├── CourseDetail.js    Modul, materi, pendaftaran, progres
│       ├── LessonView.js      Isi materi, penanda selesai, navigasi
│       ├── QuizRunner.js      Pengerjaan dan riwayat kuis
│       ├── Dashboard.js       Ringkasan belajar siswa
│       ├── Markdown.js        Renderer Markdown ringan
│       └── ui.js              Komponen kecil bersama (badge, notice, dsb.)
├── lib/
│   ├── exposure.js            Rumus EV, blur lensa, motion blur, goyangan, noise
│   ├── scenes.js              Preset kondisi cahaya
│   ├── exercises.js           Latihan terpandu dan kriterianya
│   ├── sceneDrawing.js        Gambar adegan prosedural di canvas
│   ├── exif.js                Ekstraksi dan normalisasi EXIF
│   ├── imageAnalysis.js       Histogram, clipping, ketajaman, warna
│   ├── rules.js               Basis pengetahuan dan mesin inferensi
│   ├── progress.js            Penyimpanan hasil (browser / Supabase)
│   ├── auth.js                Sesi, profil, dan peran pengguna
│   ├── lms.js                 Query kursus, materi, kuis, progres
│   ├── quiz.js                Penilaian kuis (fungsi murni)
│   └── supabase.js            Klien Supabase opsional
├── supabase/
│   ├── schema.sql             Skema basis data dan kebijakan RLS
│   ├── lms-seed.sql           Contoh 2 kursus, 10 materi, 3 kuis
│   └── migrations/            Perubahan skema untuk basis data lama
├── tests/                     Unit test (18 pengujian)
├── .env.example
├── next.config.js             Header keamanan
└── package.json
```

## Rumus yang dipakai

Semua rumus ada di `lib/exposure.js`.

| Besaran | Rumus | Keterangan |
|---|---|---|
| Exposure value setelan | EV = log₂(N² / t) | N = f-number, t = shutter (detik) |
| Kecerahan adegan | EV₁₀₀ = log₂(N² / t) − log₂(ISO / 100) | Dinormalisasi ke ISO 100 |
| Selisih exposure | Δ = (EV₁₀₀ adegan + log₂(ISO/100)) − EV setelan | Δ > 0 terlalu terang, Δ < 0 terlalu gelap; toleransi ±0,5 EV |
| Lingkaran kabur (blur latar) | b = f² / (N(s − f)) · \|d − s\| / d | Lensa tipis; s = jarak fokus, d = jarak objek (mm) |
| Motion blur | L = (v · f / D) · t | v = kecepatan objek, D = jarak objek |
| Batas aman genggam | t ≤ 1 / focal length (setara 35 mm) | Aturan resiprokal |
| Ekuivalen exposure | Naik 1 stop = N dibagi √2, atau t dikali 2, atau ISO dikali 2 | Dasar semua saran perubahan setelan |

## Basis pengetahuan sistem pakar

Didefinisikan di `lib/rules.js`. Inferensi memakai forward chaining satu tahap: setiap aturan dicek terhadap fakta (EXIF dan metrik piksel); aturan yang datanya tidak lengkap dilewati.

| Kode | Aturan | Kondisi (ringkas) | Data yang dibutuhkan |
|---|---|---|---|
| R01 | Risiko goyangan kamera | shutter > 1/focal length | shutter, focal, ISO |
| R02 | Foto terlalu gelap | rata-rata luminans < 0,25, highlight terpotong < 1% | piksel |
| R03 | Highlight terpotong | highlight terpotong > 5%, rata-rata > 0,55 | piksel |
| R04 | Kontras melebihi rentang dinamis | shadow terpotong > 10% dan highlight > 3% | piksel |
| R05 | ISO lebih tinggi dari perlu | ISO ≥ 800, shutter ≥ 1 stop lebih cepat dari 1/(2·focal) | ISO, shutter, focal |
| R06 | Noise kentara | ISO ≥ 3200 | ISO |
| R07 | Potret dengan aperture sempit | focal ≥ 70 mm, aperture ≥ f/5.6, bukan ponsel | aperture, focal, shutter |
| R08 | Lanskap dengan aperture lebar | focal ≤ 35 mm, aperture ≤ f/4, EV₁₀₀ ≥ 11, bukan ponsel | aperture, focal, shutter, ISO |
| R09 | Difraksi | aperture ≥ f/16, bukan ponsel | aperture |
| R10 | Foto kurang tajam | skor ketajaman < 60, rata-rata luminans ≥ 0,12 | piksel |
| R11 | Flash dengan shutter lambat | flash menyala, shutter > 1/60 | flash, shutter |
| R12 | Warna tidak netral | rasio merah/biru > 1,45 atau < 0,7 | piksel |
| R13 | Perkiraan kondisi cahaya | selalu, jika setelan lengkap | aperture, shutter, ISO |
| R14 | Exposure seimbang | tidak ada peringatan/saran yang terpicu | – |

Semua ambang batas dikumpulkan dalam konstanta `THRESHOLDS` agar mudah disesuaikan dan dilaporkan.

Saat menyarankan penambahan cahaya, sistem mengubah setelan dengan efek samping paling kecil lebih dulu: buka aperture (maks. f/2.8) → perlambat shutter selama masih aman → naikkan ISO. Untuk mengurangi cahaya urutannya: turunkan ISO → percepat shutter → kecilkan aperture (maks. f/11).

## Pengujian

### Unit test (otomatis)

```bash
npm test
```

| No | Pengujian | Hasil yang diharapkan |
|---|---|---|
| 1 | EV pada f/1, 1 detik | EV 0 |
| 2 | EV pada f/16, 1/125 | ≈ EV 15 (Sunny 16) |
| 3 | Resiprositas f/8 1/250 vs f/5.6 1/500 | EV sama |
| 4 | ISO dinaikkan dua kali lipat | Exposure bertambah tepat 1 stop |
| 5 | EV₁₀₀ dari f/2.8, 1/60, ISO 1600 | ≈ EV 5 |
| 6 | Shutter tepat untuk Sunny 16 di ISO 100 | 1/125 |
| 7 | Setiap latihan memiliki solusi | Kelima latihan bisa lulus |
| 8 | R01 pada 1/30 di 85 mm | Saran 1/100 dan ISO 640 |
| 9 | R01 pada 1/125 di 85 mm | Tidak terpicu |
| 10 | Foto tanpa EXIF | Aturan setelan dilewati, aturan piksel berjalan |
| 11 | R05 pada ISO 3200, 1/4000, 24 mm | Terpicu |
| 12 | Foto ponsel | R07 dan R09 tidak terpicu |
| 13 | Exposure seimbang | Muncul pesan R14 |
| 14 | Kuis: semua jawaban benar | Nilai 100 |
| 15 | Kuis: satu dari dua jawaban benar | Nilai 50 dan belum lulus |
| 16 | Kuis: soal tidak dijawab atau opsi asing | Dihitung salah |
| 17 | Ambang lulus kuis | Nilai 70 lulus pada `pass_score` 70 |
| 18 | Serialisasi jawaban kuis | Kunci string, nilai angka |

### Pengujian lain yang disarankan untuk laporan

- **Black Box Testing**: uji setiap fungsi dari sisi pengguna (unggah format salah, file > 25 MB, foto tanpa EXIF, setiap latihan, setiap kondisi cahaya, alur daftar → kursus → materi → kuis di LMS).
- **Pengujian akurasi ekstraksi EXIF**: bandingkan nilai yang dibaca sistem dengan alat lain seperti ExifTool pada beberapa foto dari kamera dan ponsel berbeda.
- **User Acceptance Testing (UAT)** atau **System Usability Scale (SUS)**: kuesioner kepada calon pengguna (siswa fotografi, instruktur).

## Penyederhanaan dan batasan

Simulator adalah alat bantu belajar, bukan simulasi optik penuh. Penyederhanaan berikut disengaja dan ditampilkan juga di halaman simulator:

- Exposure memakai nilai nominal yang tertera di kamera (misalnya f/5.6, padahal nilai sebenarnya 5,657), sehingga ada selisih pembulatan di bawah 0,1 EV.
- Kecerahan layar memakai kurva sederhana 2^(0,75 × Δ), bukan kurva tone kamera asli.
- Komposisi tidak berubah saat focal length diganti; yang dihitung hanya efek blurnya.
- Bokeh ditampilkan sebagai blur Gaussian, bukan cakram bokeh sesuai bentuk diafragma.
- Animasi mobil di live view dipercepat agar terlihat, tetapi panjang motion blur dihitung dari kecepatan asli 50 km/jam.
- Goyangan tangan dikalibrasi 1,5 px tepat di batas 1/focal length, tanpa memperhitungkan stabilisasi gambar (IS/VR/OIS).
- Noise naik per stop di atas ISO 100, tanpa memodelkan ukuran sensor atau pengolahan gambar kamera.
- Skor ketajaman (varians Laplacian) dan deteksi warna dominan adalah indikator perkiraan. Foto berkabut atau yang sengaja dibuat lembut bisa terdeteksi kurang tajam.
- Focal length setara 35 mm diasumsikan full-frame jika tidak tercatat di EXIF (kamera APS-C sebenarnya sekitar 1,5×).
- Sistem tidak mengetahui maksud fotografer. Saran seperti "latar bisa lebih kabur" ditulis bersyarat ("jika ini foto potret").

Batasan LMS pada prototype ini:

- Konten kursus diisi lewat SQL (`supabase/lms-seed.sql`) atau SQL Editor; belum ada editor kursus di UI.
- Nilai kuis dihitung di browser karena opsi benar masih dapat dibaca klien. Untuk produksi, penilaian dipindahkan ke fungsi sisi server.
- Dasbor instruktur dan rekap nilai per kelas belum tersedia.
- Markdown materi mendukung subset terbatas: judul, daftar, kutipan, kode, tebal, miring, dan tautan.

## Keamanan dan privasi

- Foto diproses sepenuhnya di browser pengguna dan tidak pernah dikirim ke server.
- Data lokasi GPS di EXIF sengaja tidak dibaca.
- Yang disimpan ke basis data hanya angka setelan dan metrik, bukan file foto.
- Validasi jenis dan ukuran file dilakukan sebelum diproses.
- Header keamanan HTTP diatur di `next.config.js` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- Hak akses data diatur oleh Row Level Security di PostgreSQL, bukan hanya di tampilan.
- Versi dependensi dipatok tepat; `postcss` dipaksa ke versi yang sudah menambal celah keamanan (`overrides` di `package.json`).
- Catatan: pada skema saat ini siswa masih bisa membaca kolom `is_correct` di `quiz_options`. Untuk versi produksi, penilaian kuis sebaiknya dipindahkan ke fungsi sisi server.

## Rencana pengembangan

Sudah selesai:

1. Halaman daftar dan masuk (Supabase Auth) dengan pembagian peran.
2. Alur LMS minimal: daftar kursus → modul → lesson → kuis → progres.
3. Menautkan lesson dengan latihan simulator (kolom `lessons.simulator_exercise_id`).
4. Dasbor siswa: progres kursus, nilai kuis, latihan simulator, dan analisis foto terakhir.

Prioritas berikutnya:

1. Dasbor instruktur untuk melihat progres siswa dan hasil latihan.
2. Penyuntingan kursus, modul, materi, dan kuis dari UI instruktur.
3. Penilaian kuis di fungsi server-side dan penyembunyian kolom `is_correct`.

Pengembangan lanjutan (dapat dimasukkan ke saran BAB V):

- Rantai inferensi bertingkat agar saran beberapa aturan digabung menjadi satu rekomendasi setelan.
- Klasifikasi jenis foto (potret, lanskap, olahraga) dengan machine learning untuk menyesuaikan aturan.
- Model machine learning untuk menilai kualitas exposure dari dataset foto berlabel.
- Simulasi bokeh berbentuk cakram, mode prioritas aperture/shutter, dan stabilisasi gambar.
