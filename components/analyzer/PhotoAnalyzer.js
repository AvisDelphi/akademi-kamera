"use client";
// components/analyzer/PhotoAnalyzer.js
// Upload → read EXIF + measure pixels (both in the browser) → rule engine → suggestions.
import { useEffect, useMemo, useState } from "react";
import { extractExif } from "@/lib/exif";
import { analyzeImageFile } from "@/lib/imageAnalysis";
import { evaluateRules } from "@/lib/rules";
import { savePhotoAnalysis } from "@/lib/progress";
import { APERTURES, SHUTTER_SPEEDS, ISOS, formatAperture, formatShutter } from "@/lib/exposure";

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/tiff"];
const ACCEPTED_EXT = /\.(jpe?g|png|webp|heic|heif|tiff?)$/i;

const SEVERITY = {
  warning: { label: "Perlu diperbaiki", color: "var(--color-over)" },
  ok: { label: "Sudah baik", color: "var(--color-correct)" },
  tip: { label: "Saran", color: "var(--color-amber)" },
  info: { label: "Info", color: "var(--color-under)" },
};

const STATUS_TEXT = { fired: "Terpicu", "not-fired": "Tidak terpicu", skipped: "Dilewati" };
const FACT_LABEL = {
  aperture: "aperture", shutter: "shutter speed", iso: "ISO", focal35: "focal length",
  flashFired: "data flash", meanLuma: "data piksel", clipHighPct: "data piksel",
  clipLowPct: "data piksel", sharpness: "data piksel", redBlueRatio: "data piksel",
};
const EMPTY_MANUAL = { aperture: "", shutter: "", iso: "", focal35: "" };

function Histogram({ bins }) {
  const max = Math.max(...bins, 1e-6);
  const w = 256;
  const h = 80;
  const points = bins.map((v, i) => `${(i / (bins.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full" role="img" aria-label="Histogram luminans foto">
      <polygon points={`0,${h} ${points} ${w},${h}`} fill="var(--color-muted)" opacity="0.6" />
      <line x1="0" x2={w} y1={h} y2={h} stroke="var(--color-rule)" />
    </svg>
  );
}

export default function PhotoAnalyzer() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | reading | done
  const [error, setError] = useState(null);
  const [exif, setExif] = useState(null);
  const [pixels, setPixels] = useState(null);
  const [manual, setManual] = useState(EMPTY_MANUAL);
  const [dragging, setDragging] = useState(false);

  // Free the object URL when the photo changes or the page closes.
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  async function handleFile(f) {
    setError(null);
    if (!f) return;
    if (!(ACCEPTED.includes(f.type) || ACCEPTED_EXT.test(f.name))) {
      setError("Format tidak didukung. Gunakan JPG, PNG, WEBP, HEIC, atau TIFF.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("Ukuran foto lebih dari 25 MB. Perkecil dulu, lalu coba lagi.");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setManual(EMPTY_MANUAL);
    setStatus("reading");
    const [exifResult, pixelResult] = await Promise.all([extractExif(f), analyzeImageFile(f)]);
    setExif(exifResult);
    setPixels(pixelResult);
    setStatus("done");
  }

  // Facts = EXIF, then manual values fill only the gaps, then pixel measurements.
  const facts = useMemo(() => {
    if (!exif) return null;
    const m = {
      aperture: manual.aperture ? Number(manual.aperture) : null,
      shutter: manual.shutter ? Number(manual.shutter) : null,
      iso: manual.iso ? Number(manual.iso) : null,
      focal35: manual.focal35 ? Number(manual.focal35) : null,
    };
    return {
      ...exif.facts,
      aperture: exif.facts.aperture ?? m.aperture,
      shutter: exif.facts.shutter ?? m.shutter,
      iso: exif.facts.iso ?? m.iso,
      focal35: exif.facts.focal35 ?? (m.focal35 > 0 ? m.focal35 : null),
      meanLuma: pixels?.meanLuma ?? null,
      clipHighPct: pixels?.clipHighPct ?? null,
      clipLowPct: pixels?.clipLowPct ?? null,
      sharpness: pixels?.sharpness ?? null,
      redBlueRatio: pixels?.redBlueRatio ?? null,
    };
  }, [exif, pixels, manual]);

  const inference = useMemo(() => (facts ? evaluateRules(facts) : null), [facts]);

  // Store a record for logged-in users (metadata and numbers only, never the photo).
  useEffect(() => {
    if (status !== "done" || !inference) return;
    savePhotoAnalysis({
      exif: exif.facts,
      imageMetrics: pixels ? { ...pixels, histogram: undefined } : null,
      firedRuleIds: inference.suggestions.map((s) => s.id),
    });
    // Only once per uploaded photo:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const setField = (k) => (e) => setManual((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Left: upload, preview, measured data */}
      <section aria-label="Foto dan data">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`block cursor-pointer rounded border-2 border-dashed p-6 text-center ${
            dragging ? "border-amber" : "border-rule"
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/tiff,.heic,.heif"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <span className="font-display text-lg font-semibold">{file ? "Ganti foto" : "Pilih atau seret foto ke sini"}</span>
          <span className="mt-1 block text-sm text-muted">
            JPG langsung dari kamera atau ponsel paling lengkap datanya. Maksimal 25 MB. Foto diproses di perangkatmu dan tidak diunggah.
          </span>
        </label>
        {error && (
          <p role="alert" className="mt-3 text-sm text-over">
            {error}
          </p>
        )}

        {previewUrl && (
          <figure className="mt-4">
            {pixels ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Foto yang dianalisis" className="max-h-[420px] w-full rounded object-contain" />
            ) : (
              status === "done" && (
                <p className="rounded bg-panel p-4 text-sm text-muted">
                  Browser ini tidak bisa menampilkan format foto ini (misalnya HEIC di Chrome), jadi analisis piksel dilewati. Data EXIF tetap dibaca.
                </p>
              )
            )}
            {file && <figcaption className="mt-1 truncate text-xs text-muted">{file.name}</figcaption>}
          </figure>
        )}

        {status === "reading" && <p className="mt-4 text-muted">Membaca metadata dan mengukur foto…</p>}

        {status === "done" && pixels && (
          <div className="mt-6">
            <h2 className="font-display text-xl font-semibold">Histogram</h2>
            <Histogram bins={pixels.histogram} />
            <p className="text-sm text-muted tabular">
              Rata-rata {Math.round(pixels.meanLuma * 100)}%, shadow terpotong {pixels.clipLowPct.toFixed(1)}%, highlight terpotong{" "}
              {pixels.clipHighPct.toFixed(1)}%, ketajaman {pixels.sharpness}
            </p>
          </div>
        )}

        {status === "done" && exif?.hasAnyExif && (
          <div className="mt-6">
            <h2 className="font-display text-xl font-semibold">Data EXIF</h2>
            <table className="mt-2 w-full text-sm">
              <tbody>
                {[
                  ["Aperture", exif.facts.aperture ? formatAperture(exif.facts.aperture) : null],
                  ["Shutter speed", exif.facts.shutter ? formatShutter(exif.facts.shutter) : null],
                  ["ISO", exif.facts.iso],
                  [
                    "Focal length",
                    exif.facts.focalMm
                      ? `${exif.facts.focalMm} mm${exif.facts.focal35Source === "exif" ? ` (setara ${exif.facts.focal35} mm)` : ""}`
                      : null,
                  ],
                  ...Object.entries(exif.display),
                ].map(([k, v]) => (
                  <tr key={k} className="border-t border-rule">
                    <th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">
                      {k}
                    </th>
                    <td className="py-1.5 tabular">{v ?? <span className="text-muted">tidak ada</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {exif.facts.focal35Source === "assumed-full-frame" && (
              <p className="mt-2 text-xs text-muted">
                Focal length setara 35 mm tidak tercatat, jadi diasumsikan kamera full-frame. Untuk APS-C, nilai sebenarnya sekitar 1,5×.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Right: missing-data form, suggestions, inference trace */}
      <section aria-label="Hasil analisis" aria-live="polite">
        {status === "idle" && (
          <div className="rounded bg-panel p-6">
            <h2 className="font-display text-2xl font-semibold">Unggah foto untuk mendapat saran</h2>
            <p className="mt-2 max-w-prose text-muted">
              Sistem membaca aperture, shutter, ISO, dan focal length dari metadata EXIF, mengukur kecerahan dan ketajaman foto,
              lalu mencocokkannya dengan aturan fotografi untuk menyarankan setelan yang lebih baik.
            </p>
          </div>
        )}

        {status === "done" && exif && exif.missing.length > 0 && (
          <div className="mb-6 rounded border border-rule p-5">
            <h2 className="font-display text-xl font-semibold">
              {exif.hasAnyExif ? "Sebagian data setelan tidak ada" : "Metadata EXIF tidak ditemukan"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {exif.hasAnyExif
                ? `Tidak tercatat: ${exif.missing.join(", ")}.`
                : "Biasanya terhapus saat foto dikirim lewat WhatsApp, diunggah ke media sosial, atau berupa screenshot."}{" "}
              Saran berbasis histogram tetap berjalan. Isi setelan yang kamu ingat agar saran exposure triangle ikut muncul.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {exif.missing.includes("aperture") && (
                <label className="text-muted">
                  Aperture
                  <select value={manual.aperture} onChange={setField("aperture")} className="mt-1 block w-full rounded border border-rule bg-panel px-2 py-1.5 text-ink">
                    <option value="">Tidak tahu</option>
                    {APERTURES.map((a) => <option key={a} value={a}>{formatAperture(a)}</option>)}
                  </select>
                </label>
              )}
              {exif.missing.includes("shutter speed") && (
                <label className="text-muted">
                  Shutter
                  <select value={manual.shutter} onChange={setField("shutter")} className="mt-1 block w-full rounded border border-rule bg-panel px-2 py-1.5 text-ink">
                    <option value="">Tidak tahu</option>
                    {SHUTTER_SPEEDS.map((t) => <option key={t} value={t}>{formatShutter(t)}</option>)}
                  </select>
                </label>
              )}
              {exif.missing.includes("ISO") && (
                <label className="text-muted">
                  ISO
                  <select value={manual.iso} onChange={setField("iso")} className="mt-1 block w-full rounded border border-rule bg-panel px-2 py-1.5 text-ink">
                    <option value="">Tidak tahu</option>
                    {ISOS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </label>
              )}
              {exif.missing.includes("focal length") && (
                <label className="text-muted">
                  Focal (setara 35 mm)
                  <input
                    type="number"
                    min="8"
                    max="800"
                    inputMode="numeric"
                    placeholder="mis. 50"
                    value={manual.focal35}
                    onChange={setField("focal35")}
                    className="mt-1 block w-full rounded border border-rule bg-panel px-2 py-1.5 text-ink"
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {status === "done" && inference && (
          <>
            <h2 className="font-display text-2xl font-semibold">Saran</h2>
            {inference.suggestions.length === 0 && (
              <p className="mt-2 text-muted">Data foto ini belum cukup untuk memberi saran. Isi setelan di atas jika kamu mengingatnya.</p>
            )}
            <ul className="mt-3 space-y-4">
              {inference.suggestions.map((s) => (
                <li key={s.id} className="border-l-4 pl-4" style={{ borderColor: SEVERITY[s.severity].color }}>
                  <p className="text-xs" style={{ color: SEVERITY[s.severity].color }}>
                    {SEVERITY[s.severity].label} ({s.id})
                  </p>
                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 max-w-prose text-sm leading-relaxed">{s.message}</p>
                  {s.changes?.length > 0 && (
                    <dl className="mt-2 flex flex-wrap gap-2 text-sm">
                      {s.changes.map((c) => (
                        <div key={c.setting} className="rounded bg-panel px-2 py-1 tabular">
                          <dt className="inline text-muted">{c.setting} </dt>
                          <dd className="inline">
                            {c.from} <span aria-label="menjadi">›</span> <strong className="font-semibold text-amber">{c.to}</strong>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </li>
              ))}
            </ul>

            <details className="mt-8 text-sm">
              <summary className="cursor-pointer font-display text-lg font-semibold">Mengapa saran ini muncul</summary>
              <p className="mt-2 text-muted">
                Setiap aturan dicek terhadap data foto. Aturan dilewati jika data yang dibutuhkan tidak tersedia, sehingga sistem tidak menebak.
              </p>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left">
                  <thead className="text-muted">
                    <tr>
                      <th className="py-1 pr-3 font-normal">Aturan</th>
                      <th className="py-1 pr-3 font-normal">Kondisi</th>
                      <th className="py-1 font-normal">Hasil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inference.trace.map((t) => (
                      <tr key={t.id} className="border-t border-rule align-top">
                        <td className="py-1.5 pr-3">
                          {t.id} {t.name}
                        </td>
                        <td className="py-1.5 pr-3 text-muted">{t.condition}</td>
                        <td className="py-1.5" style={{ color: t.status === "fired" ? "var(--color-amber)" : undefined }}>
                          {STATUS_TEXT[t.status]}
                          {t.status === "skipped" && <span className="block text-xs text-muted">butuh {[...new Set(t.missing.map((k) => FACT_LABEL[k] ?? k))].join(", ")}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
      </section>
    </div>
  );
}
