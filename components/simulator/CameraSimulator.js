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
import { useAuth } from "@/lib/auth";
import { AlertIcon, CameraIcon, CheckIcon, PauseIcon, PlayIcon, XIcon } from "@/components/icons";
import { Banner, Toast, btn } from "@/components/lms/ui";
import { useToast } from "@/components/lms/useToast";

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
  const [hideNotice, setHideNotice] = useState(false);
  const searchParams = useSearchParams();
  const { loading: authLoading, user } = useAuth();
  const toast = useToast();

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
    try {
      setHideNotice(sessionStorage.getItem("ak-sim-notice") === "1");
    } catch {
      // sessionStorage bisa dinonaktifkan; banner tetap tampil.
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setRunning(false);
  }, []);

  function dismissNotice() {
    setHideNotice(true);
    try {
      sessionStorage.setItem("ak-sim-notice", "1");
    } catch {
      // abaikan
    }
  }

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
    if (evaluation.passed) toast.show("Latihan lulus 🎉");
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

  const card = "rounded-3xl border border-tinta-100 bg-white p-6";
  const overline = "text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500";
  const selectClass =
    "mt-1.5 block h-11 w-full rounded-xl border border-tinta-200 bg-tinta-50 px-3 text-sm text-tinta-900 hover:border-tinta-300 focus:border-sprout-600 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-sprout-100 disabled:cursor-not-allowed disabled:text-tinta-400";

  return (
    <div className="pb-4">
      <Toast message={toast.message} onClose={toast.close} />

      {!authLoading && !user && !hideNotice && (
        <div className="mb-6">
          <Banner
            tone="info"
            action={
              <button type="button" onClick={dismissNotice} aria-label="Tutup pemberitahuan" className="grid size-8 shrink-0 place-items-center rounded-lg hover:bg-tinta-200">
                <XIcon size={16} />
              </button>
            }
          >
            Hasil latihan disimpan di browser ini. Masuk untuk menyimpannya ke akunmu.
          </Banner>
        </div>
      )}

      {/* Kondisi cahaya (segmented control) */}
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p id="label-cahaya" className="text-sm font-semibold text-tinta-600">
          Kondisi cahaya
        </p>
        <div role="group" aria-labelledby="label-cahaya" className="inline-flex flex-wrap rounded-xl bg-tinta-100 p-1">
          {SCENES.map((s) => {
            const active = s.id === sceneId;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                disabled={Boolean(exercise)}
                onClick={() => setSceneId(s.id)}
                title={`EV ${s.ev100}`}
                className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors duration-[120ms] disabled:cursor-not-allowed ${
                  active ? "bg-white text-tinta-900 shadow-e1" : "text-tinta-500 enabled:hover:text-tinta-900"
                } ${exercise && !active ? "opacity-50" : ""}`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
        {exercise && <p className="text-xs font-medium text-tinta-500">Diatur otomatis oleh latihan.</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Jendela bidik + meter. Di ponsel blok ini menempel di bawah navbar agar pratinjau
            tetap terlihat saat dial di bawahnya diubah. */}
        <section
          aria-label="Jendela bidik"
          className="sticky top-16 z-10 -mx-4 bg-canvas px-4 pb-3 pt-2 sm:-mx-6 sm:px-6 lg:static lg:col-start-1 lg:row-start-1 lg:mx-0 lg:bg-transparent lg:p-0"
        >
          {/* Zona foto netral (§4.4): satu kotak, tanpa aksen merek */}
          <div data-surface="dark" className="rounded-3xl bg-photo-surround p-3 sm:p-5">
            <div className="relative overflow-hidden rounded-2xl">
              <SceneView scene={scene} metrics={metrics} running={running} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2 sm:p-3">
                <p className="pointer-events-auto rounded-lg bg-photo-panel px-2.5 py-1.5 text-xs font-medium text-photo-text tabular sm:text-sm">
                  {formatAperture(settings.aperture)} · {formatShutter(settings.shutter)} · ISO{" "}
                  {settings.iso.toLocaleString("id-ID")} · {focalMm} mm
                </p>
                <button
                  type="button"
                  onClick={() => setRunning((value) => !value)}
                  aria-label={running ? "Jeda animasi" : "Putar animasi"}
                  aria-pressed={!running}
                  className="pointer-events-auto grid size-11 place-items-center rounded-lg bg-photo-panel text-photo-text hover:bg-photo-rule"
                >
                  {running ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <button type="button" onClick={running ? capture : () => setRunning(true)} className={btn("primary", "l")}>
              <CameraIcon size={20} />
              {running ? "Ambil foto" : "Kembali ke live view"}
            </button>
            <p className="hidden text-sm font-medium text-tinta-500 sm:block">
              {running
                ? "Live view. Gerakan mobil dipercepat agar terlihat."
                : "Foto diambil. Efek di atas sesuai setelan saat ini."}
            </p>
          </div>

          <div className="mt-3 lg:mt-4">
            <ExposureMeter offset={metrics.offset} status={metrics.status} />
          </div>
        </section>

        {/* Kolom pengaturan */}
        <section aria-label="Pengaturan kamera" className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
          {exercise && (
            <div className="mb-4 rounded-3xl border border-sprout-200 bg-sprout-100 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-sprout-800">Latihan aktif</p>
              <p className="mt-1 text-base font-semibold leading-6">{exercise.title}</p>
              <button
                type="button"
                onClick={() => setExerciseId(null)}
                className="mt-2 text-sm font-semibold text-sprout-800 underline"
              >
                Keluar ke mode bebas
              </button>
            </div>
          )}

          <div className={card}>
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
              format={(v) => `ISO ${v.toLocaleString("id-ID")}`}
              onChange={setIsoIdx}
            />

            <div className="mt-2 border-t border-tinta-100 pt-4">
              <label htmlFor="focal" className="text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500">
                Focal length
              </label>
              <select
                id="focal"
                value={focalMm}
                onChange={(e) => setFocalMm(Number(e.target.value))}
                className={selectClass}
              >
                {FOCAL_LENGTHS.map((f) => (
                  <option key={f} value={f}>
                    {f} mm
                  </option>
                ))}
              </select>

              <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={onTripod}
                  disabled={exercise?.forceHandheld}
                  onChange={(e) => setOnTripod(e.target.checked)}
                  className="size-5 accent-sprout-600"
                />
                Kamera di atas tripod
              </label>
              {exercise?.forceHandheld && (
                <p className="text-xs font-medium text-tinta-500">Tidak tersedia di latihan ini.</p>
              )}
              <p className="mt-2 text-xs font-medium leading-4 text-tinta-500">{scene.description}</p>
            </div>
          </div>
        </section>

        {/* Angka exposure */}
        <section aria-label="Angka exposure" className="lg:col-start-1 lg:row-start-2">
          <div className={card}>
            <p className="text-sm leading-[22px] text-tinta-600">{meterHint}</p>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <div>
                <dt className={overline}>EV setelan</dt>
                <dd className="mt-1 text-sm font-semibold tabular">log₂(N²/t) = {fmt1(metrics.evSettings)}</dd>
              </div>
              <div>
                <dt className={overline}>EV dibutuhkan</dt>
                <dd className="mt-1 text-sm font-semibold tabular">
                  {scene.ev100} + log₂(ISO/100) = {fmt1(metrics.evRequired)}
                </dd>
              </div>
              <div>
                <dt className={overline}>Blur latar (40 m)</dt>
                <dd className="mt-1 text-sm font-semibold tabular">{fmt1(metrics.bgBlurPx)} px</dd>
              </div>
              <div>
                <dt className={overline}>Motion blur mobil</dt>
                <dd className="mt-1 text-sm font-semibold tabular">{fmt1(metrics.motionBlurPx)} px</dd>
              </div>
              <div>
                <dt className={overline}>Goyangan tangan</dt>
                <dd className={`mt-1 text-sm font-semibold tabular ${metrics.shakeRisk ? "text-warn-fg" : ""}`}>
                  {onTripod ? "0 (tripod)" : `${fmt1(metrics.shakePx)} px`}
                  {metrics.shakeRisk && ` (lebih lambat dari 1/${focalMm})`}
                </dd>
              </div>
              <div>
                <dt className={overline}>Tingkat noise</dt>
                <dd className="mt-1 text-sm font-semibold tabular">{Math.round(metrics.noise * 100)}%</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Latihan terpandu */}
        <section aria-labelledby="latihan-heading" className="lg:col-span-2">
          <h2 id="latihan-heading" className="text-2xl font-bold leading-8">
            Latihan terpandu
          </h2>
          <p className="mt-1 text-sm text-tinta-500">
            Pilih latihan. Kondisi cahaya diatur otomatis; tugasmu mengatur aperture, shutter, ISO, dan focal length, lalu
            tekan Ambil foto.
          </p>

          <ol className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {EXERCISES.map((ex, i) => {
              const active = ex.id === exerciseId;
              const passedBefore = doneMap[ex.id]?.passed;
              return (
                <li key={ex.id}>
                  <button
                    type="button"
                    onClick={() => startExercise(ex.id)}
                    aria-current={active ? "step" : undefined}
                    className={`flex h-full min-h-14 w-full flex-col rounded-3xl border bg-white p-5 text-left shadow-e1 transition duration-200 hover:-translate-y-0.5 hover:shadow-e2 ${
                      active ? "border-sprout-300 bg-sprout-50" : "border-tinta-100 hover:border-sprout-200"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="grid size-8 place-items-center rounded-lg bg-sprout-100 text-sm font-semibold text-sprout-800 tabular">
                        {i + 1}
                      </span>
                      {passedBefore && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sprout-100 px-2.5 py-1 text-xs font-medium">
                          <CheckIcon size={14} /> Lulus
                        </span>
                      )}
                    </span>
                    <span className="mt-3 text-base font-semibold leading-6">{ex.title}</span>
                    <span className="mt-1 line-clamp-2 text-sm leading-[22px] text-tinta-500">{ex.brief}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          {exercise && (
            <div className="mt-6 rounded-3xl border border-tinta-100 bg-white p-6">
              <h3 className="text-xl font-semibold leading-7">{exercise.title}</h3>
              <p className="mt-2 max-w-[68ch] text-base leading-[26px] text-tinta-600">{exercise.brief}</p>
              <details className="mt-3 text-sm text-tinta-500">
                <summary className="cursor-pointer font-semibold text-sprout-700">Lihat petunjuk</summary>
                <p className="mt-2 max-w-[68ch] leading-[22px]">{exercise.hint}</p>
              </details>
              {result && (
                <div className="mt-5 border-t border-tinta-100 pt-5" aria-live="polite">
                  <p className="flex items-center gap-2 text-base font-semibold">
                    {result.passed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sprout-100 px-3 py-1 text-sm">
                        <CheckIcon size={16} /> Lulus
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warn-bg px-3 py-1 text-sm text-warn-fg">
                        <AlertIcon size={16} /> Belum lulus
                      </span>
                    )}
                    <span>{result.passed ? "Latihan selesai." : "Periksa kriteria di bawah, lalu coba lagi."}</span>
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {result.criteria.map((c) => (
                      <li key={c.label} className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                            c.pass ? "bg-sprout-100 text-sprout-800" : "bg-warn-bg text-warn-fg"
                          }`}
                        >
                          {c.pass ? <CheckIcon size={12} /> : <XIcon size={12} />}
                        </span>
                        <span>{c.label}</span>
                        <span className="sr-only">{c.pass ? "terpenuhi" : "belum terpenuhi"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        <details className="rounded-3xl border border-tinta-100 bg-white p-5 text-sm text-tinta-500 lg:col-span-2">
          <summary className="cursor-pointer font-semibold text-tinta-900">Penyederhanaan dalam simulator</summary>
          <ul className="mt-3 max-w-[68ch] list-disc space-y-2 pl-5 leading-[22px]">
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
    </div>
  );
}
