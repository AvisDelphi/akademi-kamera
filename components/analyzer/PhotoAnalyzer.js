"use client";
// components/analyzer/PhotoAnalyzer.js
// Upload → read EXIF + measure pixels (both in the browser) → rule engine → suggestions.
import { useEffect, useMemo, useState } from "react";
import { extractExif } from "@/lib/exif";
import { analyzeImageFile } from "@/lib/imageAnalysis";
import { evaluateRules } from "@/lib/rules";
import { savePhotoAnalysis } from "@/lib/progress";
import { APERTURES, SHUTTER_SPEEDS, ISOS, formatAperture, formatShutter } from "@/lib/exposure";
import { AlertIcon, CheckIcon, ImageIcon, InfoIcon } from "@/components/icons";
import { Banner, Pill, Skeleton, btn, inputClass } from "@/components/lms/ui";

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/tiff"];
const ACCEPTED_EXT = /\.(jpe?g|png|webp|heic|heif|tiff?)$/i;

const SEVERITY = {
  warning: { label: "Perlu diperbaiki", tone: "warning", Icon: AlertIcon },
  ok: { label: "Sudah baik", tone: "success", Icon: CheckIcon },
  tip: { label: "Saran", tone: "neutral", Icon: InfoIcon },
  info: { label: "Info", tone: "info", Icon: InfoIcon },
};

const TABS = [
  { id: "saran", label: "Saran" },
  { id: "histogram", label: "Histogram" },
  { id: "exif", label: "Data EXIF" },
  { id: "jejak", label: "Mengapa saran ini muncul" },
];

const EXIF_GROUPS = [
  { title: "Setelan", keys: null },
  { title: "Perangkat", keys: ["Kamera", "Lensa"] },
  {
    title: "Lainnya",
    keys: ["Tanggal ambil", "Mode exposure", "Mode metering", "Kompensasi exposure", "Flash", "White balance"],
  },
];

const STATUS_TEXT = { fired: "Terpicu", "not-fired": "Tidak terpicu", skipped: "Dilewati" };
const FACT_LABEL = {
  aperture: "aperture", shutter: "shutter speed", iso: "ISO", focal35: "focal length",
  flashFired: "data flash", meanLuma: "data piksel", clipHighPct: "data piksel",
  clipLowPct: "data piksel", sharpness: "data piksel", redBlueRatio: "data piksel",
};
const EMPTY_MANUAL = { aperture: "", shutter: "", iso: "", focal35: "" };

/** Histogram di zona foto netral; area terpotong diarsir dengan warna Bahaya (UIUX_GUIDELINE §8.14). */
function Histogram({ bins, clipLowPct, clipHighPct }) {
  const max = Math.max(...bins, 1e-6);
  const w = 256;
  const h = 96;
  const points = bins.map((v, i) => `${(i / (bins.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  const edge = (w / bins.length) * 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-32 w-full" role="img" aria-label="Histogram luminans foto">
      <defs>
        <pattern id="arsir" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#b3372f" fillOpacity="0.55" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#f5c6c2" strokeWidth="2" />
        </pattern>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={w * f} x2={w * f} y1="0" y2={h} stroke="#444444" strokeWidth="0.75" />
      ))}
      <polygon points={`0,${h} ${points} ${w},${h}`} fill="#a8a8a8" opacity="0.8" />
      {clipLowPct >= 0.5 && <rect x="0" y="0" width={edge} height={h} fill="url(#arsir)" />}
      {clipHighPct >= 0.5 && <rect x={w - edge} y="0" width={edge} height={h} fill="url(#arsir)" />}
      <line x1="0" x2={w} y1={h} y2={h} stroke="#444444" />
    </svg>
  );
}

/** Tombol/zona pemilih file: input disembunyikan secara visual, label yang berperan sebagai target. */
function FilePicker({ onFile, className, children, onDragOver, onDragLeave, onDrop }) {
  return (
    <label
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`${className} focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-sprout-300`}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/tiff,.heic,.heif"
        className="sr-only"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {children}
    </label>
  );
}

const pctText = (n) => n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function formatSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toLocaleString("id-ID", { maximumFractionDigits: 1 })} MB` : `${Math.round(bytes / 1024)} KB`;
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
  const [tab, setTab] = useState("saran");

  // Free the object URL when the photo changes or the page closes.
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  async function handleFile(f) {
    setError(null);
    if (!f) return;
    if (!(ACCEPTED.includes(f.type) || ACCEPTED_EXT.test(f.name))) {
      setError("Format foto belum didukung. Gunakan JPG, PNG, WEBP, HEIC, atau TIFF.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("Ukuran foto maks. 25 MB. Pilih foto lain atau kecilkan resolusinya.");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setManual(EMPTY_MANUAL);
    setTab("saran");
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

  const dropProps = {
    onDragOver: (e) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e) => {
      e.preventDefault();
      setDragging(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
  };

  const setField = (k) => (e) => setManual((prev) => ({ ...prev, [k]: e.target.value }));

  const overline = "text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500";
  const selectClass = `${inputClass} mt-1.5`;
  const settingsPills = exif
    ? [
        exif.facts.aperture && formatAperture(exif.facts.aperture),
        exif.facts.shutter && formatShutter(exif.facts.shutter),
        exif.facts.iso && `ISO ${exif.facts.iso.toLocaleString("id-ID")}`,
        exif.facts.focalMm && `${exif.facts.focalMm} mm`,
      ].filter(Boolean)
    : [];

  return (
    <div className="pb-4">
      {/* 1. Unggah */}
      {status === "idle" && (
        <>
          <FilePicker
            onFile={handleFile}
            {...dropProps}
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors duration-[120ms] ${
              dragging ? "border-sprout-600 bg-sprout-100" : "border-tinta-200 bg-white hover:border-tinta-300"
            }`}
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-sprout-100 text-sprout-800">
              <ImageIcon size={28} />
            </span>
            <span className="text-lg font-semibold leading-7">Tarik foto ke sini atau pilih file</span>
            <span className="text-xs font-medium text-tinta-500">JPG, PNG, WEBP, HEIC, atau TIFF, maks. 25 MB</span>
            <span className={`${btn("primary", "m")} mt-2`}>Pilih foto</span>
          </FilePicker>

          {error && (
            <div className="mt-4">
              <Banner tone="danger" role="alert">
                {error}
              </Banner>
            </div>
          )}

          <div className="mt-4">
            <Banner tone="info">
              Foto diproses di browsermu dan tidak dikirim ke server. Data lokasi GPS tidak dibaca. JPG langsung dari
              kamera atau ponsel paling lengkap datanya.
            </Banner>
          </div>

          <div className="mt-8 rounded-3xl border border-tinta-100 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold leading-7">Apa yang kamu dapat</h2>
            <p className="mt-2 max-w-[68ch] text-sm leading-[22px] text-tinta-500">
              Sistem membaca aperture, shutter, ISO, dan focal length dari metadata EXIF, mengukur kecerahan dan ketajaman
              foto, lalu mencocokkannya dengan aturan fotografi untuk menyarankan setelan yang lebih baik.
            </p>
          </div>
        </>
      )}

      {/* 2. Memproses */}
      {status === "reading" && (
        <div role="status" aria-live="polite" className="space-y-4">
          <p className="text-sm font-semibold text-tinta-600">Membaca EXIF… · Mengukur piksel…</p>
          <div className="grid gap-6 lg:grid-cols-12">
            <Skeleton className="h-80 rounded-3xl lg:col-span-7" />
            <Skeleton className="h-80 rounded-3xl lg:col-span-5" />
          </div>
        </div>
      )}

      {/* 3. Hasil */}
      {status === "done" && exif && (
        <div className="space-y-6">
          {error && (
            <Banner tone="danger" role="alert">
              {error}
            </Banner>
          )}

          <div className="grid gap-6 lg:grid-cols-12">
            <figure data-surface="dark" className="rounded-3xl bg-photo-surround p-4 sm:p-6 lg:col-span-7">
              {pixels ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Foto yang dianalisis" className="mx-auto max-h-[480px] w-full rounded-lg object-contain" />
              ) : (
                <div className="grid h-64 place-items-center text-center text-photo-text">
                  <div>
                    <ImageIcon size={32} className="mx-auto" />
                    <p className="mt-3 text-sm">Pratinjau tidak tersedia di browser ini</p>
                    <p className="mt-1 text-xs opacity-80">Format seperti HEIC tidak bisa ditampilkan di Chrome. Data EXIF tetap dibaca.</p>
                  </div>
                </div>
              )}
              {file && (
                <figcaption className="mt-3 truncate text-xs text-photo-text tabular">
                  {file.name} · {formatSize(file.size)}
                </figcaption>
              )}
            </figure>

            <section aria-label="Ringkasan" className="rounded-3xl border border-tinta-100 bg-white p-6 lg:col-span-5">
              <p className={overline}>Ringkasan</p>
              {settingsPills.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {settingsPills.map((pill) => (
                    <li key={pill} className="rounded-lg bg-tinta-50 px-3 py-1.5 text-sm font-semibold tabular">
                      {pill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-tinta-500">Setelan kamera tidak tercatat di foto ini.</p>
              )}
              {(exif.display.Kamera || exif.display.Lensa) && (
                <p className="mt-3 text-sm font-medium text-tinta-600">
                  {[exif.display.Kamera, exif.display.Lensa].filter(Boolean).join(" · ")}
                </p>
              )}
              {pixels && (
                <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-tinta-100 pt-5">
                  <div>
                    <dt className={overline}>Kecerahan rata-rata</dt>
                    <dd className="mt-1 text-sm font-semibold tabular">{Math.round(pixels.meanLuma * 100)}%</dd>
                  </div>
                  <div>
                    <dt className={overline}>Ketajaman (perkiraan)</dt>
                    <dd className="mt-1 text-sm font-semibold tabular">{pixels.sharpness}</dd>
                  </div>
                  <div>
                    <dt className={overline}>Shadow terpotong</dt>
                    <dd className="mt-1 text-sm font-semibold tabular">{pctText(pixels.clipLowPct)}%</dd>
                  </div>
                  <div>
                    <dt className={overline}>Highlight terpotong</dt>
                    <dd className="mt-1 text-sm font-semibold tabular">{pctText(pixels.clipHighPct)}%</dd>
                  </div>
                </dl>
              )}
              <FilePicker onFile={handleFile} {...dropProps} className={`${btn("secondary", "m")} mt-6 w-full cursor-pointer`}>
                Ganti foto
              </FilePicker>
            </section>
          </div>

          {/* Data setelan tidak lengkap */}
          {exif.missing.length > 0 && (
            <div className="rounded-3xl border border-warn-line bg-warn-bg p-6">
              <p className="flex items-center gap-2 text-base font-semibold text-warn-fg">
                <AlertIcon size={20} />
                {exif.hasAnyExif ? "Sebagian data setelan tidak ada" : "Foto ini tidak memiliki data EXIF"}
              </p>
              <p className="mt-2 max-w-[68ch] text-sm leading-[22px] text-warn-fg">
                {exif.hasAnyExif
                  ? `Tidak tercatat: ${exif.missing.join(", ")}.`
                  : "Biasanya terhapus saat foto dikirim lewat WhatsApp, diunggah ke media sosial, atau berupa screenshot."}{" "}
                Saran berbasis histogram tetap ditampilkan. Isi setelan sesuai kamera saat memotret agar saran exposure
                triangle ikut muncul.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {exif.missing.includes("aperture") && (
                  <label className="text-sm font-semibold text-tinta-600">
                    Aperture
                    <select value={manual.aperture} onChange={setField("aperture")} className={selectClass}>
                      <option value="">Tidak tahu</option>
                      {APERTURES.map((a) => (
                        <option key={a} value={a}>
                          {formatAperture(a)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {exif.missing.includes("shutter speed") && (
                  <label className="text-sm font-semibold text-tinta-600">
                    Shutter
                    <select value={manual.shutter} onChange={setField("shutter")} className={selectClass}>
                      <option value="">Tidak tahu</option>
                      {SHUTTER_SPEEDS.map((t) => (
                        <option key={t} value={t}>
                          {formatShutter(t)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {exif.missing.includes("ISO") && (
                  <label className="text-sm font-semibold text-tinta-600">
                    ISO
                    <select value={manual.iso} onChange={setField("iso")} className={selectClass}>
                      <option value="">Tidak tahu</option>
                      {ISOS.map((i) => (
                        <option key={i} value={i}>
                          ISO {i.toLocaleString("id-ID")}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {exif.missing.includes("focal length") && (
                  <label className="text-sm font-semibold text-tinta-600">
                    Focal (setara 35 mm)
                    <input
                      type="number"
                      min="8"
                      max="800"
                      inputMode="numeric"
                      placeholder="mis. 50"
                      value={manual.focal35}
                      onChange={setField("focal35")}
                      className={selectClass}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Tab hasil */}
          {inference && (
            <section aria-label="Hasil analisis">
              <div role="tablist" aria-label="Hasil analisis" className="flex gap-6 overflow-x-auto border-b border-tinta-100">
                {TABS.map((item) => {
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      id={`tab-${item.id}`}
                      aria-selected={active}
                      aria-controls={`panel-${item.id}`}
                      tabIndex={active ? 0 : -1}
                      onClick={() => setTab(item.id)}
                      onKeyDown={(e) => {
                        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                        const dir = e.key === "ArrowRight" ? 1 : -1;
                        const next = TABS[(TABS.findIndex((t) => t.id === tab) + dir + TABS.length) % TABS.length];
                        setTab(next.id);
                        document.getElementById(`tab-${next.id}`)?.focus();
                      }}
                      className={`-mb-px h-12 shrink-0 border-b-2 text-sm font-semibold transition-colors duration-[120ms] ${
                        active ? "border-sprout-300 text-tinta-900" : "border-transparent text-tinta-500 hover:text-tinta-900"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-6">
                {tab === "saran" && (
                  <div>
                    {inference.suggestions.length === 0 && (
                      <p className="rounded-3xl border border-dashed border-tinta-200 bg-white p-6 text-sm text-tinta-500">
                        Data foto ini belum cukup untuk memberi saran. Isi setelan di atas jika kamu mengingatnya.
                      </p>
                    )}
                    <ul className="space-y-4">
                      {inference.suggestions.map((sug) => {
                        const sev = SEVERITY[sug.severity];
                        return (
                          <li key={sug.id} className="rounded-3xl border border-tinta-100 bg-white p-6">
                            <Pill tone={sev.tone} Icon={sev.Icon}>
                              {sev.label} ({sug.id})
                            </Pill>
                            <h3 className="mt-3 text-base font-semibold leading-6">{sug.title}</h3>
                            <p className="mt-1 max-w-[68ch] text-sm leading-[22px] text-tinta-600">{sug.message}</p>
                            {sug.changes?.length > 0 && (
                              <dl className="mt-4 flex flex-wrap gap-2 text-sm">
                                {sug.changes.map((c) => (
                                  <div key={c.setting} className="rounded-lg bg-tinta-50 px-3 py-1.5 tabular">
                                    <dt className="inline font-medium text-tinta-500">{c.setting} </dt>
                                    <dd className="inline font-semibold">
                                      {c.from} <span aria-label="menjadi">→</span> {c.to}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {tab === "histogram" &&
                  (pixels ? (
                    <div data-surface="dark" className="rounded-3xl bg-photo-surround p-4 sm:p-6">
                      <Histogram bins={pixels.histogram} clipLowPct={pixels.clipLowPct} clipHighPct={pixels.clipHighPct} />
                      <p className="mt-3 text-xs text-photo-text tabular sm:text-sm">
                        Rata-rata {Math.round(pixels.meanLuma * 100)}% · {pctText(pixels.clipLowPct)}% shadow terpotong ·{" "}
                        {pctText(pixels.clipHighPct)}% highlight terpotong · ketajaman {pixels.sharpness} (perkiraan)
                      </p>
                    </div>
                  ) : (
                    <p className="rounded-3xl border border-dashed border-tinta-200 bg-white p-6 text-sm text-tinta-500">
                      Analisis piksel dilewati karena browser tidak bisa membuka format foto ini.
                    </p>
                  ))}

                {tab === "exif" && (
                  <div className="space-y-4">
                    {EXIF_GROUPS.map((group) => {
                      const rows = group.keys
                        ? group.keys.map((key) => [key, exif.display[key]])
                        : [
                            ["Aperture", exif.facts.aperture ? formatAperture(exif.facts.aperture) : null],
                            ["Shutter speed", exif.facts.shutter ? formatShutter(exif.facts.shutter) : null],
                            ["ISO", exif.facts.iso ? exif.facts.iso.toLocaleString("id-ID") : null],
                            [
                              "Focal length",
                              exif.facts.focalMm
                                ? `${exif.facts.focalMm} mm${exif.facts.focal35Source === "exif" ? ` (setara ${exif.facts.focal35} mm)` : ""}`
                                : null,
                            ],
                          ];
                      return (
                        <div key={group.title} className="overflow-hidden rounded-3xl border border-tinta-100 bg-white">
                          <h3 className={`${overline} bg-tinta-50 px-5 py-3`}>{group.title}</h3>
                          <table className="w-full text-sm">
                            <tbody className="divide-y divide-tinta-100">
                              {rows.map(([name, value]) => (
                                <tr key={name}>
                                  <th scope="row" className="w-2/5 px-5 py-3 text-left font-medium text-tinta-500">
                                    {name}
                                  </th>
                                  <td className="px-5 py-3 font-semibold tabular">
                                    {value ?? <span className="font-normal text-tinta-400">Tidak tercatat</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                    {exif.facts.focal35Source === "assumed-full-frame" && (
                      <p className="text-xs font-medium text-tinta-500">
                        Focal length setara 35 mm tidak tercatat, jadi diasumsikan kamera full-frame. Untuk APS-C, nilai
                        sebenarnya sekitar 1,5×.
                      </p>
                    )}
                  </div>
                )}

                {tab === "jejak" && (
                  <div>
                    <p className="max-w-[68ch] text-sm leading-[22px] text-tinta-500">
                      Setiap aturan dicek terhadap data foto. Aturan dilewati jika data yang dibutuhkan tidak tersedia,
                      sehingga sistem tidak menebak.
                    </p>
                    <div className="mt-4 overflow-x-auto rounded-3xl border border-tinta-100 bg-white">
                      <table className="w-full min-w-[560px] text-left text-sm">
                        <thead className="bg-tinta-50">
                          <tr>
                            <th className={`${overline} px-5 py-3 font-semibold`}>Aturan</th>
                            <th className={`${overline} px-5 py-3 font-semibold`}>Kondisi</th>
                            <th className={`${overline} px-5 py-3 font-semibold`}>Hasil</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-tinta-100">
                          {inference.trace.map((t) => (
                            <tr key={t.id} className="align-top">
                              <td className="px-5 py-3 font-semibold">
                                {t.id} {t.name}
                              </td>
                              <td className="px-5 py-3 text-tinta-500">{t.condition}</td>
                              <td className="px-5 py-3">
                                <Pill tone={t.status === "fired" ? "warning" : t.status === "skipped" ? "neutral" : "info"}>
                                  {STATUS_TEXT[t.status]}
                                </Pill>
                                {t.status === "skipped" && (
                                  <span className="mt-1 block text-xs font-medium text-tinta-500">
                                    Butuh {[...new Set(t.missing.map((k) => FACT_LABEL[k] ?? k))].join(", ")}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="flex justify-center pt-2">
            <FilePicker onFile={handleFile} {...dropProps} className={`${btn("primary", "l")} cursor-pointer`}>
              Analisis foto lain
            </FilePicker>
          </div>
        </div>
      )}
    </div>
  );
}
