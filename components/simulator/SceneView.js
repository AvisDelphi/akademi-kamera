"use client";
// components/simulator/SceneView.js
// Renders the layered scene and applies the exposure-triangle effects:
//   aperture/focal → per-layer depth-of-field blur (CSS blur, sigma from blur-disc size)
//   shutter        → motion blur of the car (drawn on canvas) + handheld shake blur
//   ISO            → grain overlay
//   all three      → brightness from the exposure offset
import { useEffect, useRef, useState } from "react";
import {
  CANVAS_W, CANVAS_H, VIEW_W, MARGIN, CAR_W,
  drawBackground, drawRoad, drawSubject, createCarSprite, drawCar, createNoiseFrames,
} from "@/lib/sceneDrawing";

const DISPLAY_SPEED = 240; // px/s on screen; only for animation, blur LENGTH uses real physics
const LOOP = VIEW_W + 2 * CAR_W + 300;
const MAX_SIGMA = 26; // keeps blurred edges inside the hidden margin (≈ 3 sigma < 80 px)

// Gaussian sigma that roughly matches a blur disc of diameter d (simplified: sigma ≈ d / 3).
const sigmaFor = (diameterPx) => diameterPx / 3;
// Independent Gaussian blurs combine by adding variances.
const combine = (...sigmas) => Math.min(MAX_SIGMA, Math.sqrt(sigmas.reduce((a, s) => a + s * s, 0)));

const layerStyle = {
  position: "absolute",
  left: `${(-MARGIN / VIEW_W) * 100}%`,
  top: `${(-MARGIN / 640) * 100}%`,
  width: `${(CANVAS_W / VIEW_W) * 100}%`,
  height: `${(CANVAS_H / 640) * 100}%`,
};

export default function SceneView({ scene, metrics, running }) {
  const frameRef = useRef(null);
  const bgRef = useRef(null);
  const roadRef = useRef(null);
  const carRef = useRef(null);
  const subjectRef = useRef(null);
  const noiseRef = useRef(null);
  const spriteRef = useRef(null);
  const metricsRef = useRef(metrics);
  const runningRef = useRef(running);
  const [scale, setScale] = useState(1); // CSS px per logical px

  metricsRef.current = metrics;
  runningRef.current = running;

  // Static layers are redrawn only when the scene changes.
  useEffect(() => {
    drawBackground(bgRef.current, scene);
    drawRoad(roadRef.current, scene);
    drawSubject(subjectRef.current, scene);
    spriteRef.current = createCarSprite(scene);
  }, [scene]);

  // Keep blur sizes correct when the preview is resized (blur is in CSS px).
  useEffect(() => {
    const el = frameRef.current;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / VIEW_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Animation loop: move the car and refresh the grain.
  useEffect(() => {
    const frames = createNoiseFrames();
    const noiseCtx = noiseRef.current.getContext("2d");
    let x = 420; // start with the car visible on the left half of the frame
    let last = performance.now();
    let lastNoise = 0;
    let noiseIndex = 0;
    let raf;
    let wasRunning = runningRef.current;

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (runningRef.current) x = (x + DISPLAY_SPEED * dt) % LOOP;
      // On "Ambil foto", place the car in clear view (left of the person) so the result is visible.
      if (wasRunning && !runningRef.current) x = 700;
      wasRunning = runningRef.current;
      if (spriteRef.current) {
        drawCar(carRef.current, spriteRef.current, x - CAR_W, metricsRef.current.motionBlurPx);
      }
      if (runningRef.current && now - lastNoise > 90) {
        noiseIndex = (noiseIndex + 1) % frames.length;
        lastNoise = now;
      }
      noiseCtx.drawImage(frames[noiseIndex], 0, 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const shake = sigmaFor(metrics.shakePx);
  const bgSigma = combine(sigmaFor(metrics.bgBlurPx), shake) * scale;
  const midSigma = combine(sigmaFor(metrics.carDofBlurPx), shake) * scale;
  const subjectSigma = combine(shake) * scale;
  // Brightness: 2^(offset × 0.75) — compressed because screens are not linear (simplified tone curve).
  const brightness = 2 ** (Math.max(-5, Math.min(5, metrics.offset)) * 0.75);

  return (
    <div
      ref={frameRef}
      className="relative w-full overflow-hidden bg-black"
      style={{ aspectRatio: "3 / 2" }}
      role="img"
      aria-label={`Pratinjau kamera: adegan ${scene.name}`}
    >
      <div className="absolute inset-0" style={{ filter: `brightness(${brightness.toFixed(3)})` }}>
        <canvas ref={bgRef} width={CANVAS_W} height={CANVAS_H} style={{ ...layerStyle, filter: `blur(${bgSigma.toFixed(2)}px)` }} />
        <canvas ref={roadRef} width={CANVAS_W} height={CANVAS_H} style={{ ...layerStyle, filter: `blur(${midSigma.toFixed(2)}px)` }} />
        <canvas ref={carRef} width={CANVAS_W} height={CANVAS_H} style={{ ...layerStyle, filter: `blur(${midSigma.toFixed(2)}px)` }} />
        <canvas ref={subjectRef} width={CANVAS_W} height={CANVAS_H} style={{ ...layerStyle, filter: subjectSigma > 0.05 ? `blur(${subjectSigma.toFixed(2)}px)` : "none" }} />
      </div>
      <canvas
        ref={noiseRef}
        width={480}
        height={320}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: metrics.noise * 0.5, mixBlendMode: "overlay" }}
      />
    </div>
  );
}
