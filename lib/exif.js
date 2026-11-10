// lib/exif.js
// Reads EXIF metadata in the browser with exifr and normalises it into
// plain "facts" for the rule engine. GPS is deliberately NOT parsed (privacy),
// and the photo is never uploaded to a server.
import exifr from "exifr";

const WHITE_BALANCE = { 0: "Otomatis", 1: "Manual" };
const EXPOSURE_PROGRAM = {
  0: "Tidak diketahui",
  1: "Manual",
  2: "Program (P)",
  3: "Aperture priority (A/Av)",
  4: "Shutter priority (S/Tv)",
  5: "Creative",
  6: "Action",
  7: "Portrait",
  8: "Landscape",
};
const METERING_MODE = {
  1: "Average",
  2: "Center-weighted",
  3: "Spot",
  4: "Multi-spot",
  5: "Evaluative/Matrix",
  6: "Partial",
};

const firstNumber = (v) => {
  const n = Array.isArray(v) ? v[0] : v;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Parse a File and return { raw, facts, missing }.
 * - raw: selected tags as read (for the "Data EXIF" table)
 * - facts: normalised numbers used by the rule engine (null when unknown)
 * - missing: names of key fields that could not be found
 */
export async function extractExif(file) {
  let raw = null;
  try {
    raw = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: false, // never read location
      ifd1: false,
      interop: false,
      xmp: false,
      icc: false,
      iptc: false,
      translateValues: false, // we translate the few enums we need ourselves
      reviveValues: true,
      mergeOutput: true,
    });
  } catch {
    // Unsupported or corrupted metadata: treat as "no EXIF" instead of failing.
    raw = null;
  }
  raw = raw ?? {};

  // Aperture: prefer FNumber, fall back to APEX ApertureValue (N = 2^(Av/2)).
  let aperture = firstNumber(raw.FNumber);
  if (!aperture && firstNumber(raw.ApertureValue)) aperture = 2 ** (raw.ApertureValue / 2);

  // Shutter: prefer ExposureTime, fall back to APEX ShutterSpeedValue (t = 2^−Tv).
  let shutter = firstNumber(raw.ExposureTime);
  if (!shutter && typeof raw.ShutterSpeedValue === "number") shutter = 2 ** -raw.ShutterSpeedValue;

  const iso = firstNumber(raw.ISO) ?? firstNumber(raw.ISOSpeedRatings) ?? firstNumber(raw.PhotographicSensitivity);

  const focalMm = firstNumber(raw.FocalLength);
  const focal35Exif = firstNumber(raw.FocalLengthIn35mmFormat);
  // Phones have tiny sensors (actual focal length well under 12 mm) and fixed apertures.
  const isPhone = focalMm != null && focalMm < 12;

  let focal35 = focal35Exif;
  let focal35Source = focal35Exif ? "exif" : null;
  if (!focal35 && focalMm && !isPhone) {
    // Assumption: full-frame. For APS-C bodies the real equivalent is about ×1.5.
    focal35 = focalMm;
    focal35Source = "assumed-full-frame";
  }

  const flashRaw = typeof raw.Flash === "number" ? raw.Flash : null;

  const facts = {
    aperture: aperture ? Math.round(aperture * 10) / 10 : null,
    shutter,
    iso,
    focalMm,
    focal35,
    focal35Source,
    isPhone,
    flashFired: flashRaw == null ? null : (flashRaw & 1) === 1, // bit 0 = flash fired
    whiteBalance: raw.WhiteBalance in WHITE_BALANCE ? WHITE_BALANCE[raw.WhiteBalance] : null,
    exposureBias: typeof raw.ExposureBiasValue === "number" ? raw.ExposureBiasValue : null,
  };

  const display = {
    // Many models already include the brand ("Canon EOS 90D"), so avoid "Canon Canon EOS 90D".
    Kamera:
      raw.Model && raw.Make && String(raw.Model).toLowerCase().startsWith(String(raw.Make).toLowerCase())
        ? raw.Model
        : [raw.Make, raw.Model].filter(Boolean).join(" ") || null,
    Lensa: raw.LensModel || null,
    "Tanggal ambil": raw.DateTimeOriginal instanceof Date ? raw.DateTimeOriginal.toLocaleString("id-ID") : null,
    "Mode exposure": EXPOSURE_PROGRAM[raw.ExposureProgram] ?? null,
    "Mode metering": METERING_MODE[raw.MeteringMode] ?? null,
    "Kompensasi exposure": facts.exposureBias != null ? `${facts.exposureBias > 0 ? "+" : ""}${facts.exposureBias.toFixed(1)} EV` : null,
    Flash: facts.flashFired == null ? null : facts.flashFired ? "Menyala" : "Tidak menyala",
    "White balance": facts.whiteBalance,
  };

  const missing = [];
  if (!facts.aperture) missing.push("aperture");
  if (!facts.shutter) missing.push("shutter speed");
  if (!facts.iso) missing.push("ISO");
  if (!facts.focal35) missing.push("focal length");

  const hasAnyExif = Object.keys(raw).length > 0;
  return { hasAnyExif, facts, display, missing };
}
