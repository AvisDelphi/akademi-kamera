// lib/imageAnalysis.js
// Measures the photo's pixels so suggestions still work when EXIF is missing.
// The image is downscaled to max 512 px on the long edge for speed;
// all values are therefore approximate indicators, not lab measurements.

const MAX_EDGE = 512;

/** Rec. 709 luma from 8-bit sRGB channels, 0..255. */
const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/**
 * Pure analysis of an RGBA pixel buffer (exported separately so it can be unit-tested).
 * Returns histogram (64 bins), mean luma (0..1), clipping percentages,
 * sharpness indicator, and red/blue balance.
 */
export function analyzePixels(data, width, height) {
  const total = width * height;
  const hist = new Array(64).fill(0);
  const gray = new Float32Array(total);
  let sum = 0;
  let clipHigh = 0;
  let clipLow = 0;
  let sumR = 0;
  let sumB = 0;

  for (let i = 0, p = 0; p < total; i += 4, p++) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const y = luma(r, g, b);
    gray[p] = y;
    sum += y;
    hist[Math.min(63, Math.floor(y / 4))]++;
    if (y >= 250) clipHigh++;
    if (y <= 5) clipLow++;
    sumR += r;
    sumB += b;
  }

  // Sharpness: Laplacian response, measured per 32×32 block. We take the
  // 90th-percentile block so an intentionally blurred background (bokeh)
  // does not make a sharp subject look "blurry".
  const BLOCK = 32;
  const blockScores = [];
  for (let by = 1; by + BLOCK < height; by += BLOCK) {
    for (let bx = 1; bx + BLOCK < width; bx += BLOCK) {
      let s = 0;
      let s2 = 0;
      let n = 0;
      for (let y = by; y < by + BLOCK; y++) {
        for (let x = bx; x < bx + BLOCK; x++) {
          const c = y * width + x;
          const lap = 4 * gray[c] - gray[c - 1] - gray[c + 1] - gray[c - width] - gray[c + width];
          s += lap;
          s2 += lap * lap;
          n++;
        }
      }
      const mean = s / n;
      blockScores.push(s2 / n - mean * mean); // variance of the Laplacian
    }
  }
  blockScores.sort((a, b) => a - b);
  const sharpness = blockScores.length ? blockScores[Math.floor(blockScores.length * 0.9)] : 0;

  return {
    histogram: hist.map((v) => v / total),
    meanLuma: sum / total / 255,
    clipHighPct: (clipHigh / total) * 100,
    clipLowPct: (clipLow / total) * 100,
    sharpness: Math.round(sharpness),
    redBlueRatio: sumB > 0 ? sumR / sumB : 1,
  };
}

/** Load a File into an <img>, draw it downscaled, and analyse it. Returns null if the browser cannot decode it (e.g. HEIC on Chrome). */
export async function analyzeImageFile(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    return { ...analyzePixels(data, w, h), width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
