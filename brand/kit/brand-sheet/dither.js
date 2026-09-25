// Generated from icarus-home-main/app/concepts/_shared/DitherLight.tsx: the same
// shader the site uses, drawn once at a fixed time so the sheet is deterministic.
// Cell 9px, like every use on the site.
const VERT = `
attribute vec2 aPos;
void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
}
`;
const FRAG = `
precision highp float;

uniform vec2 uSize;
uniform float uTime;
uniform float uProgress;
uniform float uCell;
uniform vec2 uLight;

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

void main() {
    vec2 frag = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);

    vec2 cellIdx = floor(frag / uCell);
    vec2 center = (cellIdx + 0.5) * uCell;
    // Short-axis normalization keeps the rim flicker scale consistent
    // between landscape and portrait (see DitherFire).
    vec2 p = center / min(uSize.x, uSize.y);

    float t = uTime;

    vec2 lightPx = uLight * uSize;
    float dist = distance(center, lightPx);
    float radius = mix(0.16, 1.05, uProgress) * max(uSize.x, uSize.y);

    // A pool of light in a dark room: hot only near the source, falling off
    // fast, with a flickering rim. The cards are the readable layer; this
    // stays a mood layer.
    float pool = 1.0 - smoothstep(radius * 0.06, radius, dist);
    pool *= pool;
    float rim = fbm(p * 2.1 + vec2(t * 0.24, -t * 0.19));
    float intensity = clamp(pool * (0.6 + 0.35 * rim), 0.0, 1.0) * 0.7;

    // Ambient floor rises as the light grows.
    intensity = max(intensity, uProgress * 0.1);
    intensity *= 0.94 + 0.06 * sin(t * 2.1 + p.x * 5.0);

    float dotRadius = 0.62 * uCell * sqrt(clamp(intensity, 0.0, 1.0));
    float d = length(frag - center);
    float dotMask = 1.0 - smoothstep(dotRadius - 0.8, dotRadius + 0.8, d);

    vec3 color = violetRamp(intensity * 0.85);

    float baseDot =
        (1.0 - smoothstep(0.14 * uCell, 0.14 * uCell + 0.8, d)) * 0.05;

    float alpha = clamp(dotMask * (0.25 + 0.6 * intensity) + baseDot, 0.0, 1.0);
    gl_FragColor = vec4(color * alpha, alpha);
}
`;
for (const c of document.querySelectorAll("canvas.dither")) {
  const r = c.getBoundingClientRect();
  c.width = Math.round(r.width); c.height = Math.round(r.height);
  const gl = c.getContext("webgl", { premultipliedAlpha: true, alpha: true });
  if (!gl) continue;
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return x; };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(p); gl.useProgram(p);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(p, "aPos"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  const [lx, ly] = (c.dataset.light || "0.5,0.5").split(",").map(Number);
  gl.uniform2f(gl.getUniformLocation(p, "uSize"), c.width, c.height);
  gl.uniform1f(gl.getUniformLocation(p, "uTime"), 3.0);
  gl.uniform1f(gl.getUniformLocation(p, "uProgress"), Number(c.dataset.progress || 0.5));
  gl.uniform1f(gl.getUniformLocation(p, "uCell"), 9);
  gl.uniform2f(gl.getUniformLocation(p, "uLight"), lx, ly);
  gl.viewport(0, 0, c.width, c.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
