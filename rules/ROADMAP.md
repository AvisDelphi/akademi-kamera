# Roadmap Akademi Kamera

LMS fotografi berbasis web · Tugas Akhir S1 Sistem Informasi, FIK UPN "Veteran" Jakarta
Disusun: 12 November 2026 · Diperbarui: 12 November 2026

**Milestone terdekat: 20 November 2026 — laporan BAB I s.d. BAB III.** BAB I dan II sudah ada; BAB III belum dikerjakan. Pengembangan aplikasi dilanjutkan setelah milestone ini.

---

## 1. Ringkasan kondisi saat ini

Analisis dilakukan pada branch `main` (commit `08589a1`). Hasil pengecekan langsung:

- `npm test` → **18/18 lulus**
- `npm run build` → **berhasil**, 10 halaman ter-generate tanpa error

### Sudah selesai

| Area | Fitur | Lokasi kode |
|---|---|---|
| Fitur utama 1 | Simulator kamera (aperture, shutter, ISO, focal length, tripod), meter EV ±3 langkah 1/3 stop, 4 kondisi cahaya, 5 latihan terpandu dengan kriteria lulus | `components/simulator/*`, `lib/exposure.js`, `lib/exercises.js` |
| Fitur utama 2 | Ekstraksi EXIF (dengan fallback APEX), analisis piksel (histogram, clipping, ketajaman, warna), sistem pakar 14 aturan, tabel "mengapa saran ini muncul", penanganan EXIF hilang/sebagian | `components/analyzer/PhotoAnalyzer.js`, `lib/exif.js`, `lib/imageAnalysis.js`, `lib/rules.js` |
| LMS siswa | Daftar, masuk, katalog, pendaftaran kursus, materi Markdown, tandai selesai, kuis, riwayat nilai, dasbor siswa | `app/kursus/*`, `components/lms/*`, `lib/lms.js` |
| Basis data | 12 tabel, Row Level Security, trigger profil otomatis, seed 2 kursus / 10 materi / 3 kuis | `supabase/schema.sql`, `supabase/lms-seed.sql` |
| Kualitas | Unit test rumus, aturan, dan kuis; header keamanan HTTP; versi dependensi dipatok | `tests/*`, `next.config.js` |

### Belum dibuat (gap analysis)

Diurutkan dari yang paling berdampak pada sidang.

| # | Yang belum ada | Dampak | Prioritas |
|---|---|---|---|
| G1 | **Halaman admin**: kelola pengguna dan ubah peran. Saat ini peran hanya bisa diubah lewat SQL Editor Supabase | Peran `admin` ada di use case tetapi tidak punya antarmuka; mudah dipertanyakan penguji | Wajib |
| G2 | **Dasbor instruktur**: rekap siswa per kursus, progres materi, nilai kuis, hasil latihan simulator | Peran `instructor` tidak punya antarmuka sama sekali | Wajib |
| G3 | **Editor kursus di UI**: CRUD kursus, modul, materi, kuis, dan tombol publikasi. Saat ini konten hanya lewat SQL | Inti dari "Learning *Management* System"; tanpa ini sistem lebih mirip e-learning statis | Wajib (versi minimal) |
| G4 | **Penilaian kuis di sisi server**. Kolom `is_correct` terbaca oleh siswa, dan siswa bisa `insert` nilai sembarang ke `quiz_attempts` | Celah keamanan nyata: siswa bisa melihat kunci jawaban dan memalsukan nilai | Wajib |
| G5 | **Bug RLS** `quiz_questions` dan `quiz_options`: kebijakan tulis hanya memeriksa peran, sehingga **instruktur mana pun bisa mengubah soal milik instruktur lain** | Pelanggaran hak akses antarinstruktur | Wajib |
| G6 | Penjaga halaman berbasis peran (route guard) di UI | Halaman admin/instruktur yang baru butuh ini | Wajib (bersama G1–G3) |
| G7 | `lesson_progress` bisa diisi untuk materi kursus yang belum dipublikasikan | Celah kecil, mudah ditutup | Sebaiknya |
| G8 | Lupa kata sandi dan ubah profil (nama) | Fitur akun standar | Sebaiknya |
| G9 | Inkonsistensi dokumen: README menyebut "13 aturan", padahal `lib/rules.js` berisi 14 (R01–R14) | Angka di laporan harus konsisten dengan kode | Wajib (5 menit) |
| G10 | Deploy produksi dan akun demo untuk tiga peran | Diperlukan untuk demo sidang dan UAT/SUS | Wajib |
| G11 | Artefak perancangan: use case, activity, sequence, class diagram, ERD | Wajib untuk BAB IV laporan | Wajib |
| G12 | Pengujian Black Box, uji akurasi EXIF vs ExifTool, kuesioner SUS | Wajib untuk BAB IV laporan | Wajib |
| G13 | ESLint, CI GitHub Actions, end-to-end test | Nilai tambah, bukan syarat lulus | Ditunda |
| G14 | Materi berurutan (terkunci sampai materi sebelumnya selesai), sertifikat, unggah gambar materi | Nilai tambah | Ditunda |
| G15 | Machine learning untuk klasifikasi jenis foto / penilaian exposure | Sudah tepat ditaruh sebagai saran BAB V | Pekerjaan lanjutan |

---

## 2. Prinsip penjadwalan

Tenggat 20 November hanya mencakup BAB I–III, jadi delapan hari ke depan diprioritaskan untuk **menulis BAB III**. Kode hanya disentuh untuk perbaikan kecil yang murah dan berisiko tinggi (Sprint 4). Sprint 5–7 dikerjakan setelah BAB III dikumpulkan.

Gap aplikasi tetap memakai prioritas **MoSCoW**:

- **Must**: G1–G6, G9–G12 → harus selesai sebelum *code freeze*.
- **Should**: G7, G8 → dikerjakan hanya jika sprint selesai lebih awal.
- **Won't (sekarang)**: G13–G15 → dicatat sebagai batasan dan saran pengembangan di BAB V.

Aturan yang dipegang:

1. **Sampai 20 November, BAB III didahulukan atas fitur baru.** Kode hanya untuk Sprint 4. Code freeze aplikasi ditetapkan ulang setelah tanggal sidang diketahui (sekitar 2 hari sebelum sidang).
2. **Editor kursus dibuat minimal**: formulir biasa, urutan diatur lewat angka `position`, tanpa drag-and-drop, tanpa editor WYSIWYG (cukup `<textarea>` Markdown + pratinjau memakai `components/lms/Markdown.js` yang sudah ada).
3. **Keamanan ditegakkan di basis data (RLS + fungsi Postgres), bukan hanya di UI.** Route guard di UI hanya untuk kenyamanan tampilan.
4. Setiap sprint ditutup dengan `npm test` dan `npm run build` yang lulus, lalu commit sesuai `rules/GIT_RULES.md`.

---

## 3. Milestone 20 November — BAB III Metode Penelitian

### 3.1 Keputusan yang harus diambil dulu: metode pengembangan

Metode menentukan isi seluruh BAB III (flowchart, sub-bab, dan jadwal), jadi diputuskan paling awal.

**Rekomendasi: Scrum yang disesuaikan untuk pengembang tunggal.** Alasannya:

- Roadmap ini sudah tersusun dalam sprint dan product backlog, sehingga yang ditulis di BAB III sama dengan yang benar-benar dikerjakan.
- Prototype yang sudah ada dapat dilaporkan apa adanya sebagai **inkremen sprint awal**, bukan disembunyikan. Pada Waterfall, adanya kode sebelum tahap desain selesai justru bertentangan dengan metode.
- Sumber utamanya jelas dan dapat diverifikasi: Schwaber & Sutherland, *The Scrum Guide* (edisi November 2020).

Konsekuensi yang perlu disebutkan jujur di laporan: Scrum aslinya untuk tim (Product Owner, Scrum Master, Developers). Pada TA, ketiga peran dirangkap penulis, dan dosen pembimbing / calon pengguna berperan sebagai *stakeholder* pada sprint review.

> Cek BAB I: jika di sana sudah tertulis metode lain (mis. RAD atau Prototype), samakan dulu. BAB I dan BAB III tidak boleh menyebut metode berbeda.

### 3.2 Kerangka BAB III

Disusun mengikuti Pedoman TA FIK 2025 (3.1 tahapan penelitian dengan flowchart, 3.2 alat dan bahan, 3.3 jadwal) dan pola dua contoh skripsi FIK di file proyek.

```
BAB III METODE PENELITIAN
3.1 Tahapan Penelitian            ← Gambar 3.1 flowchart
    3.1.1 Identifikasi Masalah
    3.1.2 Pengumpulan Data (studi pustaka, wawancara, kuesioner)
    3.1.3 Penyusunan Product Backlog (analisis kebutuhan)
    3.1.4 Pelaksanaan Sprint
          a. Sprint Planning
          b. Perancangan (use case, activity, sequence, ERD)
          c. Implementasi (coding)
          d. Pengujian unit
          e. Sprint Review dan Retrospective
    3.1.5 Pengujian Sistem (Black Box, akurasi EXIF, SUS)
    3.1.6 Kesimpulan dan Saran
3.2 Alat dan Bahan Penelitian
    3.2.1 Perangkat Keras
    3.2.2 Perangkat Lunak
    3.2.3 Bahan (data kuesioner, foto uji, materi fotografi)
3.3 Waktu dan Tempat Penelitian
3.4 Jadwal Penelitian            ← tabel/Gantt berisi sprint
```

Catatan penting untuk 3.1.2: topik ini tidak memiliki objek perusahaan seperti contoh skripsi di file proyek. Sumber data primer harus disebutkan secara konkret, misalnya kuesioner kebutuhan kepada mahasiswa/UKM fotografi dan wawancara dengan satu fotografer atau pengajar fotografi. Sumber ini harus sama dengan yang disebut di latar belakang BAB I, dan harus benar-benar dilakukan karena hasilnya dipakai lagi di BAB IV.

Rumusan 3.1.5 yang perlu disiapkan: jumlah responden SUS, cara menghitung skor SUS (Brooke, 1996), jumlah foto uji EXIF beserta alat pembanding (ExifTool), dan format tabel Black Box.

### 3.3 Jadwal penulisan BAB III

| Tanggal | Target | Hasil |
|---|---|---|
| 12 Nov | Putuskan metode, cek konsistensi dengan BAB I; Sprint 4 (perbaikan RLS, ±3 jam) | Metode final |
| 13 Nov | Flowchart tahapan penelitian (Gambar 3.1) | Gambar 3.1 |
| 14 Nov | 3.1.1 dan 3.1.2; siapkan kuesioner & pertanyaan wawancara | Draf sub-bab, Google Form |
| 15 Nov | 3.1.3 Product Backlog (tabel kebutuhan fungsional dan non-fungsional, prioritas MoSCoW) | Tabel backlog |
| 16 Nov | 3.1.4 Pelaksanaan Sprint (termasuk rencana isi tiap sprint) | Draf sub-bab |
| 17 Nov | 3.1.5–3.1.6 dan 3.2 Alat dan Bahan | Draf sub-bab |
| 18 Nov | 3.3 Waktu dan Tempat, 3.4 Jadwal (Gantt) | Tabel jadwal |
| 19 Nov | Baca ulang BAB I–III untuk konsistensi istilah, metode, dan rumusan masalah; rapikan daftar pustaka | Draf final |
| 20 Nov | Buffer dan pengumpulan | BAB I–III dikumpulkan |

Isi 3.2 yang sudah bisa diambil dari repo: Node.js ≥ 20, Next.js 15.5, React 19, Tailwind CSS 4, Supabase (PostgreSQL + Auth), exifr 7.1.3, Vercel, Git/GitHub, serta browser untuk pengujian. Spesifikasi laptop diisi sendiri.

---

## 4. Sprint pengembangan aplikasi

Penomoran mengikuti KEBUTUHAN_SISTEM.md: Sprint 1–3 adalah prototype yang sudah selesai (simulator, analisis foto, LMS siswa). Daftar FR/NFR per sprint ada di dokumen tersebut.

Sprint 4 dikerjakan sebelum 20 November. Sprint 5–7 dikerjakan setelahnya; tanggal pasti menyesuaikan jadwal sidang.

Estimasi memakai asumsi ±8 jam kerja efektif per hari.

### Sprint 4 — Stabilisasi dan perbaikan keamanan (12–13 November, ±5 jam, di sela penulisan BAB III)

Tujuan: fondasi aman dan bisa didemokan sebelum menambah fitur.

- [x] **G5** Perbaiki kebijakan RLS `owner writes questions` dan `owner writes options` agar memeriksa kepemilikan kursus lewat rantai `quiz → lesson → module → course`, sama seperti kebijakan `owner writes quizzes`.
  - File: `supabase/migrations/20261112000000_fix_quiz_rls.sql` (baru), dan sinkronkan ke `supabase/schema.sql`.
- [x] **G7** Batasi `insert` pada `lesson_progress` hanya untuk materi dari kursus yang `is_published`.
- [x] **G9** Ubah "13 aturan" menjadi "14 aturan" di README.
- [ ] **G10** Deploy ke Vercel, jalankan `schema.sql` + `lms-seed.sql` di Supabase produksi, buat 3 akun demo (`siswa@`, `instruktur@`, `admin@`).
- [ ] Tambahkan test RLS manual sederhana: login sebagai instruktur B, coba ubah soal instruktur A → harus gagal. Catat hasilnya; ini langsung jadi satu baris tabel Black Box.

**Definition of Done:** situs produksi bisa dibuka, ketiga akun bisa login, migrasi RLS terpasang, uji instruktur B gagal mengubah soal instruktur A.

---

### Sprint 5 — Penilaian kuis di server dan panel admin (setelah 20 November, ±2 hari)

Tujuan: menutup celah kunci jawaban dan memberi peran admin antarmukanya.

**Penilaian kuis di server (G4)**

- [ ] Buat fungsi Postgres `public.submit_quiz_attempt(p_quiz_id bigint, p_answers jsonb)` dengan `security definer`: menilai jawaban di server, menyimpan ke `quiz_attempts`, dan mengembalikan skor beserta status lulus.
- [ ] Hapus kebijakan `own quiz attempts insert` agar siswa tidak bisa menyisipkan nilai langsung.
- [ ] Sembunyikan kolom `is_correct` dari peran `anon` dan `authenticated` dengan *column privileges* (`revoke select` tabel, lalu `grant select (id, question_id, label)`).
- [ ] Sediakan fungsi `get_quiz_answer_key(p_quiz_id)` (`security definer`, hanya untuk pemilik kursus/admin) untuk editor kuis di Sprint 6, karena instruktur juga memakai peran `authenticated`.
- [ ] Ubah `lib/lms.js` (`getQuiz`, `saveQuizAttempt`) dan `components/lms/QuizRunner.js` agar memanggil `supabase.rpc(...)`. Pembahasan jawaban benar ditampilkan dari hasil fungsi, setelah kuis dikumpulkan.
- [ ] Pertahankan `lib/quiz.js` sebagai logika acuan dan tetap diuji; samakan logikanya dengan fungsi SQL.

> **Alasan untuk sidang:** browser memegang *anon key* publik, jadi apa pun yang bisa dibaca klien dianggap bisa dibaca siswa. Penilaian yang adil harus terjadi di tempat yang tidak bisa dimanipulasi siswa, yaitu basis data.

**Panel admin (G1, G6)**

- [ ] Komponen penjaga peran `components/auth/RequireRole.js` (menampilkan "akses ditolak" jika peran tidak sesuai).
- [ ] Halaman `app/admin/pengguna/page.js` + `components/admin/UserManager.js`: daftar pengguna, cari nama, ubah peran. RLS `admin manages profiles` sudah ada, jadi tidak perlu fungsi server baru.
- [ ] Email pengguna tidak tersedia di `profiles`. Pilihan paling sederhana: tambahkan kolom `email` yang diisi oleh trigger `handle_new_user` (migrasi baru) agar admin bisa mengenali akun.
- [ ] Tautan "Admin" di `components/SiteHeader.js` hanya untuk peran admin.

**Definition of Done:** siswa tidak bisa membaca `is_correct` lewat konsol browser, nilai hanya tercatat lewat RPC, admin dapat menaikkan siswa menjadi instruktur dari UI.

---

### Sprint 6 — Dasbor dan editor instruktur (±3 hari)

Tujuan: peran instruktur bisa mengelola konten dan memantau siswa. Ini sprint terbesar dan paling berisiko.

**Editor kursus minimal (G3)**, dikerjakan berurutan:

- [ ] `app/instruktur/page.js` → daftar kursus milik instruktur + tombol "Kursus baru".
- [ ] `app/instruktur/kursus/[courseId]/page.js` → ubah judul, deskripsi, level, status publikasi; daftar modul.
- [ ] Tambah/ubah/hapus modul dan materi (judul, `position`, `content_md` dengan pratinjau, pilihan `simulator_exercise_id` dari `lib/exercises.js`).
- [ ] Pembuat kuis: judul, `pass_score`, soal, opsi, tandai jawaban benar (memakai `get_quiz_answer_key` dari Sprint 5).
- [ ] Fungsi data baru di `lib/instructor.js` agar komponen tetap tidak memanggil Supabase langsung, konsisten dengan pola `lib/lms.js`.

**Dasbor instruktur (G2)**

- [ ] Per kursus: jumlah siswa terdaftar, persentase materi selesai per siswa, nilai kuis terakhir, jumlah latihan simulator yang lulus.
- [ ] Semua data ini sudah bisa dibaca instruktur lewat RLS `staff read ...`. Catatan: kebijakan itu mengizinkan instruktur membaca aktivitas **semua** siswa, bukan hanya siswa di kursusnya. Untuk prototype dapat diterima, tetapi tulis sebagai batasan di laporan.

**Rencana cadangan jika waktu habis:** pembuat kuis di UI boleh dipangkas; kuis tetap bisa diisi lewat seed SQL. Prioritaskan CRUD kursus/modul/materi + publikasi + dasbor, karena itu yang membuktikan fungsi "management".

**Definition of Done:** instruktur demo bisa membuat kursus baru berisi 1 modul, 1 materi, dan (jika sempat) 1 kuis, mempublikasikannya, lalu melihat siswa demo mengerjakannya di dasbor.

**Code freeze: ±2 hari sebelum sidang.**

---

### Sprint 7 — Pengujian dan artefak perancangan (±2 hari, bisa paralel dengan akhir Sprint 6)

Jika waktu tersisa, kerjakan lebih dulu FR-34 (lupa kata sandi) dan FR-35 (ubah nama tampilan); lihat KEBUTUHAN_SISTEM.md.

Tujuan: menghasilkan bahan BAB IV.

**Diagram (G11)**, cukup satu set yang konsisten dengan kode:

- [ ] Use case diagram: 3 aktor (siswa, instruktur, admin) + pengunjung tanpa login (simulator dan analisis foto tetap bisa dipakai).
- [ ] Activity diagram: (1) latihan simulator, (2) analisis foto termasuk cabang EXIF hilang, (3) mengerjakan kuis, (4) instruktur membuat kursus.
- [ ] Sequence diagram: analisis foto (browser → exifr → imageAnalysis → mesin aturan → Supabase) dan submit kuis lewat RPC.
- [ ] ERD dari `supabase/schema.sql` (12 tabel).
- [ ] Class/modul diagram untuk `lib/` (karena kode berbasis modul fungsi, bukan kelas; jelaskan ini bila ditanya).
- [ ] Tabel basis pengetahuan sistem pakar (R01–R14) beserta pohon/tabel keputusan.

**Pengujian (G12)**

- [ ] **Black Box Testing**: tabel skenario per fitur (input, output yang diharapkan, hasil, status). Minimal mencakup: autentikasi, setiap peran, 5 latihan, 4 kondisi cahaya, unggah format salah dan file > 25 MB, foto tanpa EXIF, foto ponsel, kuis lulus/gagal, uji akses lintas instruktur (Sprint 4), uji siswa membaca `is_correct` (Sprint 5).
- [ ] **Uji akurasi ekstraksi EXIF**: ±10–15 foto dari beberapa kamera dan ponsel, bandingkan nilai sistem dengan ExifTool, hitung persentase kecocokan per atribut.
- [ ] **Uji akurasi saran**: beberapa foto dinilai oleh fotografer/dosen pembanding, lalu dibandingkan dengan aturan yang terpicu (opsional, tetapi memperkuat klaim sistem pakar).
- [ ] **System Usability Scale (SUS)**: 10 butir standar, skala 1–5, dibagikan lewat Google Form setelah responden mencoba situs produksi. Hitung skor per responden dan rata-rata, lalu tafsirkan memakai skala penafsiran SUS yang dirujuk dari sumber aslinya.
- [ ] Unit test tambahan untuk logika baru (mis. fungsi bantu di `lib/instructor.js`).

**Definition of Done:** semua diagram tersimpan sebagai gambar, tabel Black Box terisi, data SUS terkumpul (sebarkan kuesioner paling lambat 3 hari sebelum target BAB IV agar respons sempat masuk).

---

### Tahap akhir — Laporan BAB IV–V, finalisasi, dan latihan sidang (±2 hari)

- [ ] Tulis BAB IV Hasil dan Pembahasan: rancangan sistem usulan, implementasi (tangkapan layar per halaman), hasil pengujian.
- [ ] Tulis BAB V Penutup: kesimpulan menjawab setiap rumusan masalah; saran = item "Won't" (G13–G15).
- [ ] Perbarui README: status, fitur baru, tabel pengujian.
- [ ] Rekam video demo cadangan jika internet saat sidang bermasalah.
- [ ] Siapkan jawaban pertanyaan sidang (bagian 6).

---

## 5. Kesesuaian dengan Pedoman TA FIK 2025

Pedoman TA FIK 2025 (file proyek) memakai struktur laporan skripsi berikut, yang **berbeda** dari struktur umum BAB III "Analisis & Perancangan":

| Bab | Isi menurut pedoman |
|---|---|
| BAB I Pendahuluan | Latar belakang, rumusan masalah, batasan masalah, tujuan dan manfaat, sistematika penulisan |
| BAB II Tinjauan Pustaka | Kajian teoretis; penelitian terdahulu minimal 5 jurnal (3 nasional, 2 internasional), terbitan 5 tahun terakhir |
| BAB III Metode Penelitian | Tahapan penelitian (flowchart + penjelasan), alat dan bahan, jadwal penelitian |
| BAB IV Hasil dan Pembahasan | Profil, analisis sistem berjalan, rancangan sistem usulan, hasil dan rekomendasi |
| BAB V Penutup | Kesimpulan dan saran |

Daftar pustaka menurut pedoman: minimal 5 jurnal nasional, 5 jurnal internasional, 5 buku, dan di dalamnya minimal 2 publikasi dosen FIK. Cek ulang ketentuan ini dengan pembimbing.

Akibatnya: diagram dan rancangan basis data masuk ke **BAB IV (4.3 Rancangan Sistem Usulan)**, bukan BAB III. BAB III cukup berisi alur metode pengembangan.

**Metode pengembangan:** sprint di roadmap ini paling cocok dijelaskan sebagai **Scrum yang disederhanakan** (pengembang tunggal, sprint 1–3 hari, product backlog = tabel gap di atas). Jika proposal yang sudah disetujui menyebut metode lain (mis. Prototype atau RAD), tetap pakai metode di proposal dan petakan sprint ini ke tahapan metode tersebut agar BAB III tidak bertentangan dengan proposal.

---

## 6. Keputusan yang perlu bisa dipertahankan saat sidang

| Pertanyaan yang mungkin muncul | Inti jawaban |
|---|---|
| Kenapa Next.js + Supabase, bukan Laravel + MySQL? | Satu bahasa (JavaScript) untuk simulator interaktif dan backend; Supabase menyediakan Auth dan PostgreSQL dengan RLS sehingga hak akses dijaga di level basis data; deploy gratis di Vercel. |
| Kalau browser langsung mengakses basis data, apa tidak berbahaya? | *Anon key* memang publik. Keamanan bertumpu pada RLS dan fungsi `security definer`, bukan pada kerahasiaan kunci. Contoh nyata: celah kunci jawaban kuis ditemukan lalu ditutup dengan RPC di Sprint 5. |
| Kenapa foto tidak diunggah ke server? | Privasi: EXIF dan piksel diproses di browser, GPS tidak dibaca, yang disimpan hanya angka setelan dan metrik. Juga menghemat penyimpanan. |
| Kenapa sistem pakar berbasis aturan, bukan machine learning? | Tidak butuh dataset berlabel, setiap saran bisa dijelaskan (tabel "mengapa saran ini muncul"), ambang batas terdokumentasi di `THRESHOLDS`. ML ditempatkan sebagai pengembangan lanjutan. |
| Seberapa akurat simulatornya? | Rumus exposure tepat (EV = log₂(N²/t), resiprositas, 1 stop = ×2 cahaya) dan diuji unit test. Efek visual (bokeh, noise, kurva kecerahan) sengaja disederhanakan; daftar penyederhanaannya ada di README dan halaman simulator. |
| Kenapa instruktur bisa melihat aktivitas semua siswa? | Batasan prototype yang disadari; perbaikannya adalah membatasi kebijakan `staff read` pada siswa yang terdaftar di kursus milik instruktur tersebut. |

---

## 7. Risiko dan mitigasi

| Risiko | Kemungkinan | Mitigasi |
|---|---|---|
| Editor kursus memakan waktu lebih lama dari perkiraan | Tinggi | Potong pembuat kuis dulu; kuis lewat seed SQL. Jangan tambah drag-and-drop atau WYSIWYG. |
| Responden SUS kurang | Sedang | Sebarkan kuesioner jauh sebelum BAB IV ke teman kelas fotografi/UKM. |
| BAB III menyebut metode atau sumber data yang berbeda dari BAB I | Sedang | Cek konsistensi pada 12 dan 19 November. |
| Wawancara/kuesioner kebutuhan belum dilakukan padahal disebut di BAB III | Sedang | Siapkan instrumennya 14 November dan jalankan secepatnya. |
| Tergoda menambah fitur sebelum BAB III selesai | Tinggi | Sampai 20 November, kode hanya untuk Sprint 4. |
| Migrasi RLS atau RPC merusak alur kuis yang sudah jalan | Sedang | Uji di project Supabase terpisah dulu; simpan skrip rollback. |
| Kuota Supabase gratis / project di-pause karena tidak aktif | Rendah | Buka dasbor Supabase sehari sebelum sidang; siapkan video demo. |
| Waktu laporan terdesak oleh coding | Tinggi | Code freeze ±2 hari sebelum sidang dipegang ketat. |

---

## 8. Backlog setelah tenggat (bahan BAB V Saran)

- Lupa kata sandi dan halaman profil (jika tidak sempat di Sprint 7).
- Materi berurutan, sertifikat kelulusan kursus, unggah gambar materi lewat Supabase Storage.
- Membatasi akses instruktur hanya pada siswa di kursusnya.
- ESLint, GitHub Actions CI, dan end-to-end test.
- Rantai inferensi bertingkat agar beberapa saran digabung menjadi satu rekomendasi setelan.
- Klasifikasi jenis foto (potret, lanskap, olahraga) dan penilaian kualitas exposure dengan machine learning.
- Simulasi bokeh berbentuk cakram, mode prioritas aperture/shutter, dan stabilisasi gambar.
