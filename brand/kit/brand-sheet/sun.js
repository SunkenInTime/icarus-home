// Generated from icarus-home-main/app/concepts/_shared/DitherFire.tsx, itself a port of the
// app's update-dialog shader (icarus-release/shaders/dither_fire.frag). Drawn once at a fixed
// time so the sheet is deterministic. data-progress: 0 idle drift, 0.75 where the page bottoms
// out, 1 when the download completes. Cell 9px, like the app and the site.
const SUN_VERT = `
attribute vec2 aPos;
void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
}
`;
const SUN_FRAG = `
precision highp float;

uniform vec2 uSize;
uniform float uTime;
uniform float uProgress;
uniform float uCell;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    v += 0.50 * valueNoise(p);
    v += 0.25 * valueNoise(p * 2.02 + 19.7);
    v += 0.125 * valueNoise(p * 4.05 + 51.3);
    return v / 0.875;
}

// Violet heat ramp: deep violet -> primary -> lavender -> near-white.
vec3 violetRamp(float t) {
    vec3 c0 = vec3(0.118, 0.039, 0.290);
    vec3 c1 = vec3(0.486, 0.227, 0.929);
    vec3 c2 = vec3(0.769, 0.710, 0.992);
    vec3 c3 = vec3(0.961, 0.953, 1.000);
    if (t < 0.45) return mix(c0, c1, t / 0.45);
    if (t < 0.8) return mix(c1, c2, (t - 0.45) / 0.35);
    return mix(c2, c3, (t - 0.8) / 0.2);
}

// Cool silver ramp for the secondary layer.
vec3 silverRamp(float t) {
    vec3 c0 = vec3(0.145, 0.145, 0.180);
    vec3 c1 = vec3(0.478, 0.478, 0.541);
    vec3 c2 = vec3(0.910, 0.906, 0.949);
    if (t < 0.6) return mix(c0, c1, t / 0.6);
    return mix(c1, c2, (t - 0.6) / 0.4);
}

void main() {
    // Match the app's top-left origin so the drift direction is identical.
    vec2 frag = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);

    vec2 cellIdx = floor(frag / uCell);
    vec2 center = (cellIdx + 0.5) * uCell;
    // Normalize by the short axis: on landscape screens this matches the
    // app's height-normalized field exactly, and on portrait phones it keeps
    // several noise features on screen instead of zooming into one blob.
    vec2 p = center / min(uSize.x, uSize.y);

    float t = uTime;
    float energy = mix(0.55, 1.0, uProgress);

    float fieldA = fbm(p * 1.9 + vec2(t * 0.18, -t * 0.38));
    float fieldB = fbm(p * 2.3 + vec2(-t * 0.26, t * 0.15) + 31.0);

    float owner = fbm(p * 0.9 + vec2(t * 0.07, t * 0.05) + 77.0);
    owner = clamp(owner + (uProgress * 0.35 - 0.05), 0.0, 1.0);

    float a = smoothstep(0.35, 0.85, fieldA) * energy;
    float b = smoothstep(0.42, 0.88, fieldB) * energy * 0.8;

    float wA = a * owner;
    float wB = b * (1.0 - owner);
    float intensity = max(wA, wB);

    intensity *= 0.92 + 0.08 * sin(t * 1.8 + p.x * 4.0 + p.y * 3.0);

    float radius = 0.62 * uCell * sqrt(clamp(intensity, 0.0, 1.0));
    float d = length(frag - center);
    float dotMask = 1.0 - smoothstep(radius - 0.8, radius + 0.8, d);

    float mixToB = wB / max(wA + wB, 1e-4);
    vec3 color = mix(violetRamp(intensity), silverRamp(intensity), mixToB);

    float baseDot =
        (1.0 - smoothstep(0.16 * uCell, 0.16 * uCell + 0.8, d)) * 0.10;

    float alpha = clamp(dotMask * (0.35 + 0.65 * intensity) + baseDot, 0.0, 1.0);
    gl_FragColor = vec4(color * alpha, alpha);
}
`;
for (const c of document.querySelectorAll("canvas.sun")) {
  const r = c.getBoundingClientRect();
  c.width = Math.round(r.width); c.height = Math.round(r.height);
  const gl = c.getContext("webgl", { premultipliedAlpha: true, alpha: true });
  if (!gl) continue;
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return x; };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, SUN_VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, SUN_FRAG));
  gl.linkProgram(p); gl.useProgram(p);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(p, "aPos"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  gl.uniform2f(gl.getUniformLocation(p, "uSize"), c.width, c.height);
  gl.uniform1f(gl.getUniformLocation(p, "uTime"), Number(c.dataset.time || 7.0));
  gl.uniform1f(gl.getUniformLocation(p, "uProgress"), Number(c.dataset.progress || 0.75));
  gl.uniform1f(gl.getUniformLocation(p, "uCell"), 9);
  gl.viewport(0, 0, c.width, c.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// The same mapping the shader uses, one dot per intensity step, so the rule is visible:
// radius = 0.62 * cell * sqrt(intensity); color = ramp(intensity).
const violetRamp = (t) => {
  const c = [[0.118, 0.039, 0.290], [0.486, 0.227, 0.929], [0.769, 0.710, 0.992], [0.961, 0.953, 1.0]];
  const mix = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
  const v = t < 0.45 ? mix(c[0], c[1], t / 0.45) : t < 0.8 ? mix(c[1], c[2], (t - 0.45) / 0.35) : mix(c[2], c[3], (t - 0.8) / 0.2);
  return `rgb(${v.map((x) => Math.round(x * 255)).join(",")})`;
};
const silverRamp = (t) => {
  const c = [[0.145, 0.145, 0.180], [0.478, 0.478, 0.541], [0.910, 0.906, 0.949]];
  const mix = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
  const v = t < 0.6 ? mix(c[0], c[1], t / 0.6) : mix(c[1], c[2], (t - 0.6) / 0.4);
  return `rgb(${v.map((x) => Math.round(x * 255)).join(",")})`;
};
for (const strip of document.querySelectorAll(".dotstrip")) {
  const ramp = strip.dataset.ramp === "silver" ? silverRamp : violetRamp;
  const cell = 36; // scaled up 4x from the 9px cell so the sizes read
  for (let i = 1; i <= 10; i++) {
    const t = i / 10;
    const r = 0.62 * cell * Math.sqrt(t);
    const cellEl = document.createElement("div");
    cellEl.style.cssText = `width:${cell}px;height:${cell}px;display:flex;align-items:center;justify-content:center`;
    const dot = document.createElement("div");
    dot.style.cssText = `width:${2 * r}px;height:${2 * r}px;border-radius:50%;background:${ramp(t)};opacity:${0.35 + 0.65 * t}`;
    cellEl.appendChild(dot);
    strip.appendChild(cellEl);
  }
}
