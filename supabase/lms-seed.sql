-- supabase/lms-seed.sql
-- Demo LMS content for Akademi Kamera.
--
-- How to run:
--   1. Create the schema with supabase/schema.sql.
--   2. Register one account in the app (it starts as a student).
--   3. Promote it to instructor in the SQL Editor:
--        update public.profiles
--        set role = 'instructor'
--        where id = (select id from auth.users where email = 'you@example.com');
--   4. Paste and run this whole file.
--
-- The script is idempotent: if the demo courses already exist it only prints a notice.

do $$
declare
  v_instructor uuid;
  v_course     bigint;
  v_module     bigint;
  v_lesson     bigint;
  v_quiz       bigint;
  v_question   bigint;
begin
  select id into v_instructor
  from public.profiles
  where role in ('instructor', 'admin')
  order by created_at
  limit 1;

  if v_instructor is null then
    raise exception 'Belum ada akun instruktur. Daftar satu akun dulu, naikkan perannya menjadi instructor, lalu jalankan file ini lagi.';
  end if;

  if exists (select 1 from public.courses where title = 'Dasar Segitiga Exposure') then
    raise notice 'Konten demo sudah ada. Tidak ada data yang diubah.';
    return;
  end if;

  -- =====================================================================
  -- Course 1: Dasar Segitiga Exposure
  -- =====================================================================
  insert into public.courses (instructor_id, title, description, level, is_published)
  values (
    v_instructor,
    'Dasar Segitiga Exposure',
    'Mulai dari nol: pahami exposure, aperture, dan shutter speed lewat penjelasan singkat dan latihan simulator.',
    'pemula',
    true
  )
  returning id into v_course;

  insert into public.modules (course_id, title, position)
  values (v_course, 'Cahaya dan exposure', 1)
  returning id into v_module;

  insert into public.lessons (module_id, title, content_md, position)
  values (
    v_module,
    'Apa itu exposure?',
    $lesson$
## Exposure adalah jumlah cahaya

Exposure menentukan seberapa terang foto yang dihasilkan. Tiga pengaturan kamera bekerja bersama:

- **Aperture** mengatur seberapa lebar lensa terbuka.
- **Shutter speed** mengatur berapa lama sensor menerima cahaya.
- **ISO** mengatur seberapa kuat sinyal sensor diperkuat.

Setiap kali salah satu setelan dinaikkan satu stop, jumlah cahaya berubah dua kali lipat. Membuka aperture satu stop dapat diimbangi dengan mempercepat shutter satu stop tanpa mengubah kecerahan.

## Meter exposure

Meter di simulator menunjukkan selisih antara setelanmu dan kebutuhan cahaya adegan. Nilai 0 berarti tepat. Selisih ±0,5 EV masih dianggap aman.

> Naik satu stop = buka aperture satu langkah, perlambat shutter dua kali, atau naikkan ISO dua kali.

Coba [simulator](/simulator) dan perhatikan meter bergerak saat setelan berubah.
$lesson$,
    1
  );

  insert into public.lessons (module_id, title, content_md, position)
  values (
    v_module,
    'Membaca angka EV',
    $lesson$
## Skala EV

Exposure value (EV) menggabungkan aperture dan shutter:

`EV = log₂(N² / t)`

dengan N adalah angka f dan t adalah shutter dalam detik. Pada f/16 dan 1/125 detik, EV kira-kira 15—kondisi Sunny 16.

## EV adegan

Setiap kondisi cahaya punya EV100, yaitu EV pada ISO 100:

- Siang terik: EV 15
- Berawan: EV 12
- Senja: EV 9
- Jalan kota malam: EV 5

Menaikkan ISO satu stop setara menambah satu EV. Karena itu, di malam hari kita membuka aperture, memperlambat shutter, atau menaikkan ISO.

## Latihan mandiri

Buka simulator, pilih kondisi **Siang terik**, lalu ubah aperture dari f/8 ke f/5.6. Perhatikan angka EV setelan dan posisi meter.
$lesson$,
    2
  );

  insert into public.modules (course_id, title, position)
  values (v_course, 'Aperture dan ruang tajam', 2)
  returning id into v_module;

  insert into public.lessons (module_id, title, content_md, simulator_exercise_id, position)
  values (
    v_module,
    'Bukaan lensa dan ruang tajam',
    $lesson$
## Angka f

Aperture ditulis sebagai f/N. Angka N yang **kecil** berarti bukaan **lebar**: lebih banyak cahaya masuk dan latar lebih mudah kabur. Angka besar seperti f/16 berarti bukaan sempit.

Perubahan satu stop: f/2.8 → f/4 → f/5.6 → f/8 → f/11 → f/16. Setiap langkah membagi dua jumlah cahaya.

## Ruang tajam

Ruang tajam (depth of field) adalah rentang jarak yang tampak fokus. Tiga hal mempersempitnya:

- Aperture lebih lebar (angka f kecil).
- Focal length lebih panjang.
- Jarak ke subjek lebih dekat.

Untuk potret yang memisahkan model dari latar, aperture lebar dan focal length panjang adalah kombinasi yang kuat.

## Efek samping

Membuka aperture juga membuat foto lebih terang. Imbangi dengan shutter lebih cepat atau ISO lebih rendah. Foto juga bisa kehilangan ketajaman di bagian tertentu jika ruang tajam terlalu sempit.

Kerjakan [latihan blur latar](/simulator?latihan=latar-blur) setelah membaca materi ini.
$lesson$,
    'latar-blur',
    1
  )
  returning id into v_lesson;

  insert into public.quizzes (lesson_id, title, pass_score)
  values (v_lesson, 'Kuis aperture', 70)
  returning id into v_quiz;

  insert into public.quiz_questions (quiz_id, prompt, position)
  values (v_quiz, 'Apa yang terjadi pada ruang tajam saat aperture dibuka dari f/8 ke f/2.8?', 1)
  returning id into v_question;
  insert into public.quiz_options (question_id, label, is_correct) values
    (v_question, 'Ruang tajam makin sempit', true),
    (v_question, 'Ruang tajam makin luas', false),
    (v_question, 'Ruang tajam tidak berubah', false),
    (v_question, 'Foto menjadi lebih gelap', false);

  insert into public.quiz_questions (quiz_id, prompt, position)
  values (v_quiz, 'Kombinasi yang paling membantu memisahkan model dari latar adalah...', 2)
  returning id into v_question;
  insert into public.quiz_options (question_id, label, is_correct) values
    (v_question, 'Aperture lebar dan focal length panjang', true),
    (v_question, 'Aperture sempit dan focal length pendek', false),
    (v_question, 'ISO tinggi dan shutter lambat', false),
    (v_question, 'Aperture sempit dan jarak subjek jauh', false);

  insert into public.quiz_questions (quiz_id, prompt, position)
  values (v_quiz, 'Membuka aperture satu stop, misalnya f/5.6 ke f/4, membuat foto...', 3)
  returning id into v_question;
  insert into public.quiz_options (question_id, label, is_correct) values
    (v_question, 'Dua kali lebih terang', true),
    (v_question, 'Dua kali lebih gelap', false),
    (v_question, 'Tidak berubah', false),
    (v_question, 'Empat kali lebih terang', false);

  insert into public.lessons (module_id, title, content_md, position)
  values (
    v_module,
    'Kapan memakai aperture sempit',
    $lesson$
## f/8 sampai f/11

Aperture sempit menambah ruang tajam. Lanskap dengan detail dari depan ke belakang biasanya memakai f/8 sampai f/11. Pada rentang ini lensa juga umumnya paling tajam.

## Hindari difraksi

Menutup aperture terlalu jauh (f/16 ke atas pada banyak lensa) dapat menurunkan ketajaman karena difraksi: cahaya membelok di tepi diafragma.

## Ponsel

Kamera ponsel umumnya memakai aperture tetap. Karena itu, sistem pakar di halaman analisis tidak menyarankan perubahan aperture untuk foto ponsel. Gunakan jarak dan focal length untuk mengatur ruang tajam.

## Ringkas

- Potret: f/1.8–f/2.8, focal panjang.
- Lanskap: f/8–f/11.
- Butuh ruang tajam maksimal: f/11, bukan f/22.
$lesson$,
    2
  );

  insert into public.modules (course_id, title, position)
  values (v_course, 'Shutter speed dan gerakan', 3)
  returning id into v_module;

  insert into public.lessons (module_id, title, content_md, simulator_exercise_id, position)
  values (
    v_module,
    'Membekukan dan merekam gerakan',
    $lesson$
## Shutter sebagai pengukur waktu

Shutter speed adalah lama sensor menerima cahaya, ditulis dalam pecahan detik. Semakin kecil angkanya (1/1000), semakin cepat dan semakin gelap. Semakin besar (1/15), semakin lambat dan semakin terang.

## Dua bahasa gerakan

- **Membekukan**: shutter cepat membuat mobil, air, atau orang berlari tampak diam.
- **Merekam jejak**: shutter lambat membuat objek bergerak meninggalkan garis kabur, sementara latar tajam.

Untuk motion blur yang bersih, pakai tripod agar kamera tidak ikut goyang. Contohnya 1/15 detik pada mobil yang melaju.

## Mengimbangi

Mempercepat shutter satu stop membuat foto lebih gelap satu stop. Buka aperture atau naikkan ISO untuk mengimbanginya. Perhatikan efek samping: ruang tajam menipis atau noise bertambah.

Coba [latihan motion blur](/simulator?latihan=jejak-gerak).
$lesson$,
    'jejak-gerak',
    1
  )
  returning id into v_lesson;

  insert into public.quizzes (lesson_id, title, pass_score)
  values (v_lesson, 'Kuis shutter speed', 70)
  returning id into v_quiz;

  insert into public.quiz_questions (quiz_id, prompt, position)
  values (v_quiz, 'Untuk membekukan mobil yang melaju, pilih...', 1)
  returning id into v_question;
  insert into public.quiz_options (question_id, label, is_correct) values
    (v_question, 'Shutter cepat seperti 1/1000 detik', true),
    (v_question, 'Shutter lambat seperti 1/15 detik', false),
    (v_question, 'ISO serendah mungkin tanpa melihat shutter', false),
    (v_question, 'Aperture f/22', false);

  insert into public.quiz_questions (quiz_id, prompt, position)
  values (v_quiz, 'Motion blur yang panjang dihasilkan oleh...', 2)
  returning id into v_question;
  insert into public.quiz_options (question_id, label, is_correct) values
    (v_question, 'Shutter lambat saat subjek bergerak', true),
    (v_question, 'Shutter cepat saat subjek diam', false),
    (v_question, 'ISO tinggi', false),
    (v_question, 'Aperture lebar', false);

  insert into public.quiz_questions (quiz_id, prompt, position)
  values (v_quiz, 'Aturan 1/focal length membantu...', 3)
  returning id into v_question;
  insert into public.quiz_options (question_id, label, is_correct) values
    (v_question, 'Menghindari goyangan kamera saat memotret tanpa tripod', true),
    (v_question, 'Membekukan subjek yang bergerak cepat', false),
    (v_question, 'Menambah ruang tajam', false),
    (v_question, 'Mengurangi noise', false);

  insert into public.lessons (module_id, title, content_md, simulator_exercise_id, position)
  values (
    v_module,
    'Aturan 1/focal length',
    $lesson$
## Batas aman genggam

Saat kamera dipegang tangan, getaran kecil bisa terlihat. Aturan praktisnya: shutter tidak lebih lambat dari 1/focal length (dalam mm setara 35 mm).

- 50 mm → minimal 1/50 detik
- 85 mm → minimal 1/85 detik
- 200 mm → minimal 1/200 detik

## Malam hari

Di jalan kota malam, cahaya sedikit. Urutan yang biasanya paling aman:

1. Buka aperture selebar mungkin.
2. Pilih shutter pada batas aman genggam.
3. Naikkan ISO secukupnya.
4. Jika memungkinkan, pakai tripod.

Tripod menghilangkan goyangan kamera, tetapi tidak membekukan subjek yang bergerak.

Kerjakan [latihan malam tanpa tripod](/simulator?latihan=malam-handheld).
$lesson$,
    'malam-handheld',
    2
  );

  -- =====================================================================
  -- Course 2: Exposure di Lapangan
  -- =====================================================================
  insert into public.courses (instructor_id, title, description, level, is_published)
  values (
    v_instructor,
    'Exposure di Lapangan',
    'Latih pengambilan keputusan saat memotret: membaca meter, memilih ISO, dan memakai aturan Sunny 16.',
    'menengah',
    true
  )
  returning id into v_course;

  insert into public.modules (course_id, title, position)
  values (v_course, 'Metering dan ISO', 1)
  returning id into v_module;

  insert into public.lessons (module_id, title, content_md, position)
  values (
    v_module,
    'Membaca meter dan kompensasi exposure',
    $lesson$
## Meter tidak selalu benar

Meter menganggap dunia berwarna abu-abu 18%. Salju yang terang bisa membuat meter menurunkan exposure, sehingga salju terlihat abu-abu. Sebaliknya, objek gelap bisa membuat foto terlalu terang.

## Kompensasi exposure

Gunakan kompensasi +EV untuk adegan yang didominasi warna terang, dan −EV untuk adegan gelap. Periksa histogram: jika banyak piksel menumpuk di kanan, highlight terpotong; di kiri, shadow kehilangan detail.

## Prioritas

Saat memotret orang, prioritaskan shutter yang cukup cepat agar tidak goyang dan ekspresi tidak kabur. Saat memotret lanskap, prioritaskan aperture yang memberi ruang tajam cukup.
$lesson$,
    1
  );

  insert into public.lessons (module_id, title, content_md, simulator_exercise_id, position)
  values (
    v_module,
    'Memilih ISO',
    $lesson$
## ISO dan noise

ISO memperkuat sinyal sensor. Menaikkan ISO dua kali lipat menambah satu stop kecerahan, tetapi noise juga bertambah. Kamera modern masih nyaman sampai ISO 3200–6400, tergantung ukuran sensor.

## Urutan keputusan

Saat cahaya kurang:

1. Buka aperture jika ruang tajam masih cukup.
2. Perlambat shutter selama masih di atas batas 1/focal length.
3. Naikkan ISO.
4. Pakai tripod atau sumber cahaya tambahan.

## Jangan takut ISO tinggi

Foto yang sedikit noise lebih berguna daripada foto yang goyang atau tidak tajam. Untuk laporan, bandingkan foto ISO 400 dan ISO 6400 pada kondisi yang sama.
$lesson$,
    'malam-handheld',
    2
  );

  insert into public.modules (course_id, title, position)
  values (v_course, 'Aturan praktis', 2)
  returning id into v_module;

  insert into public.lessons (module_id, title, content_md, simulator_exercise_id, position)
  values (
    v_module,
    'Aturan Sunny 16',
    $lesson$
## Sunny 16

Di bawah matahari terik dengan langit cerah, atur aperture f/16 dan shutter yang paling dekat dengan 1/ISO.

Pada ISO 100, shutter sekitar 1/100 detik. Pada ISO 200, sekitar 1/200 detik. Aturan ini memberi titik awal yang cepat tanpa melihat meter.

## Variasi kondisi

- Matahari terik: f/16
- Sedikit berawan: f/11
- Berawan: f/8
- Senja: f/4 atau lebih lebar

## Batas

Sunny 16 mengasumsikan cahaya matahari langsung dan subjek di bawah sinar matahari, bukan di bayangan. Selalu periksa histogram dan meter setelah mengambil titik awal.

Coba [latihan Sunny 16](/simulator?latihan=sunny-16).
$lesson$,
    'sunny-16',
    1
  )
  returning id into v_lesson;

  insert into public.quizzes (lesson_id, title, pass_score)
  values (v_lesson, 'Kuis Sunny 16', 70)
  returning id into v_quiz;

  insert into public.quiz_questions (quiz_id, prompt, position)
  values (v_quiz, 'Pada ISO 100 dan f/16 di siang terik, shutter yang paling mendekati aturan Sunny 16 adalah...', 1)
  returning id into v_question;
  insert into public.quiz_options (question_id, label, is_correct) values
    (v_question, '1/100 detik', true),
    (v_question, '1/1000 detik', false),
    (v_question, '1 detik', false),
    (v_question, '1/15 detik', false);

  insert into public.quiz_questions (quiz_id, prompt, position)
  values (v_quiz, 'Mengapa f/16 dipakai pada aturan Sunny 16?', 2)
  returning id into v_question;
  insert into public.quiz_options (question_id, label, is_correct) values
    (v_question, 'Karena cahaya sangat terang dan aperture sempit membatasi masuknya cahaya', true),
    (v_question, 'Karena f/16 selalu paling tajam', false),
    (v_question, 'Karena f/16 membuat latar kabur', false),
    (v_question, 'Karena f/16 menambah ISO', false);

  insert into public.quiz_questions (quiz_id, prompt, position)
  values (v_quiz, 'Jika ISO dinaikkan dari 100 ke 200, shutter pada f/16 menjadi sekitar...', 3)
  returning id into v_question;
  insert into public.quiz_options (question_id, label, is_correct) values
    (v_question, '1/200 detik', true),
    (v_question, '1/50 detik', false),
    (v_question, '1/100 detik', false),
    (v_question, '2 detik', false);

  insert into public.lessons (module_id, title, content_md, position)
  values (
    v_module,
    'Checklist sebelum menekan rana',
    $lesson$
## Checklist cepat

Sebelum menekan tombol rana, periksa:

- Apakah subjek utama tajam dan tidak goyang?
- Apakah aperture memberi ruang tajam sesuai maksud foto?
- Apakah shutter cukup cepat, atau justru cukup lambat untuk motion blur?
- Apakah ISO masih dalam batas nyaman?
- Apakah highlight penting tidak terpotong?

## Setelah memotret

Lihat histogram dan perbesar foto untuk memeriksa fokus. Jika ada yang salah, ubah satu setelan pada satu waktu agar kamu tahu efeknya.

## Latihan berikutnya

Gunakan halaman [analisis foto](/analisis) untuk memeriksa EXIF dan metrik foto aslimu, lalu bandingkan dengan saran sistem pakar.
$lesson$,
    2
  );

  raise notice 'Konten demo berhasil dibuat: 2 kursus, 10 materi, dan 3 kuis.';
end $$;
