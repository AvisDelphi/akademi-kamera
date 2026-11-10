// lib/exercises.js
// Guided exercises. Each exercise sets a scene and defines a check() that receives
// the settings and metrics (from computeMetrics) and returns a list of criteria.
// An exercise passes when every criterion passes. Thresholds are in preview pixels
// (960 px wide image) and were chosen so the result is clearly visible on screen.

const exposureOk = (m) => ({
  label: "Exposure tepat (meter dalam ±0,5 EV)",
  pass: Math.abs(m.offset) <= 0.5,
});

const noShake = (m) => ({
  label: "Tidak ada goyangan kamera yang terlihat",
  pass: m.shakePx <= 2,
});

export const EXERCISES = [
  {
    id: "bekukan-mobil",
    title: "Bekukan mobil yang melaju",
    scene: "terik",
    brief:
      "Mobil melaju 50 km/jam sekitar 15 m dari kamera. Buat mobil tampak diam dan tajam, dengan exposure tetap tepat.",
    hint: "Gerakan cepat butuh shutter cepat. Coba 1/500 atau lebih cepat, lalu imbangi dengan aperture atau ISO.",
    check: (s, m) => [
      { label: "Mobil tampak beku (motion blur ≤ 3 px)", pass: m.motionBlurPx <= 3 },
      exposureOk(m),
      noShake(m),
    ],
  },
  {
    id: "latar-blur",
    title: "Blur latar pada potret",
    scene: "berawan",
    brief:
      "Pisahkan model dari latar belakang yang ramai. Latar harus kabur jelas sementara model tetap tajam.",
    hint: "Ruang tajam makin sempit dengan aperture lebar (angka f kecil) dan focal length panjang. Coba 85 mm di f/2.8 atau lebih lebar.",
    check: (s, m) => [
      { label: "Latar kabur jelas (blur latar ≥ 15 px)", pass: m.bgBlurPx >= 15 },
      exposureOk(m),
      noShake(m),
    ],
  },
  {
    id: "jejak-gerak",
    title: "Tunjukkan kecepatan dengan motion blur",
    scene: "senja",
    brief:
      "Saat senja, tunjukkan bahwa mobil sedang melaju: mobil kabur memanjang, tetapi model dan bangunan tetap tajam.",
    hint: "Pakai tripod agar yang kabur hanya benda bergerak. Shutter sekitar 1/15–1/30 biasanya cukup.",
    check: (s, m) => [
      { label: "Mobil kabur memanjang (motion blur ≥ 60 px)", pass: m.motionBlurPx >= 60 },
      exposureOk(m),
      noShake(m),
    ],
  },
  {
    id: "malam-handheld",
    title: "Memotret malam tanpa tripod",
    scene: "malam",
    forceHandheld: true,
    brief:
      "Tidak ada tripod. Dapatkan exposure tepat di jalan kota malam tanpa foto goyang, dengan ISO tidak lebih dari 6400.",
    hint: "Ikuti aturan 1/focal length untuk shutter, buka aperture selebar mungkin, lalu naikkan ISO secukupnya.",
    check: (s, m) => [
      noShake(m),
      exposureOk(m),
      { label: "ISO tidak lebih dari 6400", pass: s.iso <= 6400 },
    ],
  },
  {
    id: "sunny-16",
    title: "Aturan Sunny 16",
    scene: "terik",
    brief:
      "Di bawah matahari terik, pakai f/16 dan ISO 100. Pilih shutter yang membuat exposure tepat tanpa melihat meter dulu.",
    hint: "Sunny 16: pada f/16, shutter ≈ 1/ISO. Dengan ISO 100, pilih yang paling dekat dengan 1/100.",
    check: (s, m) => [
      { label: "Aperture f/16", pass: s.aperture === 16 },
      { label: "ISO 100", pass: s.iso === 100 },
      exposureOk(m),
    ],
  },
];

export const getExercise = (id) => EXERCISES.find((e) => e.id === id) ?? null;

/** Evaluate an exercise; returns { passed, criteria }. */
export function evaluateExercise(exercise, settings, metrics) {
  const criteria = exercise.check(settings, metrics);
  return { passed: criteria.every((c) => c.pass), criteria };
}
