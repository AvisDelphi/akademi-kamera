"use client";
// components/simulator/CameraSimulator.js
// Interactive virtual camera (manual mode) with guided exercises.
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SceneView from "./SceneView";
import ExposureMeter from "./ExposureMeter";
import SettingDial from "./SettingDial";
import {
  APERTURES, SHUTTER_SPEEDS, ISOS, FOCAL_LENGTHS,
  computeMetrics, formatAperture, formatShutter, nearestIndex, correctShutterFor, exactCorrectShutter,
} from "@/lib/exposure";
import { SCENES, getScene } from "@/lib/scenes";
import { EXERCISES, getExercise, evaluateExercise } from "@/lib/exercises";
import { loadLocalResults, saveExerciseResult } from "@/lib/progress";

const fmt1 = (n) => n.toLocaleString("id-ID", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

export default function CameraSimulator() {
  const [sceneId, setSceneId] = useState("terik");
  const [apertureIdx, setApertureIdx] = useState(APERTURES.indexOf(8));
  const [shutterIdx, setShutterIdx] = useState(nearestIndex(SHUTTER_SPEEDS, 1 / 500));
  const [isoIdx, setIsoIdx] = useState(0);
  const [focalMm, setFocalMm] = useState(50);
  const [onTripod, setOnTripod] = useState(false);
  const [running, setRunning] = useState(true);
  const [exerciseId, setExerciseId] = useState(null);
  const [result, setResult] = useState(null);
  const [doneMap, setDoneMap] = useState({});
  const searchParams = useSearchParams();

  const scene = getScene(sceneId);
  const exercise = exerciseId ? getExercise(exerciseId) : null;

  const settings = useMemo(
    () => ({ aperture: APERTURES[apertureIdx], shutter: SHUTTER_SPEEDS[shutterIdx], iso: ISOS[isoIdx], focalMm, onTripod }),
    [apertureIdx, shutterIdx, isoIdx, focalMm, onTripod],
  );
  const metrics = useMemo(() => computeMetrics(settings, scene), [settings, scene]);

  // Load ticks for finished exercises; start paused if the user prefers reduced motion.
  useEffect(() => {
    setDoneMap(loadLocalResults());
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setRunning(false);
  }, []);

  // Deep link from a lesson: /simulator?latihan=<exercise id>.
  useEffect(() => {
    const requested = searchParams.get("latihan");
    const linked = requested ? getExercise(requested) : null;
    if (!linked) return;
    setExerciseId(linked.id);
    setSceneId(linked.scene);
    if (linked.forceHandheld) setOnTripod(false);
    setRunning(true);
  }, [searchParams]);

  // Any change after a capture clears the old verdict so it never shows stale results.
  useEffect(() => setResult(null), [settings, sceneId, exerciseId]);

  function startExercise(id) {
    const ex = getExercise(id);
    setExerciseId(id);
    setSceneId(ex.scene);
    if (ex.forceHandheld) setOnTripod(false);
    setRunning(true);
  }

  async function capture() {
    setRunning(false); // freeze the frame like a real shutter press
    if (!exercise) return;
    const evaluation = evaluateExercise(exercise, settings, metrics);
    setResult(evaluation);
    await saveExerciseResult({ exerciseId: exercise.id, settings, metrics, passed: evaluation.passed });
    setDoneMap(loadLocalResults());
  }

  // Hint: which shutter would give a correct exposure at the current aperture and ISO.
  const exactT = exactCorrectShutter(settings.aperture, settings.iso, scene.ev100);
  const fastest = SHUTTER_SPEEDS.at(-1);
  const slowest = SHUTTER_SPEEDS[0];
  const meterHint =
    exactT < fastest / 1.26
      ? `Pada ${formatAperture(settings.aperture)} dan ISO ${settings.iso}, bahkan 1/4000 masih terlalu terang. Kecilkan aperture atau turunkan ISO.`
      : exactT > slowest * 1.26
        ? `Pada ${formatAperture(settings.aperture)} dan ISO ${settings.iso}, butuh shutter lebih lambat dari 1 detik. Buka aperture atau naikkan ISO.`
        : `Pada ${formatAperture(settings.aperture)} dan ISO ${settings.iso}, exposure tepat di sekitar shutter ${formatShutter(correctShutterFor(settings.aperture, settings.iso, scene.ev100))}.`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* Viewfinder + meter. On phones this block stays pinned at the top so the
          preview remains visible while the dials below are adjusted. */}
      <section
        aria-label="Jendela bidik"
        className="sticky top-0 z-10 -mx-4 bg-surround px-4 pb-3 pt-2 sm:-mx-6 sm:px-6 lg:static lg:col-start-1 lg:row-start-1 lg:mx-0 lg:p-0"
      >
        <SceneView scene={scene} metrics={metrics} running={running} />
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            onClick={running ? capture : () => setRunning(true)}
            className="rounded-full bg-amber px-6 py-2 font-display text-lg font-semibold text-surround"
          >
            {running ? "Ambil foto" : "Kembali ke live view"}
          </button>
          <p className="hidden text-sm text-muted sm:block">
            {running ? "Live view. Gerakan mobil dipercepat agar terlihat." : "Foto diambil. Efek di atas sesuai setelan saat ini."}
          </p>
        </div>
        <div className="mt-3 lg:mt-6">
          <ExposureMeter offset={metrics.offset} status={metrics.status} />
        </div>
      </section>

      {/* Controls column */}
      <section aria-label="Pengaturan kamera" className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-muted">
            Kondisi cahaya
            <select
              value={sceneId}
              onChange={(e) => setSceneId(e.target.value)}
              disabled={Boolean(exercise)}
              className="mt-1 block w-full rounded border border-rule bg-panel px-2 py-2 text-ink disabled:opacity-60"
            >
              {SCENES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (EV {s.ev100})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-muted">
            Focal length
            <select
              value={focalMm}
              onChange={(e) => setFocalMm(Number(e.target.value))}
              className="mt-1 block w-full rounded border border-rule bg-panel px-2 py-2 text-ink"
            >
              {FOCAL_LENGTHS.map((f) => (
                <option key={f} value={f}>
                  {f} mm
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onTripod}
            disabled={exercise?.forceHandheld}
            onChange={(e) => setOnTripod(e.target.checked)}
            className="h-4 w-4 accent-amber"
          />
          Kamera di atas tripod
          {exercise?.forceHandheld && <span className="text-muted">(tidak tersedia di latihan ini)</span>}
        </label>
        <p className="mt-1 text-xs text-muted">{scene.description}</p>

        <div className="mt-4">
          <SettingDial
            id="aperture"
            label="Aperture"
            effect="Angka kecil = bukaan lebar: lebih terang, latar lebih kabur."
            values={APERTURES}
            index={apertureIdx}
            format={formatAperture}
            onChange={setApertureIdx}
          />
          <SettingDial
            id="shutter"
            label="Shutter speed"
            effect="Lebih cepat = gerakan beku dan lebih gelap. Lebih lambat = gerakan kabur dan lebih terang."
            values={SHUTTER_SPEEDS}
            index={shutterIdx}
            format={formatShutter}
            onChange={setShutterIdx}
          />
          <SettingDial
            id="iso"
            label="ISO"
            effect="Lebih tinggi = lebih terang, tetapi noise (bintik) bertambah."
            values={ISOS}
            index={isoIdx}
            format={(v) => String(v)}
            onChange={setIsoIdx}
          />
        </div>
      </section>

      {/* Readouts */}
      <section aria-label="Angka exposure" className="lg:col-start-1 lg:row-start-2">
        <p className="text-sm text-muted">{meterHint}</p>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">EV setelan</dt>
            <dd className="tabular">log₂(N²/t) = {fmt1(metrics.evSettings)}</dd>
          </div>
          <div>
            <dt className="text-muted">EV dibutuhkan</dt>
            <dd className="tabular">
              {scene.ev100} + log₂(ISO/100) = {fmt1(metrics.evRequired)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Blur latar (40 m)</dt>
            <dd className="tabular">{fmt1(metrics.bgBlurPx)} px</dd>
          </div>
          <div>
            <dt className="text-muted">Motion blur mobil</dt>
            <dd className="tabular">{fmt1(metrics.motionBlurPx)} px</dd>
          </div>
          <div>
            <dt className="text-muted">Goyangan tangan</dt>
            <dd className="tabular" style={{ color: metrics.shakeRisk ? "var(--color-over)" : undefined }}>
              {onTripod ? "0 (tripod)" : `${fmt1(metrics.shakePx)} px`}
              {metrics.shakeRisk && ` (lebih lambat dari 1/${focalMm})`}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Tingkat noise</dt>
            <dd className="tabular">{Math.round(metrics.noise * 100)}%</dd>
          </div>
        </dl>
      </section>

      {/* Exercises */}
      <section aria-labelledby="latihan-heading" className="lg:col-span-2">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-rule pt-6">
          <h2 id="latihan-heading" className="font-display text-2xl font-semibold">
            Latihan terpandu
          </h2>
          {exercise && (
            <button type="button" onClick={() => setExerciseId(null)} className="text-sm text-muted underline">
              Keluar ke mode bebas
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
          <ol className="space-y-1">
            {EXERCISES.map((ex, i) => (
              <li key={ex.id}>
                <button
                  type="button"
                  onClick={() => startExercise(ex.id)}
                  aria-current={ex.id === exerciseId ? "step" : undefined}
                  className={`flex w-full items-baseline gap-3 rounded px-3 py-2 text-left ${
                    ex.id === exerciseId ? "bg-panel text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  <span className="tabular text-sm">{i + 1}</span>
                  <span className="flex-1">{ex.title}</span>
                  {doneMap[ex.id]?.passed && (
                    <span className="text-correct" aria-label="selesai">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ol>

          <div className="min-h-40 rounded bg-panel p-5">
            {!exercise && (
              <p className="text-muted">
                Pilih latihan di kiri. Kondisi cahaya akan diatur otomatis; tugasmu mengatur aperture, shutter, ISO, dan
                focal length, lalu tekan Ambil foto.
              </p>
            )}
            {exercise && (
              <>
                <h3 className="font-display text-xl font-semibold">{exercise.title}</h3>
                <p className="mt-2 max-w-prose">{exercise.brief}</p>
                <details className="mt-3 text-sm text-muted">
                  <summary className="cursor-pointer">Lihat petunjuk</summary>
                  <p className="mt-1">{exercise.hint}</p>
                </details>
                {result && (
                  <div className="mt-4" aria-live="polite">
                    <p className={`font-display text-lg font-semibold ${result.passed ? "text-correct" : "text-over"}`}>
                      {result.passed ? "Berhasil. Latihan selesai." : "Belum berhasil. Periksa kriteria di bawah."}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {result.criteria.map((c) => (
                        <li key={c.label} className="flex gap-2">
                          <span className={c.pass ? "text-correct" : "text-over"} aria-hidden="true">
                            {c.pass ? "✓" : "✗"}
                          </span>
                          <span>{c.label}</span>
                          <span className="sr-only">{c.pass ? "terpenuhi" : "belum terpenuhi"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <details className="text-sm text-muted lg:col-span-2">
        <summary className="cursor-pointer text-ink">Penyederhanaan dalam simulator</summary>
        <ul className="mt-2 max-w-prose list-disc space-y-1 pl-5">
          <li>
            Exposure dihitung tepat dengan EV = log₂(N²/t) dan ISO, memakai nilai nominal kamera (selisih pembulatan
            kurang dari 0,1 EV). Kecerahan layar memakai kurva sederhana 2^(0,75 × selisih stop).
          </li>
          <li>
            Blur latar memakai rumus lingkaran kabur lensa tipis b = f²/(N(s−f)) · |d−s|/d dengan fokus pada model (3 m).
            Komposisi tidak berubah saat focal length diganti; yang dihitung hanya efek blurnya. Bokeh ditampilkan sebagai
            blur Gaussian, bukan cakram bokeh asli.
          </li>
          <li>
            Motion blur mobil = kecepatan bayangan di sensor (v·f/D) × shutter. Animasi live view dipercepat agar terlihat,
            tetapi panjang blur dihitung dari kecepatan asli 50 km/jam.
          </li>
          <li>
            Goyangan tangan memakai aturan 1/focal length, dikalibrasi 1,5 px tepat di batas aman, tanpa stabilisasi gambar.
            Noise naik bertahap per stop di atas ISO 100; noise kamera asli bergantung ukuran sensor dan pemrosesan.
          </li>
        </ul>
      </details>
    </div>
  );
}
