// lib/rules.js
// Rule-based expert system for exposure-triangle suggestions.
//
// Knowledge base : RULES (IF <condition on facts> THEN <suggestion>)
// Working memory : `facts` (EXIF facts + pixel measurements; null = unknown)
// Inference      : single-pass forward chaining over all rules (evaluateRules)
// Explanation    : every rule reports fired / not fired / skipped (missing data),
//                  so the UI can show WHY a suggestion appeared.
//
// Graceful degradation: a rule lists the facts it `needs`. If any is null
// (e.g. EXIF stripped by WhatsApp), the rule is skipped instead of guessing.
import { SHUTTER_SPEEDS, ISOS, APERTURES, nearest, formatShutter, formatAperture, ev100FromSettings } from "./exposure.js";

/* Tunable thresholds, collected in one place so they can be listed in the thesis. */
export const THRESHOLDS = {
  shakeTolerance: 1.26, // 1/3 stop tolerance on the reciprocal rule (2^(1/3))
  maxComfortIso: 6400,
  highNoiseIso: 3200,
  darkMeanLuma: 0.25,
  brightMeanLuma: 0.55,
  clipHighPct: 5,
  clipLowPct: 10,
  softSharpness: 60,
  warmCast: 1.45,
  coolCast: 0.7,
  diffractionAperture: 16,
};

/* ----------------------------- helpers ----------------------------- */

const round3 = (x) => Math.round(x * 3) / 3; // round to 1/3 stop
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const stopsText = (s) => {
  const r = round3(s);
  const whole = Math.floor(r + 1e-9);
  const thirds = Math.round((r - whole) * 3);
  const frac = thirds === 0 ? "" : `${thirds}/3`;
  if (whole === 0) return `${frac} stop`;
  return `${whole}${frac ? ` ${frac}` : ""} stop`;
};
const dec = (n) => n.toFixed(1).replace(".", ","); // Indonesian decimal comma
const srgbToLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

/** Slowest standard shutter speed that still satisfies t ≤ limit. */
const safeShutter = (limit) => SHUTTER_SPEEDS.find((t) => t <= limit) ?? SHUTTER_SPEEDS.at(-1);

/**
 * Plan how to add (stops > 0) or remove (stops < 0) light, changing the setting
 * whose side effect hurts least first. Returns a list of { setting, from, to }.
 */
export function planExposureChange(f, stops) {
  const changes = [];
  let remaining = stops;
  let { aperture, shutter, iso } = f;

  if (remaining > 0) {
    // More light: 1) open aperture (not on phones), 2) slower shutter while handheld-safe, 3) raise ISO.
    if (aperture && !f.isPhone && aperture > 2.8) {
      const target = Math.max(2.8, aperture / 2 ** (remaining / 2));
      const newN = nearest(APERTURES, target);
      const gained = 2 * Math.log2(aperture / newN);
      if (gained > 0.2) {
        changes.push({ setting: "Aperture", from: formatAperture(aperture), to: formatAperture(newN) });
        remaining -= gained;
        aperture = newN;
      }
    }
    if (remaining > 0.2 && shutter && f.focal35) {
      const limit = safeShutter(1 / f.focal35);
      if (shutter < limit) {
        const target = Math.min(limit, shutter * 2 ** remaining);
        const newT = nearest(SHUTTER_SPEEDS, target);
        const gained = Math.log2(newT / shutter);
        if (gained > 0.2) {
          changes.push({ setting: "Shutter", from: formatShutter(shutter), to: formatShutter(newT) });
          remaining -= gained;
          shutter = newT;
        }
      }
    }
    if (remaining > 0.2 && iso) {
      const newIso = nearest(ISOS, iso * 2 ** remaining);
      if (newIso !== iso) changes.push({ setting: "ISO", from: String(iso), to: String(newIso) });
    }
  } else if (remaining < 0) {
    // Less light: 1) lower ISO (less noise), 2) faster shutter, 3) smaller aperture up to f/11.
    if (iso && iso > 100) {
      const newIso = nearest(ISOS, Math.max(100, iso * 2 ** remaining));
      const removed = Math.log2(newIso / iso);
      if (removed < -0.2) {
        changes.push({ setting: "ISO", from: String(iso), to: String(newIso) });
        remaining -= removed;
        iso = newIso;
      }
    }
    if (remaining < -0.2 && shutter) {
      const newT = nearest(SHUTTER_SPEEDS, Math.max(1 / 4000, shutter * 2 ** remaining));
      const removed = Math.log2(newT / shutter);
      if (removed < -0.2) {
        changes.push({ setting: "Shutter", from: formatShutter(shutter), to: formatShutter(newT) });
        remaining -= removed;
      }
    }
    if (remaining < -0.2 && aperture && !f.isPhone && aperture < 11) {
      const newN = nearest(APERTURES, Math.min(11, aperture * 2 ** (-remaining / 2)));
      if (newN !== aperture) changes.push({ setting: "Aperture", from: formatAperture(aperture), to: formatAperture(newN) });
    }
  }
  return changes;
}

const changesText = (changes) => changes.map((c) => `${c.setting} ${c.from} → ${c.to}`).join(", ");

/* --------------------------- knowledge base --------------------------- */

export const RULES = [
  {
    id: "R01",
    name: "Risiko goyangan kamera",
    condition: "shutter > 1/focal length (ekuivalen 35 mm), toleransi 1/3 stop",
    needs: ["shutter", "focal35", "iso"],
    when: (f) => f.shutter > THRESHOLDS.shakeTolerance / f.focal35,
    then: (f) => {
      const limit = safeShutter(1 / f.focal35);
      const stops = Math.log2(f.shutter / limit);
      const newIso = nearest(ISOS, f.iso * 2 ** stops);
      const base = `Shutter ${formatShutter(f.shutter)} pada ${Math.round(f.focal35)} mm berisiko goyang saat dipegang tangan; aturan 1/focal length menyarankan minimal ${formatShutter(limit)}.`;
      const changes = [{ setting: "Shutter", from: formatShutter(f.shutter), to: formatShutter(limit) }];
      let advice;
      if (newIso <= THRESHOLDS.maxComfortIso) {
        changes.push({ setting: "ISO", from: String(f.iso), to: String(newIso) });
        advice = `Coba ${formatShutter(limit)} dan naikkan ISO ke ${newIso} agar exposure tetap sama.`;
      } else {
        advice = `Menaikkan ISO saja akan butuh ISO ${newIso} (noise berat). Gunakan tripod, sandarkan kamera, ${f.isPhone ? "atau mode malam ponsel" : "atau buka aperture lebih lebar"}.`;
      }
      return {
        severity: "warning",
        title: "Foto berisiko goyang",
        message: `${base} ${advice} Jika lensa/kamera punya stabilisasi (IS/VR/OIS), batas aman bisa 2–4 stop lebih lambat. Untuk objek bergerak, stabilisasi tidak membantu.`,
        changes,
      };
    },
  },
  {
    id: "R02",
    name: "Foto terlalu gelap (underexposed)",
    condition: `rata-rata luminans < ${THRESHOLDS.darkMeanLuma} dan highlight terpotong < 1%`,
    needs: ["meanLuma", "clipHighPct"],
    when: (f) => f.meanLuma < THRESHOLDS.darkMeanLuma && f.clipHighPct < 1,
    then: (f) => {
      // Estimate: stops needed to bring average (in linear light) to middle grey 18%.
      const stops = clamp(round3(Math.log2(0.18 / Math.max(0.002, srgbToLinear(f.meanLuma)))), 1 / 3, 3);
      const changes = planExposureChange(f, stops);
      return {
        severity: "warning",
        title: "Foto cenderung gelap",
        message: changes.length
          ? `Perkiraan kurang cahaya sekitar ${stopsText(stops)}. Saran: ${changesText(changes)}. Jika suasana gelap memang disengaja (low-key), abaikan saran ini.`
          : `Perkiraan kurang cahaya sekitar ${stopsText(stops)}. Tambah cahaya dengan membuka aperture, memperlambat shutter, menaikkan ISO, atau memakai kompensasi exposure +${dec(round3(stops))} EV.`,
        changes,
      };
    },
  },
  {
    id: "R03",
    name: "Highlight terpotong (overexposed)",
    condition: `highlight terpotong > ${THRESHOLDS.clipHighPct}% dan rata-rata luminans > ${THRESHOLDS.brightMeanLuma}`,
    needs: ["meanLuma", "clipHighPct"],
    when: (f) => f.clipHighPct > THRESHOLDS.clipHighPct && f.meanLuma > THRESHOLDS.brightMeanLuma,
    then: (f) => {
      const stops = f.clipHighPct > 15 ? -2 : -1;
      const changes = planExposureChange(f, stops);
      return {
        severity: "warning",
        title: "Bagian terang kehilangan detail",
        message: `${dec(f.clipHighPct)}% piksel putih total (detail hilang dan tidak bisa dipulihkan). Kurangi sekitar ${Math.abs(stops)} stop${changes.length ? `: ${changesText(changes)}` : ""}, atau pakai kompensasi exposure ${stops} EV.`,
        changes,
      };
    },
  },
  {
    id: "R04",
    name: "Kontras melebihi rentang dinamis",
    condition: `shadow terpotong > ${THRESHOLDS.clipLowPct}% dan highlight terpotong > 3%`,
    needs: ["clipLowPct", "clipHighPct"],
    when: (f) => f.clipLowPct > THRESHOLDS.clipLowPct && f.clipHighPct > 3,
    then: (f) => ({
      severity: "tip",
      title: "Kontras adegan terlalu tinggi",
      message: `Bagian gelap (${f.clipLowPct.toFixed(0)}%) dan terang (${f.clipHighPct.toFixed(0)}%) sama-sama kehilangan detail. Satu setelan tidak bisa menangkap keduanya: ukur exposure untuk bagian terang, tambahkan cahaya pengisi (reflektor/flash), atau gunakan bracketing/HDR.`,
    }),
  },
  {
    id: "R05",
    name: "ISO lebih tinggi dari yang diperlukan",
    condition: "ISO ≥ 800 dan shutter ≥ 1 stop lebih cepat dari 1/(2 × focal length)",
    needs: ["iso", "shutter", "focal35"],
    when: (f) => f.iso >= 800 && Math.log2(1 / (2 * f.focal35) / f.shutter) >= 1,
    then: (f) => {
      const roomStops = Math.floor(Math.log2(1 / (2 * f.focal35) / f.shutter) * 3) / 3;
      const newIso = nearest(ISOS, Math.max(100, f.iso / 2 ** roomStops));
      const k = Math.log2(f.iso / newIso);
      const newT = nearest(SHUTTER_SPEEDS, f.shutter * 2 ** k);
      return {
        severity: "tip",
        title: "Noise bisa dikurangi",
        message: `Shutter ${formatShutter(f.shutter)} jauh lebih cepat dari yang dibutuhkan untuk ${Math.round(f.focal35)} mm. Kecuali sedang membekukan objek cepat, turunkan ISO ke ${newIso} dan perlambat shutter ke ${formatShutter(newT)}: exposure sama, noise lebih rendah.`,
        changes: [
          { setting: "ISO", from: String(f.iso), to: String(newIso) },
          { setting: "Shutter", from: formatShutter(f.shutter), to: formatShutter(newT) },
        ],
      };
    },
  },
  {
    id: "R06",
    name: "ISO tinggi, noise kentara",
    condition: `ISO ≥ ${THRESHOLDS.highNoiseIso}`,
    needs: ["iso"],
    when: (f) => f.iso >= THRESHOLDS.highNoiseIso,
    then: (f) => ({
      severity: "info",
      title: "Noise kemungkinan terlihat",
      message: `ISO ${f.iso} biasanya menghasilkan noise yang terlihat, terutama di area gelap. Exposure yang tepat (tidak gelap lalu dicerahkan saat edit) membantu menekan noise.`,
    }),
  },
  {
    id: "R07",
    name: "Potret dengan aperture sempit",
    condition: "kamera bukan ponsel, focal ≥ 70 mm, aperture ≥ f/5.6",
    needs: ["aperture", "focal35", "shutter"],
    when: (f) => !f.isPhone && f.focal35 >= 70 && f.aperture >= 5.6,
    then: (f) => {
      const stops = 2 * Math.log2(f.aperture / 2.8);
      const newT = nearest(SHUTTER_SPEEDS, Math.max(1 / 4000, f.shutter / 2 ** stops));
      return {
        severity: "tip",
        title: "Latar bisa dibuat lebih kabur",
        message: `Jika ini foto potret, ${formatAperture(f.aperture)} membuat latar ikut tajam. Buka ke f/2.8 untuk memisahkan subjek dari latar, lalu percepat shutter ke ${formatShutter(newT)} agar exposure sama.`,
        changes: [
          { setting: "Aperture", from: formatAperture(f.aperture), to: "f/2.8" },
          { setting: "Shutter", from: formatShutter(f.shutter), to: formatShutter(newT) },
        ],
      };
    },
  },
  {
    id: "R08",
    name: "Lanskap dengan aperture lebar",
    condition: "kamera bukan ponsel, focal ≤ 35 mm, aperture ≤ f/4, EV100 ≥ 11 (luar ruang terang)",
    needs: ["aperture", "focal35", "shutter", "iso"],
    when: (f) => !f.isPhone && f.focal35 <= 35 && f.aperture <= 4 && ev100FromSettings(f.aperture, f.shutter, f.iso) >= 11,
    then: (f) => {
      const stops = 2 * Math.log2(8 / f.aperture);
      const newT = nearest(SHUTTER_SPEEDS, f.shutter * 2 ** stops);
      return {
        severity: "tip",
        title: "Ruang tajam lanskap bisa diperluas",
        message: `Jika ini foto lanskap, ${formatAperture(f.aperture)} membuat latar depan atau belakang kurang tajam. Coba f/8 dan shutter ${formatShutter(newT)}${newT > 1 / f.focal35 ? " (pakai tripod, atau naikkan ISO)" : ""}.`,
        changes: [
          { setting: "Aperture", from: formatAperture(f.aperture), to: "f/8" },
          { setting: "Shutter", from: formatShutter(f.shutter), to: formatShutter(newT) },
        ],
      };
    },
  },
  {
    id: "R09",
    name: "Difraksi pada aperture sangat kecil",
    condition: `kamera bukan ponsel, aperture ≥ f/${THRESHOLDS.diffractionAperture}`,
    needs: ["aperture"],
    when: (f) => !f.isPhone && f.aperture >= THRESHOLDS.diffractionAperture,
    then: (f) => ({
      severity: "tip",
      title: "Ketajaman turun karena difraksi",
      message: `Pada ${formatAperture(f.aperture)} cahaya mengalami difraksi sehingga detail halus melunak. Kecuali butuh ruang tajam ekstrem atau shutter lambat, f/8–f/11 biasanya paling tajam.`,
    }),
  },
  {
    id: "R10",
    name: "Foto kurang tajam",
    condition: `skor ketajaman (persentil 90 varians Laplacian) < ${THRESHOLDS.softSharpness} dan rata-rata luminans ≥ 0,12`,
    needs: ["sharpness", "meanLuma"],
    // Very dark photos have little contrast, which lowers the score without real blur,
    // so the rule only judges photos that are bright enough.
    when: (f) => f.sharpness < THRESHOLDS.softSharpness && f.meanLuma >= 0.12,
    then: (f) => {
      const shakeLikely = f.shutter && f.focal35 && f.shutter > 1 / f.focal35;
      return {
        severity: "warning",
        title: "Tidak ada bagian yang benar-benar tajam",
        message: shakeLikely
          ? `Penyebab paling mungkin goyangan kamera karena shutter ${formatShutter(f.shutter)} lebih lambat dari 1/${Math.round(f.focal35)}. Percepat shutter atau gunakan tripod.`
          : "Kemungkinan fokus meleset, subjek bergerak, atau lensa kotor. Pastikan titik fokus tepat di subjek dan gunakan shutter lebih cepat untuk subjek bergerak. (Indikator ini perkiraan; foto berkabut atau sengaja lembut bisa terdeteksi juga.)",
      };
    },
  },
  {
    id: "R11",
    name: "Flash dengan shutter lambat",
    condition: "flash menyala dan shutter > 1/60",
    needs: ["flashFired", "shutter"],
    when: (f) => f.flashFired === true && f.shutter > 1 / 60,
    then: (f) => ({
      severity: "tip",
      title: "Risiko bayangan ganda (ghosting)",
      message: `Flash membekukan subjek, tetapi shutter ${formatShutter(f.shutter)} masih merekam cahaya sekitar sehingga bisa muncul jejak kabur. Gunakan 1/125–1/200 (sesuaikan dengan flash sync kamera) kecuali efek ini disengaja.`,
    }),
  },
  {
    id: "R12",
    name: "Warna tidak netral",
    condition: `rasio merah/biru > ${THRESHOLDS.warmCast} atau < ${THRESHOLDS.coolCast}`,
    needs: ["redBlueRatio"],
    when: (f) => f.redBlueRatio > THRESHOLDS.warmCast || f.redBlueRatio < THRESHOLDS.coolCast,
    then: (f) => {
      const warm = f.redBlueRatio > 1;
      return {
        severity: "tip",
        title: warm ? "Foto cenderung kuning/oranye" : "Foto cenderung biru",
        message: `${warm ? "Cahaya lampu pijar atau senja" : "Bayangan, langit mendung, atau lampu LED dingin"} kemungkinan memberi warna dominan. Jika tidak disengaja, pilih preset white balance ${warm ? "Tungsten/Incandescent" : "Cloudy/Shade"} atau atur Kelvin manual.${f.whiteBalance === "Manual" ? " EXIF menunjukkan WB manual, periksa kembali nilainya." : ""}`,
      };
    },
  },
  {
    id: "R13",
    name: "Perkiraan kondisi cahaya (EV100)",
    condition: "aperture, shutter, dan ISO tersedia",
    needs: ["aperture", "shutter", "iso"],
    when: () => true,
    then: (f) => {
      const ev = ev100FromSettings(f.aperture, f.shutter, f.iso);
      const label =
        ev >= 14 ? "matahari terik" : ev >= 12 ? "cerah berawan atau teduh" : ev >= 9 ? "mendung tebal atau senja"
          : ev >= 6 ? "dalam ruangan terang" : ev >= 3 ? "dalam ruangan redup atau jalan kota malam" : "sangat gelap";
      return {
        severity: "info",
        title: `Setelan ini cocok untuk cahaya EV ${dec(ev)}`,
        message: `EV100 = log₂(N²/t) − log₂(ISO/100) = ${dec(ev)}, setara kondisi ${label}. Jika kondisi saat memotret jauh berbeda, cek kembali histogram dan meter kamera.`,
      };
    },
  },
];

const ACTIONABLE = new Set(["warning", "tip"]);

/**
 * Forward-chaining inference over the knowledge base.
 * @returns {{ trace: Array, suggestions: Array }}
 */
export function evaluateRules(facts) {
  const trace = RULES.map((rule) => {
    const missing = rule.needs.filter((k) => facts[k] == null);
    if (missing.length) return { id: rule.id, name: rule.name, condition: rule.condition, status: "skipped", missing };
    const fired = rule.when(facts);
    return {
      id: rule.id,
      name: rule.name,
      condition: rule.condition,
      status: fired ? "fired" : "not-fired",
      missing: [],
      output: fired ? { id: rule.id, ...rule.then(facts) } : null,
    };
  });

  const suggestions = trace.filter((t) => t.output).map((t) => t.output);
  const hasData = trace.some((t) => t.status !== "skipped");
  if (hasData && !suggestions.some((s) => ACTIONABLE.has(s.severity))) {
    suggestions.unshift({
      id: "R14",
      severity: "ok",
      title: "Exposure triangle sudah seimbang",
      message: "Tidak ada aturan yang mendeteksi masalah pada data yang tersedia. Pertahankan, lalu bereksperimen dengan aperture atau shutter untuk efek kreatif.",
    });
  }
  const order = { warning: 0, ok: 1, tip: 2, info: 3 };
  suggestions.sort((a, b) => order[a.severity] - order[b.severity]);
  return { trace, suggestions };
}
