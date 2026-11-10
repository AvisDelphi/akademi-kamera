// lib/sceneDrawing.js
// Draws the simulator scene procedurally on <canvas>, so the app needs no stock
// photos (no copyright issues) and every layer can be blurred independently.
// Layers (back to front): background (40 m) → road (15 m) → car (15 m, moving) → person (3 m, in focus).
// All layer canvases are oversized by MARGIN on each side so blurred edges stay out of view.

export const VIEW_W = 960;
export const VIEW_H = 640;
export const MARGIN = 80;
export const CANVAS_W = VIEW_W + 2 * MARGIN;
export const CANVAS_H = VIEW_H + 2 * MARGIN;

export const HORIZON_Y = 330;
export const ROAD_TOP = 385;
export const ROAD_BOTTOM = 480;
export const CAR_W = 210;
export const CAR_H = 78;

/** Small deterministic random generator so the city looks the same every render. */
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function prepare(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(MARGIN, MARGIN); // draw in view coordinates (0..960, 0..640)
  return ctx;
}

export function drawBackground(canvas, scene) {
  const ctx = prepare(canvas);
  const rnd = seeded(7);
  const night = scene.id === "malam";

  // Sky
  const sky = ctx.createLinearGradient(0, -MARGIN, 0, HORIZON_Y);
  sky.addColorStop(0, scene.sky[0]);
  sky.addColorStop(1, scene.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(-MARGIN, -MARGIN, CANVAS_W, HORIZON_Y + MARGIN + 60);

  // Buildings
  let x = -MARGIN;
  while (x < VIEW_W + MARGIN) {
    const w = 60 + rnd() * 90;
    const h = 90 + rnd() * 190;
    const top = HORIZON_Y + 50 - h;
    const shade = night ? 30 + rnd() * 20 : 95 + rnd() * 60;
    ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 12})`;
    ctx.fillRect(x, top, w, h + 10);

    // Windows: a regular grid, some lit when lights are on
    for (let wy = top + 12; wy < HORIZON_Y + 30; wy += 22) {
      for (let wx = x + 8; wx < x + w - 12; wx += 18) {
        const lit = scene.lightsOn && rnd() > 0.45;
        ctx.fillStyle = lit ? "#ffd98a" : night ? "#1d2030" : "rgba(30,40,55,0.55)";
        ctx.fillRect(wx, wy, 9, 12);
      }
    }
    x += w + 4 + rnd() * 10;
  }

  // Trees along the far sidewalk
  for (let i = 0; i < 9; i++) {
    const tx = i * 120 + rnd() * 40 - 20;
    ctx.fillStyle = night ? "#1b2a22" : "#3f6b45";
    ctx.beginPath();
    ctx.arc(tx, HORIZON_Y + 10, 34 + rnd() * 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = night ? "#20180f" : "#5a4632";
    ctx.fillRect(tx - 4, HORIZON_Y + 30, 8, 30);
  }

  // Small bright lights (become soft bokeh balls when the background is blurred)
  if (scene.lightsOn) {
    for (let i = 0; i < 26; i++) {
      const lx = rnd() * (VIEW_W + 2 * MARGIN) - MARGIN;
      const ly = HORIZON_Y - 60 + rnd() * 100;
      ctx.fillStyle = rnd() > 0.5 ? "#fff1c7" : "#ffc86e";
      ctx.beginPath();
      ctx.arc(lx, ly, 3 + rnd() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Far sidewalk strip
  ctx.fillStyle = night ? "#2c2c31" : "#a3a197";
  ctx.fillRect(-MARGIN, HORIZON_Y + 55, CANVAS_W, ROAD_TOP - HORIZON_Y - 55);
}

export function drawRoad(canvas, scene) {
  const ctx = prepare(canvas);
  const night = scene.id === "malam";
  ctx.fillStyle = night ? "#232327" : "#55565a";
  ctx.fillRect(-MARGIN, ROAD_TOP, CANVAS_W, ROAD_BOTTOM - ROAD_TOP);
  // Lane markings
  ctx.fillStyle = night ? "#8b8b7a" : "#e9e6d6";
  for (let x = -MARGIN; x < VIEW_W + MARGIN; x += 90) ctx.fillRect(x, (ROAD_TOP + ROAD_BOTTOM) / 2 - 3, 50, 6);
  // Near sidewalk / foreground ground
  const g = ctx.createLinearGradient(0, ROAD_BOTTOM, 0, VIEW_H + MARGIN);
  g.addColorStop(0, scene.ground);
  g.addColorStop(1, night ? "#1d1d20" : "#6b6d66");
  ctx.fillStyle = g;
  ctx.fillRect(-MARGIN, ROAD_BOTTOM, CANVAS_W, VIEW_H + MARGIN - ROAD_BOTTOM);
  ctx.fillStyle = night ? "#111" : "#3e3f3c";
  ctx.fillRect(-MARGIN, ROAD_BOTTOM, CANVAS_W, 6); // curb shadow
}

/** Pre-render the car once into a small sprite canvas. */
export function createCarSprite(scene) {
  const c = document.createElement("canvas");
  c.width = CAR_W;
  c.height = CAR_H;
  const ctx = c.getContext("2d");
  const night = scene.id === "malam" || scene.id === "senja";

  // Body
  ctx.fillStyle = "#b8352b";
  ctx.beginPath();
  ctx.roundRect(4, 30, CAR_W - 8, 32, 10);
  ctx.fill();
  // Cabin
  ctx.beginPath();
  ctx.moveTo(48, 32);
  ctx.lineTo(72, 6);
  ctx.lineTo(146, 6);
  ctx.lineTo(172, 32);
  ctx.closePath();
  ctx.fill();
  // Windows
  ctx.fillStyle = night ? "#20263a" : "#9fc4dc";
  ctx.beginPath();
  ctx.moveTo(60, 31);
  ctx.lineTo(77, 11);
  ctx.lineTo(106, 11);
  ctx.lineTo(106, 31);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(112, 31);
  ctx.lineTo(112, 11);
  ctx.lineTo(142, 11);
  ctx.lineTo(160, 31);
  ctx.closePath();
  ctx.fill();
  // Wheels
  for (const wx of [50, 158]) {
    ctx.fillStyle = "#151515";
    ctx.beginPath();
    ctx.arc(wx, 62, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9a9a9a";
    ctx.beginPath();
    ctx.arc(wx, 62, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  // Lights (front is on the right; the car drives left → right)
  ctx.fillStyle = night ? "#fff6d0" : "#f3efe0";
  ctx.fillRect(CAR_W - 12, 38, 8, 8);
  ctx.fillStyle = "#ff4a3a";
  ctx.fillRect(4, 38, 6, 8);
  return c;
}

/**
 * Draw the car with motion blur by averaging `samples` copies spread over the blur length.
 * 'lighter' adds premultiplied colours, so N copies at alpha 1/N form an exact box filter —
 * the same thing a real shutter does while the car moves during the exposure.
 */
export function drawCar(canvas, sprite, xFront, blurPx) {
  const ctx = prepare(canvas);
  const y = ROAD_BOTTOM - CAR_H - 8;
  const length = Math.min(blurPx, 700);
  const samples = Math.max(1, Math.min(64, Math.ceil(length / 2)));
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 1 / samples;
  for (let i = 0; i < samples; i++) {
    const offset = samples === 1 ? 0 : (length * i) / (samples - 1);
    ctx.drawImage(sprite, xFront - CAR_W - offset, y);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

export function drawSubject(canvas, scene) {
  const ctx = prepare(canvas);
  const cx = 690;
  const night = scene.id === "malam";
  const light = night ? 0.75 : 1;
  const tone = (r, g, b) => `rgb(${Math.round(r * light)}, ${Math.round(g * light)}, ${Math.round(b * light)})`;

  // Torso / shoulders
  ctx.fillStyle = tone(47, 111, 115);
  ctx.beginPath();
  ctx.moveTo(cx - 150, VIEW_H + MARGIN);
  ctx.bezierCurveTo(cx - 150, 470, cx - 120, 430, cx - 40, 420);
  ctx.lineTo(cx + 40, 420);
  ctx.bezierCurveTo(cx + 120, 430, cx + 150, 470, cx + 150, VIEW_H + MARGIN);
  ctx.closePath();
  ctx.fill();
  // Neck
  ctx.fillStyle = tone(176, 120, 82);
  ctx.fillRect(cx - 24, 360, 48, 66);
  // Collar
  ctx.fillStyle = tone(36, 88, 92);
  ctx.beginPath();
  ctx.moveTo(cx - 40, 420);
  ctx.lineTo(cx, 452);
  ctx.lineTo(cx + 40, 420);
  ctx.closePath();
  ctx.fill();
  // Head
  ctx.fillStyle = tone(198, 139, 95);
  ctx.beginPath();
  ctx.ellipse(cx, 305, 56, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ear
  ctx.beginPath();
  ctx.ellipse(cx - 55, 312, 10, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hair
  ctx.fillStyle = tone(43, 32, 24);
  ctx.beginPath();
  ctx.ellipse(cx + 4, 262, 62, 42, -0.1, Math.PI, Math.PI * 2.05);
  ctx.fill();
  ctx.fillRect(cx - 60, 255, 22, 50);
  // Eyes and brows — fine detail that visibly softens when the person is out of focus or shaken
  ctx.fillStyle = tone(30, 22, 18);
  for (const ex of [cx - 2, cx + 30]) {
    ctx.beginPath();
    ctx.ellipse(ex, 302, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(ex - 9, 287, 18, 3);
  }
  // Mouth
  ctx.strokeStyle = tone(140, 70, 60);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx + 14, 336, 12, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

/** Pre-generate a few noise frames (luminance + some colour noise) so grain can shimmer cheaply. */
export function createNoiseFrames(count = 4, w = 480, h = 320) {
  const frames = [];
  for (let f = 0; f < count; f++) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const lum = (Math.random() - 0.5) * 255;
      img.data[i] = 128 + lum + (Math.random() - 0.5) * 70;
      img.data[i + 1] = 128 + lum + (Math.random() - 0.5) * 70;
      img.data[i + 2] = 128 + lum + (Math.random() - 0.5) * 70;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    frames.push(c);
  }
  return frames;
}
