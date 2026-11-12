# Spesifikasi Kebutuhan Sistem Akademi Kamera

Kebutuhan fungsional (FR) dan non-fungsional (NFR), dibagi per sprint
Disusun: 12 November 2026 · Acuan kode: `AvisDelphi/akademi-kamera`, branch `main`

---

## 1. Cara membaca dokumen ini

Dokumen ini adalah **product backlog** Akademi Kamera dalam bentuk daftar kebutuhan. Dokumen ini dipakai untuk subbab 3.1.3 (Penyusunan Product Backlog) dan sebagai acuan pengujian Black Box di BAB IV.

**Penomoran sprint.** Sprint 1–3 adalah prototype yang sudah dibangun dan dilaporkan sebagai inkremen awal. Sprint 4–7 adalah pekerjaan yang direncanakan. Pemetaannya ke ROADMAP.md:

| Sprint di dokumen ini | Status | Di ROADMAP.md |
|---|---|---|
| Sprint 1 Simulator kamera | Selesai | Bagian "Sudah selesai" |
| Sprint 2 Analisis foto & sistem pakar | Selesai | Bagian "Sudah selesai" |
| Sprint 3 LMS siswa & autentikasi | Selesai | Bagian "Sudah selesai" |
| Sprint 4 Stabilisasi & keamanan | Direncanakan (12–13 Nov) | Sprint 4 |
| Sprint 5 Penilaian kuis di server & panel admin | Direncanakan | Sprint 5 |
| Sprint 6 Instruktur | Direncanakan | Sprint 6 |
| Sprint 7 Fitur akun & pengujian sistem | Direncanakan | Sprint 7 |

> **Perlu Anda sesuaikan:** riwayat Git hanya berisi satu commit awal, sehingga urutan Sprint 1–3 di atas disusun berdasarkan kelompok fitur, bukan dari catatan waktu. Jika urutan pengerjaan Anda sebenarnya berbeda, ubah urutannya agar laporan sesuai dengan yang benar-benar terjadi.

**Kolom tabel.**
- **Aktor:** Pengunjung (belum login), Siswa, Instruktur, Admin, Sistem.
- **Prioritas** (MoSCoW): M = Must, S = Should, C = Could.
- **Status:** Selesai / Direncanakan.

---

## 2. Aktor

| Aktor | Deskripsi | Peran di basis data |
|---|---|---|
| Pengunjung | Orang yang belum login. Dapat memakai simulator dan analisis foto, tetapi hasilnya tidak disimpan | tanpa sesi (`anon`) |
| Siswa | Pengguna terdaftar yang mengikuti kursus, mengerjakan kuis, dan menyimpan riwayat latihan | `student` (peran bawaan saat registrasi) |
| Instruktur | Pembuat dan pengelola konten kursus serta pemantau perkembangan siswa | `instructor` |
| Admin | Pengelola pengguna dan peran | `admin` |

---

## 3. Kebutuhan fungsional per sprint

### Sprint 1 — Simulator kamera (Selesai)

Sprint goal: siswa dapat bereksperimen dengan segitiga exposure dan langsung melihat efeknya.

| ID | Aktor | Kebutuhan | Prioritas | Status |
|---|---|---|---|---|
| FR-01 | Pengunjung, Siswa | Sistem menyediakan kontrol untuk mengatur aperture (f-stop), shutter speed, dan ISO pada simulator | M | Selesai |
| FR-02 | Pengunjung, Siswa | Sistem menyediakan pengaturan focal length dan pilihan memakai tripod | M | Selesai |
| FR-03 | Sistem | Sistem memperbarui pratinjau secara langsung: aperture memengaruhi blur latar (depth of field), shutter memengaruhi motion blur dan goyangan kamera, ISO memengaruhi noise, dan ketiganya memengaruhi kecerahan | M | Selesai |
| FR-04 | Pengunjung, Siswa | Sistem menyediakan empat kondisi cahaya: siang terik, berawan, senja, dan jalan kota malam | M | Selesai |
| FR-05 | Sistem | Sistem menampilkan meter exposure dalam rentang ±3 EV dengan langkah 1/3 stop beserta status *under*, tepat, atau *over* | M | Selesai |
| FR-06 | Pengunjung, Siswa | Sistem menyediakan lima latihan terpandu (membekukan mobil, blur latar potret, motion blur, memotret malam tanpa tripod, aturan Sunny 16) beserta petunjuk dan penilaian lulus otomatis per kriteria | M | Selesai |
| FR-07 | Siswa | Sistem menyimpan hasil percobaan latihan (setelan, metrik, status lulus) untuk siswa yang sudah login | S | Selesai |

### Sprint 2 — Analisis foto dan sistem pakar (Selesai)

Sprint goal: siswa dapat mengunggah foto dan memperoleh saran perbaikan setelan yang bisa dijelaskan.

| ID | Aktor | Kebutuhan | Prioritas | Status |
|---|---|---|---|---|
| FR-08 | Pengunjung, Siswa | Sistem menerima unggahan foto berformat JPEG, PNG, WebP, HEIC/HEIF, atau TIFF berukuran maksimal 25 MB, dan menolak file di luar ketentuan dengan pesan yang jelas | M | Selesai |
| FR-09 | Sistem | Sistem mengekstrak EXIF: aperture, shutter speed, ISO, focal length (termasuk ekuivalen 35 mm), kamera, lensa, tanggal pengambilan, mode exposure, mode metering, kompensasi exposure, flash, dan white balance. Jika nilai langsung tidak ada, aperture dan shutter dihitung dari nilai APEX | M | Selesai |
| FR-10 | Sistem | Jika EXIF tidak ada atau hanya sebagian, sistem memberi tahu atribut yang hilang dan tetap memberi saran dari analisis piksel | M | Selesai |
| FR-11 | Sistem | Sistem menganalisis piksel foto: histogram kecerahan, area terlalu gelap/terang (*clipping*), tingkat ketajaman, dan kecenderungan warna | M | Selesai |
| FR-12 | Sistem | Sistem menghasilkan saran perbaikan dengan mesin inferensi berbasis aturan (14 aturan, R01–R14) dari fakta EXIF dan hasil analisis piksel | M | Selesai |
| FR-13 | Pengunjung, Siswa | Sistem menampilkan alasan setiap saran (fakta dan aturan yang terpicu) | M | Selesai |
| FR-14 | Siswa | Sistem menyimpan ringkasan analisis (setelan, metrik, ID aturan yang terpicu), tanpa menyimpan file fotonya, untuk siswa yang sudah login | S | Selesai |

### Sprint 3 — LMS siswa dan autentikasi (Selesai)

Sprint goal: siswa dapat mengikuti kursus terstruktur dari awal sampai kuis.

| ID | Aktor | Kebutuhan | Prioritas | Status |
|---|---|---|---|---|
| FR-15 | Pengunjung | Sistem menyediakan registrasi akun; akun baru otomatis berperan siswa | M | Selesai |
| FR-16 | Siswa, Instruktur, Admin | Sistem menyediakan login dan logout | M | Selesai |
| FR-17 | Pengunjung, Siswa | Sistem menampilkan katalog kursus yang sudah dipublikasikan | M | Selesai |
| FR-18 | Siswa | Sistem menampilkan detail kursus (modul dan materi) dan memungkinkan siswa mendaftar ke kursus | M | Selesai |
| FR-19 | Siswa | Sistem menampilkan materi berformat Markdown, beserta tautan ke latihan simulator yang terkait | M | Selesai |
| FR-20 | Siswa | Sistem memungkinkan siswa menandai materi selesai dan menampilkan persentase progres kursus | M | Selesai |
| FR-21 | Siswa | Sistem menyediakan kuis pilihan ganda, menghitung nilai, menentukan lulus/tidak berdasarkan nilai minimum, dan menampilkan pembahasan | M | Selesai (pembahasan berupa jawaban yang benar; belum ada teks penjelasan per soal) |
| FR-22 | Siswa | Sistem menyimpan dan menampilkan riwayat nilai kuis | S | Selesai |
| FR-23 | Siswa | Sistem menampilkan dasbor siswa: kursus diikuti, progres, dan aktivitas terakhir | M | Selesai |

### Sprint 4 — Stabilisasi dan keamanan (Direncanakan, 12–13 November)

Sprint goal: menutup celah hak akses sebelum fitur baru ditambahkan. Sprint ini **tidak menambah FR**; seluruh itemnya adalah NFR keamanan (NFR-S03, NFR-S04) dan kesiapan demo (NFR-P01).

### Sprint 5 — Penilaian kuis di server dan panel admin (Direncanakan)

Sprint goal: nilai kuis tidak dapat dimanipulasi, dan admin dapat mengelola peran tanpa SQL.

| ID | Aktor | Kebutuhan | Prioritas | Status |
|---|---|---|---|---|
| FR-24 | Sistem | Sistem menilai jawaban kuis di server dan baru menampilkan kunci jawaban serta pembahasan setelah kuis dikumpulkan | M | Selesai (diuji di Postgres lokal dan Supabase tiruan; belum di Supabase sungguhan) |
| FR-25 | Admin | Sistem menampilkan daftar pengguna beserta perannya, dengan pencarian berdasarkan nama atau email | M | Direncanakan |
| FR-26 | Admin | Sistem memungkinkan admin mengubah peran pengguna (siswa, instruktur, admin) | M | Direncanakan |
| FR-27 | Sistem | Sistem menampilkan menu sesuai peran dan menampilkan pesan "akses ditolak" jika pengguna membuka halaman di luar perannya | M | Direncanakan |

### Sprint 6 — Instruktur (Direncanakan)

Sprint goal: instruktur dapat mengelola konten kursus dan memantau siswa.

| ID | Aktor | Kebutuhan | Prioritas | Status |
|---|---|---|---|---|
| FR-28 | Instruktur | Sistem memungkinkan instruktur membuat, mengubah, dan menghapus kursus miliknya (judul, deskripsi, level) | M | Direncanakan |
| FR-29 | Instruktur | Sistem memungkinkan instruktur mempublikasikan atau menyembunyikan kursus | M | Direncanakan |
| FR-30 | Instruktur | Sistem memungkinkan instruktur mengelola modul (tambah, ubah, hapus, atur urutan dengan nomor posisi) | M | Direncanakan |
| FR-31 | Instruktur | Sistem memungkinkan instruktur mengelola materi (isi Markdown dengan pratinjau, urutan, dan latihan simulator terkait) | M | Direncanakan |
| FR-32 | Instruktur | Sistem memungkinkan instruktur mengelola kuis (soal, opsi jawaban, jawaban benar, nilai minimum lulus) | S | Direncanakan (dapat ditunda; kuis tetap bisa diisi lewat seed SQL) |
| FR-33 | Instruktur | Sistem menampilkan dasbor instruktur: jumlah siswa per kursus, progres materi tiap siswa, nilai kuis, dan latihan simulator yang lulus | M | Direncanakan |

### Sprint 7 — Fitur akun dan pengujian sistem (Direncanakan, kondisional)

Sprint goal: melengkapi fitur akun jika waktu tersedia, lalu melaksanakan pengujian sistem untuk BAB IV.

| ID | Aktor | Kebutuhan | Prioritas | Status |
|---|---|---|---|---|
| FR-34 | Siswa, Instruktur, Admin | Sistem menyediakan fitur lupa kata sandi melalui tautan email | S | Direncanakan |
| FR-35 | Siswa, Instruktur, Admin | Sistem memungkinkan pengguna mengubah nama tampilan | C | Direncanakan |

Pengujian sistem pada sprint ini memverifikasi seluruh FR dan NFR di dokumen ini; rinciannya ada di bagian 5.

---

## 4. Kebutuhan non-fungsional

Dikelompokkan mengikuti karakteristik kualitas produk pada **ISO/IEC 25010**. Sebelum dikutip di laporan, verifikasi edisi standar yang Anda rujuk (2011 atau revisi 2023), karena nama dan jumlah karakteristiknya berbeda antaredisi.

Kolom **Sprint** menunjukkan kapan kebutuhan mulai dipenuhi. Setelah itu kebutuhan tersebut berlaku sebagai bagian dari *Definition of Done* untuk semua sprint berikutnya.

### Keamanan (Security)

| ID | Kebutuhan | Kriteria terukur | Sprint | Status |
|---|---|---|---|---|
| NFR-S01 | Hak akses data dijaga di tingkat basis data, bukan hanya di antarmuka | Row Level Security aktif pada seluruh 12 tabel | 3 | Selesai |
| NFR-S02 | Privasi foto pengguna | Foto diproses di browser dan tidak diunggah ke server; data lokasi (GPS) tidak dibaca | 2 | Selesai |
| NFR-S03 | Instruktur hanya dapat mengubah konten miliknya | Instruktur B gagal mengubah soal dan opsi kuis milik instruktur A | 4 | Direncanakan |
| NFR-S04 | Progres hanya dapat dicatat untuk materi kursus yang dipublikasikan | Penyisipan progres untuk materi kursus belum terbit ditolak | 4 | Direncanakan |
| NFR-S05 | Kunci jawaban dan nilai kuis tidak dapat dimanipulasi siswa | Kolom jawaban benar tidak terbaca siswa sebelum kuis dikumpulkan; siswa tidak dapat menyisipkan nilai langsung ke tabel | 5 | Direncanakan |
| NFR-S06 | Header keamanan HTTP | Header keamanan dikirim pada setiap respons (dikonfigurasi di `next.config.js`) | 3 | Selesai |
| NFR-S07 | Kata sandi tidak disimpan oleh aplikasi | Autentikasi dan penyimpanan kata sandi ditangani Supabase Auth | 3 | Selesai |

### Ketepatan fungsi (Functional suitability)

| ID | Kebutuhan | Kriteria terukur | Sprint | Status |
|---|---|---|---|---|
| NFR-F01 | Perhitungan exposure sesuai teori fotografi | EV = log₂(N²/t), koreksi ISO, dan resiprositas lolos unit test | 1 | Selesai |
| NFR-F02 | Ekstraksi EXIF akurat | Nilai aperture, shutter, ISO, dan focal length cocok dengan ExifTool pada minimal 90% foto uji (target, diukur di Sprint 7) | 2 | Target |
| NFR-F03 | Penyederhanaan visual simulator dinyatakan terbuka | Daftar penyederhanaan ditampilkan di halaman simulator dan README | 1 | Selesai |

### Kegunaan (Usability)

| ID | Kebutuhan | Kriteria terukur | Sprint | Status |
|---|---|---|---|---|
| NFR-U01 | Antarmuka berbahasa Indonesia | Seluruh label, pesan, dan saran berbahasa Indonesia | 1 | Selesai |
| NFR-U02 | Saran dapat dipahami pemula | Setiap saran memuat penjelasan dan nilai setelan yang disarankan | 2 | Selesai |
| NFR-U03 | Kemudahan penggunaan | Skor rata-rata System Usability Scale ≥ 68 (target, diukur di Sprint 7) | 7 | Target |
| NFR-U04 | Pesan galat yang jelas | Setiap kegagalan (file ditolak, login gagal, koneksi putus) menampilkan pesan yang menjelaskan penyebab | 2 | Selesai (diverifikasi di Black Box) |

### Efisiensi kinerja (Performance efficiency)

| ID | Kebutuhan | Kriteria terukur | Sprint | Status |
|---|---|---|---|---|
| NFR-E01 | Pratinjau simulator terasa langsung | Pratinjau berubah tanpa jeda yang terasa saat kontrol digeser (target < 100 ms, diukur di Sprint 7) | 1 | Target |
| NFR-E02 | Analisis foto tetap ringan untuk file besar | Analisis piksel dilakukan pada salinan foto yang diperkecil (sisi terpanjang maksimal 512 px) | 2 | Selesai |

### Kompatibilitas dan portabilitas

| ID | Kebutuhan | Kriteria terukur | Sprint | Status |
|---|---|---|---|---|
| NFR-K01 | Berjalan di browser modern | Fitur utama berjalan di Chrome, Firefox, dan Edge versi terbaru (diuji di Sprint 7) | 3 | Target |
| NFR-K02 | Responsif | Tampilan dapat digunakan di layar ponsel (lebar ±375 px) dan desktop (diuji di Sprint 7) | 3 | Target |
| NFR-P01 | Dapat diakses daring | Aplikasi ter-deploy di Vercel dengan basis data Supabase | 4 | Direncanakan |

### Keterpeliharaan (Maintainability)

| ID | Kebutuhan | Kriteria terukur | Sprint | Status |
|---|---|---|---|---|
| NFR-M01 | Logika inti terpisah dari tampilan | Rumus, aturan, dan penilaian berada di `lib/` sebagai fungsi murni yang dapat diuji | 1 | Selesai |
| NFR-M02 | Logika inti teruji | Unit test lulus pada setiap akhir sprint (saat ini 18/18) | 1 | Selesai |
| NFR-M03 | Basis aturan mudah diperluas | Ambang batas aturan dikumpulkan dalam satu konstanta `THRESHOLDS` di `lib/rules.js` | 2 | Selesai |
| NFR-M04 | Perubahan basis data terdokumentasi | Setiap perubahan skema disimpan sebagai file migrasi SQL | 4 | Direncanakan |

---

## 5. Pemetaan ke pengujian

| Kebutuhan | Metode verifikasi | Kapan |
|---|---|---|
| FR-01 s.d. FR-35 | Black Box Testing (satu skenario normal + satu skenario gagal per FR jika relevan) | Sprint 7 |
| NFR-S01, S03, S04, S05 | Black Box dengan akun berbeda peran (uji akses lintas pengguna) | Sprint 4–5, diulang di Sprint 7 |
| NFR-F01, M02 | Unit test (`npm test`) | Setiap akhir sprint |
| NFR-F02 | Uji akurasi EXIF terhadap ExifTool pada ±10–15 foto dari beberapa kamera dan ponsel | Sprint 7 |
| NFR-U03 | Kuesioner SUS, minimal 15 responden, target 30 | Sprint 7 |
| NFR-E01, K01, K02 | Pengujian manual di beberapa browser dan ukuran layar | Sprint 7 |

---

## 6. Ringkasan jumlah kebutuhan per sprint

| Sprint | FR | NFR yang mulai dipenuhi | Status |
|---|---|---|---|
| 1 Simulator kamera | 7 (FR-01–07) | F01, F03, U01, E01, M01, M02 | Selesai |
| 2 Analisis foto & sistem pakar | 7 (FR-08–14) | S02, F02, U02, U04, E02, M03 | Selesai |
| 3 LMS siswa & autentikasi | 9 (FR-15–23) | S01, S06, S07, K01, K02 | Selesai |
| 4 Stabilisasi & keamanan | 0 | S03, S04, P01, M04 | Direncanakan |
| 5 Penilaian kuis & admin | 4 (FR-24–27) | S05 | Direncanakan |
| 6 Instruktur | 6 (FR-28–33) | – | Direncanakan |
| 7 Fitur akun & pengujian | 2 (FR-34–35) | U03 (diukur) | Direncanakan |
| **Total** | **35** | **23** | |

---

## 7. Di luar cakupan (batasan sistem)

Dicatat agar konsisten dengan batasan masalah di BAB I dan saran di BAB V:

- Klasifikasi jenis foto atau penilaian kualitas exposure dengan machine learning.
- Materi berurutan yang terkunci, sertifikat kelulusan, dan unggah gambar materi.
- Pembatasan akses instruktur hanya pada siswa di kursus miliknya (saat ini instruktur dapat membaca aktivitas semua siswa).
- Simulasi bokeh berbentuk cakram, mode prioritas aperture/shutter, dan stabilisasi gambar.
- Pembayaran kursus.
