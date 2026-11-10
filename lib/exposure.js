// lib/exposure.js
// Pure exposure-triangle math shared by the Camera Simulator and the EXIF analyzer.
// Everything here is framework-free so it can be unit-tested with `npm test`
// and quoted directly in BAB III (perancangan) as the system's formulas.

/* ------------------------------------------------------------------ */
/* Standard camera scales (1/3-stop increments, as on most cameras).   */
/* Values are the NOMINAL numbers printed on cameras. The true 1/3-stop */
/* values differ slightly (e.g. f/5.6 is really 2^(5/2) = 5.657), which */
/* causes tiny (<0.1 EV) rounding differences. This is acceptable.      */
/* ------------------------------------------------------------------ */

export const APERTURES = [
  1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 9, 10, 11, 13, 14,
  16, 18, 20, 22,
];

// Shutter speeds in seconds, from slow to fast.
export const SHUTTER_SPEEDS = [
  1, 0.8, 0.6, 0.5, 0.4, 0.3, 1 / 4, 1 / 5, 1 / 6, 1 / 8, 1 / 10, 1 / 13, 1 / 15, 1 / 20, 1 / 25,
  1 / 30, 1 / 40, 1 / 50, 1 / 60, 1 / 80, 1 / 100, 1 / 125, 1 / 160, 1 / 200, 1 / 250, 1 / 320,
  1 / 400, 1 / 500, 1 / 640, 1 / 800, 1 / 1000, 1 / 1250, 1 / 1600, 1 / 2000, 1 / 2500, 1 / 3200,
  1 / 4000,
];

export const ISOS = [
  100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000,
  6400, 8000, 10000, 12800, 16000, 20000, 25600,
];

export const FOCAL_LENGTHS = [24, 35, 50, 85, 135, 200]; // mm, full-frame (35 mm) equivalent

/* --------------------------- Formatting --------------------------- */

/** Format shutter speed the way cameras display it: 1/250, 0.5", 1". */
export function formatShutter(t) {
  if (!Number.isFinite(t) || t <= 0) return "–";
  if (t >= 0.3) {
    const rounded = Math.round(t * 10) / 10;
    return `${rounded}"`;
  }
  return `1/${Math.round(1 / t)}`;
}

export function formatAperture(n) {
  if (!Number.isFinite(n)) return "–";
  return `f/${Number.isInteger(n) ? n : n.toFixed(1)}`;
}

export function formatStops(stops) {
  if (!Number.isFinite(stops)) return "–";
  const sign = stops > 0 ? "+" : stops < 0 ? "−" : "±";
  return `${sign}${Math.abs(stops).toFixed(1)} EV`;
}

/* ------------------------- Core exposure ------------------------- */

/**
 * Exposure Value of the camera settings: EV = log2(N² / t).
 * Higher EV = LESS light reaches the sensor.
 */
export function exposureValue(aperture, shutterSeconds) {
  return Math.log2((aperture * aperture) / shutterSeconds);
}

/**
 * Scene brightness normalised to ISO 100 (EV100), from settings that were
 * used to expose it correctly: EV100 = log2(N²/t) − log2(ISO/100).
 * Used by the analyzer to estimate how bright the scene was.
 */
export function ev100FromSettings(aperture, shutterSeconds, iso) {
  return exposureValue(aperture, shutterSeconds) - Math.log2(iso / 100);
}

/**
 * Exposure offset in stops relative to a correct exposure.
 *   required EV at this ISO = sceneEV100 + log2(ISO/100)
 *   offset = required EV − settings EV
 * offset > 0  → overexposed (more light than needed)
 * offset < 0  → underexposed
 */
export function exposureOffset({ aperture, shutter, iso }, sceneEv100) {
  const required = sceneEv100 + Math.log2(iso / 100);
  return required - exposureValue(aperture, shutter);
}

/** Meter verdict with a ±0.5 EV tolerance (one 1/3 stop plus rounding of nominal values). */
export function meterStatus(offset) {
  if (offset < -0.5) return "under";
  if (offset > 0.5) return "over";
  return "correct";
}

/** Find the index of the nearest value in a scale (compared in log2 space = in stops). */
export function nearestIndex(scale, value) {
  let best = 0;
  let bestDiff = Infinity;
  scale.forEach((v, i) => {
    const d = Math.abs(Math.log2(v) - Math.log2(value));
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  });
  return best;
}

export const nearest = (scale, value) => scale[nearestIndex(scale, value)];

/** Shutter speed (from the standard scale) that gives a correct exposure for N and ISO. */
export function correctShutterFor(aperture, iso, sceneEv100) {
  return nearest(SHUTTER_SPEEDS, exactCorrectShutter(aperture, iso, sceneEv100));
}

/** Exact (unrounded) shutter time for a correct exposure; may fall outside the camera's range. */
export function exactCorrectShutter(aperture, iso, sceneEv100) {
  const ev = sceneEv100 + Math.log2(iso / 100);
  return (aperture * aperture) / 2 ** ev;
}

/* ------------------- Simulator optics (simplified) ------------------- */

// Preview is 960 px wide and represents a 36 mm wide full-frame sensor.
export const SENSOR_WIDTH_MM = 36;
export const PREVIEW_WIDTH_PX = 960;
export const PX_PER_MM = PREVIEW_WIDTH_PX / SENSOR_WIDTH_MM; // ≈ 26.67 px per mm on the sensor

/**
 * Diameter of the blur disc (circle of confusion) on the sensor, in mm,
 * for an object at distance d when the lens is focused at distance s:
 *   b = f² / (N · (s − f)) · |d − s| / d
 * (thin-lens approximation; all distances in mm).
 */
export function blurDiscMm({ focalMm, aperture, focusMm, objectMm }) {
  if (focusMm <= focalMm) return 0;
  const k = (focalMm * focalMm) / (aperture * (focusMm - focalMm));
  return (k * Math.abs(objectMm - focusMm)) / objectMm;
}

/**
 * Length of motion blur on the sensor, in mm, for an object crossing the frame:
 *   image speed ≈ v · f / D   (mm/s on the sensor, v in mm/s, D in mm)
 *   blur length = image speed · t
 */
export function motionBlurMm({ speedKmh, distanceM, focalMm, shutter }) {
  const vMmPerS = (speedKmh * 1_000_000) / 3600;
  const imageSpeed = (vMmPerS * focalMm) / (distanceM * 1000);
  return imageSpeed * shutter;
}

/**
 * Handheld camera-shake blur in preview pixels (SIMPLIFIED MODEL).
 * Based on the reciprocal rule: shutter ≤ 1/focal length is "safe".
 * We calibrate so that exactly t = 1/f gives 1.5 px (barely visible):
 *   shake_px = 1.5 · f · t
 * Real shake depends on the person, stabilisation (IS/VR/OIS), and sensor resolution.
 */
export const SHAKE_CALIBRATION_PX = 1.5;
export function shakeBlurPx({ focalMm, shutter, onTripod }) {
  if (onTripod) return 0;
  return SHAKE_CALIBRATION_PX * focalMm * shutter;
}

/** Visible noise level 0..1 (SIMPLIFIED): grows by one step per stop above ISO 100, saturates at ISO 25600. */
export function noiseLevel(iso) {
  const stops = Math.log2(iso / 100);
  return Math.min(1, Math.max(0, stops / 8));
}

/** Slowest handheld-safe shutter speed by the reciprocal rule (1 / focal35). */
export function reciprocalLimit(focal35) {
  return 1 / focal35;
}

/**
 * Compute every number the simulator needs for one combination of settings + scene.
 * Returned values are in preview pixels so the UI can render them directly.
 */
export function computeMetrics(settings, scene) {
  const { aperture, shutter, iso, focalMm, onTripod } = settings;
  const focusMm = scene.subjectDistanceM * 1000;

  const evSettings = exposureValue(aperture, shutter);
  const evRequired = scene.ev100 + Math.log2(iso / 100);
  const offset = evRequired - evSettings;

  const bgBlurPx =
    blurDiscMm({ focalMm, aperture, focusMm, objectMm: scene.backgroundDistanceM * 1000 }) *
    PX_PER_MM;
  const carDofBlurPx =
    blurDiscMm({ focalMm, aperture, focusMm, objectMm: scene.carDistanceM * 1000 }) * PX_PER_MM;
  const motionBlurPx =
    motionBlurMm({
      speedKmh: scene.carSpeedKmh,
      distanceM: scene.carDistanceM,
      focalMm,
      shutter,
    }) * PX_PER_MM;
  const shakePx = shakeBlurPx({ focalMm, shutter, onTripod });

  return {
    evSettings,
    evRequired,
    offset,
    status: meterStatus(offset),
    bgBlurPx,
    carDofBlurPx,
    motionBlurPx,
    shakePx,
    shakeRisk: !onTripod && shutter > reciprocalLimit(focalMm),
    noise: noiseLevel(iso),
  };
}
