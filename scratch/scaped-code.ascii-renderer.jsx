// Extracted from scaped-code.jsx production bundle.
// This slice appears to contain the ASCII renderer pipeline, glyph selection,
// ordered dithering, shape drawing, color mapping, and overlay helpers.

function U(r, n, i) {
  return Math.max(n, Math.min(i, r));
}
function _x(r) {
  switch (r) {
    case "up":
      return { dx: 0, dy: -1 };
    case "down":
      return { dx: 0, dy: 1 };
    case "left":
      return { dx: -1, dy: 0 };
    case "top-left":
      return { dx: -Math.SQRT1_2, dy: -Math.SQRT1_2 };
    case "top-right":
      return { dx: Math.SQRT1_2, dy: -Math.SQRT1_2 };
    case "bottom-left":
      return { dx: -Math.SQRT1_2, dy: Math.SQRT1_2 };
    case "bottom-right":
      return { dx: Math.SQRT1_2, dy: Math.SQRT1_2 };
    default:
      return { dx: 1, dy: 0 };
  }
}
function ru(r) {
  const { dx: n, dy: i } = _x(r),
    s = -i,
    l = n,
    u = (n < 0 ? n : 0) + (i < 0 ? i : 0),
    m = (n > 0 ? n : 0) + (i > 0 ? i : 0),
    g = (s < 0 ? s : 0) + (l < 0 ? l : 0),
    y = (s > 0 ? s : 0) + (l > 0 ? l : 0);
  return {
    dx: n,
    dy: i,
    perpX: s,
    perpY: l,
    primaryMin: u,
    primarySpan: Math.max(1e-4, m - u),
    secondaryMin: g,
    secondarySpan: Math.max(1e-4, y - g),
  };
}
function iu(r, n, i, s, l) {
  const u = r / Math.max(i - 1, 1),
    m = n / Math.max(s - 1, 1),
    g = u * l.dx + m * l.dy,
    y = u * l.perpX + m * l.perpY,
    p = U((g - l.primaryMin) / l.primarySpan, 0, 1),
    x = U((y - l.secondaryMin) / l.secondarySpan, 0, 1);
  return { primaryNorm: p, secondaryNorm: x };
}
function Rp(r) {
  if (typeof r != "string") return { r: 255, g: 255, b: 255 };
  const n = r.trim(),
    i = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(n);
  if (!i) return { r: 255, g: 255, b: 255 };
  const s =
    i[1].length === 3
      ? i[1]
          .split("")
          .map((l) => l + l)
          .join("")
      : i[1];
  return {
    r: Number.parseInt(s.slice(0, 2), 16),
    g: Number.parseInt(s.slice(2, 4), 16),
    b: Number.parseInt(s.slice(4, 6), 16),
  };
}
function Ex(r) {
  if (!r || typeof r.length != "number") return !1;
  for (let n = 0; n < r.length; n += 4)
    if (r[n] || r[n + 1] || r[n + 2] || r[n + 3]) return !0;
  return !1;
}
function Q0(r) {
  return ms.getWebglOverlayType(r);
}
function Z0(r) {
  return ms.isCanvasOverlayType(r);
}
function ey(r) {
  return ms.getWebglOverlayFragmentSource(r);
}
function ty(r, n = xx) {
  return ms.ensureWebglOverlayResources(r, n);
}
function Rd(r, n) {
  ms.disposeWebglOverlayResources(r, n);
}
function Cx(r) {
  return ms.getWebglOverlayUniformValues(r);
}
function ny(r, n) {
  const i = r || { x: Ef, y: Cf, lastMove: -1e9, active: 0 },
    s = n - i.lastMove,
    l = s < J0 ? 1 : Math.max(0, 1 - (s - J0) / Sx);
  return ((i.active += (l - i.active) * 0.15), i);
}
function ay(r, n, i, s, l, u, m, g) {
  ms.renderShaderOverlayFrame(r, n, i, s, l, u, m, g);
}
function ry(r, n, i, s) {
  if (!r || n <= 0 || i <= 0) return null;
  try {
    const l = new Uint8Array(n * i * 4);
    if (
      (typeof r.finish == "function" && r.finish(),
      r.readPixels(0, 0, n, i, r.RGBA, r.UNSIGNED_BYTE, l),
      !Ex(l))
    )
      return null;
    const u = s || document.createElement("canvas");
    (u.width !== n || u.height !== i) && ((u.width = n), (u.height = i));
    const m = u.getContext("2d");
    if (!m) return null;
    const g = m.createImageData(n, i),
      y = n * 4;
    for (let p = 0; p < i; p += 1) {
      const x = (i - p - 1) * y,
        T = x + y;
      g.data.set(l.subarray(x, T), p * y);
    }
    return (m.putImageData(g, 0, 0), u);
  } catch {
    return null;
  }
}
function iy(r, n, i, s) {
  if (!r) return { width: 0, height: 0 };
  if (n) {
    const m =
        (i && i.getBoundingClientRect()) ||
        (s && s.getBoundingClientRect()) ||
        n.getBoundingClientRect(),
      g = n.getBoundingClientRect(),
      y = Math.max(0, m.left - g.left),
      p = Math.max(0, m.top - g.top),
      x = Math.max(1, m.width),
      T = Math.max(1, m.height);
    ((r.style.left = `${y}px`),
      (r.style.top = `${p}px`),
      (r.style.width = `${x}px`),
      (r.style.height = `${T}px`));
  }
  const l = Math.max(1, Math.floor(r.clientWidth || 1)),
    u = Math.max(1, Math.floor(r.clientHeight || 1));
  return (
    (r.width !== l || r.height !== u) && ((r.width = l), (r.height = u)),
    { width: r.width, height: r.height }
  );
}
function Tx(r, n) {
  if (!r || !r.width || !r.height) return null;
  const i = n || document.createElement("canvas");
  (i.width !== r.width || i.height !== r.height) &&
    ((i.width = r.width), (i.height = r.height));
  const s = i.getContext("2d");
  return s
    ? (s.clearRect(0, 0, i.width, i.height), s.drawImage(r, 0, 0), i)
    : null;
}
function cu(r, n, i) {
  return U(Math.round(r + (n - r) * i), 0, 255);
}
function Np(r) {
  const n = String(r?.retroDuotone || "amber-classic");
  return X0[n] || X0["amber-classic"];
}
function Mx(r, n) {
  let i = r;
  return (
    (i = (i - 128) * n.contrast + 128),
    (i += n.brightness * 2),
    (i = U(i, 0, 255)),
    n.invert && (i = 255 - i),
    i
  );
}
function bp(r, n) {
  return (
    [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ][n % 4][r % 4] / 16
  );
}
function Fm(r, n, i, s, l, u = -Math.PI / 2) {
  if (!(!r || !Number.isFinite(s) || s <= 0 || l < 3)) {
    for (let m = 0; m < l; m += 1) {
      const g = u + (m / l) * Math.PI * 2,
        y = n + Math.cos(g) * s,
        p = i + Math.sin(g) * s;
      m === 0 ? r.moveTo(y, p) : r.lineTo(y, p);
    }
    r.closePath();
  }
}
function Ax(r, n, i, s, l, u = 0) {
  if (!r || l <= 0) return;
  const m = ((Number(u) || 0) * Math.PI) / 180;
  switch (n) {
    case "square": {
      const g = l * 2;
      if (Math.abs(m) <= 1e-4) {
        r.fillRect(i - l, s - l, g, g);
        return;
      }
      (r.save(),
        r.translate(i, s),
        r.rotate(m),
        r.fillRect(-l, -l, g, g),
        r.restore());
      return;
    }
    case "diamond":
      (r.save(),
        r.translate(i, s),
        r.rotate(m),
        r.beginPath(),
        Fm(r, 0, 0, l, 4, Math.PI / 4),
        r.fill(),
        r.restore());
      return;
    case "pentagon":
      (r.save(),
        r.translate(i, s),
        r.rotate(m),
        r.beginPath(),
        Fm(r, 0, 0, l, 5),
        r.fill(),
        r.restore());
      return;
    case "hexagon":
      (r.save(),
        r.translate(i, s),
        r.rotate(m),
        r.beginPath(),
        Fm(r, 0, 0, l, 6),
        r.fill(),
        r.restore());
      return;
    default:
      (r.beginPath(), r.arc(i, s, l, 0, Math.PI * 2), r.fill());
  }
}
function Rx(r, n, i, s, l) {
  const u = U(Number(s ?? 0) || 0, 0, 3);
  if (u <= 0) return 0;
  const m = U(r / 255, 0, 1),
    g = bp(n, i),
    y = (Math.sin((n + 1) * 7.31 + (i + 1) * 3.17 + l * 0.75) + 1) * 0.5,
    p = g * 0.72 + y * 0.28,
    T = U((m - 0.5) * (0.65 + u * 1.95) + 0.5, 0, 1) - p,
    M = 1.1 + u * 2.2;
  return U(T * M, 0, 1);
}
function pv(r) {
  const n =
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)(?:\s*[,/]\s*(\d*(?:\.\d+)?))?/i.exec(
      String(r || ""),
    );
  if (n) {
    const s = U(Math.round(Number(n[1]) || 0), 0, 255),
      l = U(Math.round(Number(n[2]) || 0), 0, 255),
      u = U(Math.round(Number(n[3]) || 0), 0, 255),
      m = n[4];
    if (m != null && m !== "") {
      const g = U(Number(m) || 0, 0, 1);
      return `rgba(${255 - s}, ${255 - l}, ${255 - u}, ${g})`;
    }
    return `rgb(${255 - s}, ${255 - l}, ${255 - u})`;
  }
  const i = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(r || "").trim());
  if (i) {
    const s =
        i[1].length === 3
          ? i[1]
              .split("")
              .map((g) => g + g)
              .join("")
          : i[1],
      l = Number.parseInt(s.slice(0, 2), 16),
      u = Number.parseInt(s.slice(2, 4), 16),
      m = Number.parseInt(s.slice(4, 6), 16);
    return `rgb(${255 - l}, ${255 - u}, ${255 - m})`;
  }
  return "rgb(255, 255, 255)";
}
function Nx(r) {
  const n =
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)(?:\s*[,/]\s*(\d*(?:\.\d+)?))?/i.exec(
      String(r || ""),
    );
  if (n)
    return {
      r: U(Math.round(Number(n[1]) || 0), 0, 255),
      g: U(Math.round(Number(n[2]) || 0), 0, 255),
      b: U(Math.round(Number(n[3]) || 0), 0, 255),
      a: n[4] != null && n[4] !== "" ? U(Number(n[4]) || 0, 0, 1) : 1,
    };
  const i = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(r || "").trim());
  if (i) {
    const s =
      i[1].length === 3
        ? i[1]
            .split("")
            .map((l) => l + l)
            .join("")
        : i[1];
    return {
      r: Number.parseInt(s.slice(0, 2), 16),
      g: Number.parseInt(s.slice(2, 4), 16),
      b: Number.parseInt(s.slice(4, 6), 16),
      a: 1,
    };
  }
  return null;
}
function sy({ r, g: n, b: i, a: s = 1 }) {
  const l = U(Math.round(Number(r) || 0), 0, 255),
    u = U(Math.round(Number(n) || 0), 0, 255),
    m = U(Math.round(Number(i) || 0), 0, 255),
    g = U(Number(s) || 0, 0, 1);
  return g < 0.999 ? `rgba(${l}, ${u}, ${m}, ${g})` : `rgb(${l}, ${u}, ${m})`;
}
function Ox(r, n, i) {
  const s = U((Number(r) || 0) / 255, 0, 1),
    l = U((Number(n) || 0) / 255, 0, 1),
    u = U((Number(i) || 0) / 255, 0, 1),
    m = Math.max(s, l, u),
    g = Math.min(s, l, u),
    y = m - g;
  let p = 0;
  return (
    y > 1e-6 &&
      (m === s
        ? (p = ((l - u) / y) % 6)
        : m === l
          ? (p = (u - s) / y + 2)
          : (p = (s - l) / y + 4),
      (p *= 60),
      p < 0 && (p += 360)),
    { h: p, s: m <= 0 ? 0 : y / m, v: m }
  );
}
function jx(r, n, i) {
  const s = (((Number(r) || 0) % 360) + 360) % 360,
    l = U(Number(n) || 0, 0, 1),
    u = U(Number(i) || 0, 0, 1),
    m = u * l,
    g = s / 60,
    y = m * (1 - Math.abs((g % 2) - 1));
  let p = 0,
    x = 0,
    T = 0;
  g >= 0 && g < 1
    ? ((p = m), (x = y))
    : g < 2
      ? ((p = y), (x = m))
      : g < 3
        ? ((x = m), (T = y))
        : g < 4
          ? ((x = y), (T = m))
          : g < 5
            ? ((p = y), (T = m))
            : ((p = m), (T = y));
  const M = u - m;
  return {
    r: Math.round((p + M) * 255),
    g: Math.round((x + M) * 255),
    b: Math.round((T + M) * 255),
  };
}
function kx(r) {
  const n = Nx(r);
  if (!n) return pv(r);
  const { r: i, g: s, b: l, a: u } = n,
    m = Math.max(i, s, l),
    g = Math.min(i, s, l);
  if ((m <= 0 ? 0 : (m - g) / m) < 0.06)
    return sy({ r: 255 - i, g: 255 - s, b: 255 - l, a: u });
  const p = Ox(i, s, l),
    x = U((0.299 * i + 0.587 * s + 0.114 * l) / 255, 0, 1),
    T = U(Math.pow(1 - x, 1.2), 0, 1),
    M = U(p.s * 1.08 + 0.04, 0, 1),
    A = jx(p.h, M, T);
  return sy({ ...A, a: u });
}
function Bo(r, n, i = !1) {
  return !!n?.themeOutputInvert != !!i ? kx(r) : r;
}
function Ix(r) {
  if (!r || r === "source") return null;
  const [n, i] = String(r)
    .split(":")
    .map((s) => Number(s));
  return !Number.isFinite(n) || !Number.isFinite(i) || n <= 0 || i <= 0
    ? null
    : n / i;
}
function Lx(r, n, i) {
  const s = Math.max(1, Number(r) || 1),
    l = Math.max(1, Number(n) || 1),
    u = Math.max(1e-4, Number(i) || s / l),
    m = s / l;
  let g = 0,
    y = 0,
    p = s,
    x = l;
  return (
    m > u
      ? ((p = l * u), (g = (s - p) * 0.5))
      : m < u && ((x = s / u), (y = (l - x) * 0.5)),
    { cropX: g, cropY: y, cropWidth: p, cropHeight: x }
  );
}
function Dx(r) {
  if (r.style === "letters") {
    const n = mx[r.letterSet] || "letters-alphabet";
    return Rl[n] || Rl["letters-alphabet"];
  }
  if (r.style === "braille") return Y0[r.brailleVariant] || Y0.standard;
  if (r.style === "claude") return Rl.blocks;
  if (r.style === "halftone") return mv;
  if (r.style === "retro" || r.style === "winamp") return px;
  if (r.style === "terminal") {
    const n = String(r.terminalCharset || "binary");
    return W0[n] || W0.binary;
  }
  if (r.style === "classic" && r.charset === "custom") {
    const n =
      typeof r.customCharset == "string" ? r.customCharset.slice(0, gx) : "";
    return n.length > 0 ? n : Rl.standard;
  }
  return Rl[r.charset] || Rl.standard;
}
function Ux(r, n, i, s, l) {
  const u = i * s + n,
    m = r[u] ?? 0,
    g = n > 0 ? (r[u - 1] ?? m) : m,
    y = n + 1 < s ? (r[u + 1] ?? m) : m,
    p = i > 0 ? (r[u - s] ?? m) : m,
    x = i + 1 < l ? (r[u + s] ?? m) : m,
    T = Math.abs(y - g),
    M = Math.abs(x - p);
  return U((T + M) / 510, 0, 1);
}
function Px(r, n, i, s, l) {
  if (l.style === "claude") {
    const u = U(s + 30, 0, 255);
    return {
      r: U(Math.floor(u * 1.02), 0, 255),
      g: U(Math.floor(u * 0.52), 0, 255),
      b: U(Math.floor(u * 0.1), 0, 255),
    };
  }
  if (l.style === "terminal") {
    const u = U(s + 28, 0, 255);
    return {
      r: U(Math.floor(u * 0.14), 0, 96),
      g: u,
      b: U(Math.floor(u * 0.24), 0, 116),
    };
  }
  if (l.style === "retro" || l.style === "winamp") {
    const u = Np(l),
      m = U(Math.floor(s * 1.04 + 12), 0, 255),
      g = U(Math.pow(m / 255, 0.94), 0, 1);
    return {
      r: cu(u.low.r, u.high.r, g),
      g: cu(u.low.g, u.high.g, g),
      b: cu(u.low.b, u.high.b, g),
    };
  }
  if (l.colorMode === "color")
    return {
      r: U(Math.floor(r), 0, 255),
      g: U(Math.floor(n), 0, 255),
      b: U(Math.floor(i), 0, 255),
    };
  if (l.colorMode === "green") {
    const u = U(s + 20, 0, 255);
    return {
      r: U(Math.floor(u * 0.2), 0, 255),
      g: u,
      b: U(Math.floor(u * 0.3), 0, 255),
    };
  }
  if (l.colorMode === "amber") {
    const u = U(s + 18, 0, 255);
    return {
      r: u,
      g: U(Math.floor(u * 0.72), 0, 255),
      b: U(Math.floor(u * 0.16), 0, 255),
    };
  }
  if (l.colorMode === "custom") {
    const u = Rp(l.customColor),
      m = s / 255;
    return {
      r: U(Math.floor(u.r * m), 0, 255),
      g: U(Math.floor(u.g * m), 0, 255),
      b: U(Math.floor(u.b * m), 0, 255),
    };
  }
  return { r: s, g: s, b: s };
}
function Bx(r) {
  return r.style === "terminal"
    ? { r: 96, g: 255, b: 164 }
    : r.style === "claude"
      ? { r: 255, g: 186, b: 118 }
      : r.style === "retro" || r.style === "winamp"
        ? { ...Np(r).high }
        : r.colorMode === "green"
          ? { r: 110, g: 255, b: 175 }
          : r.colorMode === "amber"
            ? { r: 255, g: 192, b: 118 }
            : r.colorMode === "custom"
              ? Rp(r.customColor)
              : r.colorMode === "color"
                ? { r: 176, g: 214, b: 255 }
                : { r: 255, g: 255, b: 255 };
}
function zx(r, n, i, s, l) {
  const u = U(Number(s ?? 0) || 0, 0, 1);
  if (!r || n <= 0 || i <= 0 || u <= 0.001) return;
  const { r: m, g, b: y } = Bx(l),
    p = Math.max(1, Math.min(n, i)),
    x = Math.max(10, p * (0.055 + u * 0.24)),
    T = U(0.018 + u * 0.34, 0, 0.62),
    M = x * 1.35,
    A = (Z) => Bo(`rgba(${m}, ${g}, ${y}, ${U(Z, 0, 1).toFixed(3)})`, l);
  (r.save(),
    (r.globalCompositeOperation = l?.themeOutputInvert ? "multiply" : "screen"),
    (r.globalAlpha = 1));
  const L = r.createLinearGradient(0, 0, 0, x);
  (L.addColorStop(0, A(T * 1.12)),
    L.addColorStop(0.58, A(T * 0.44)),
    L.addColorStop(1, A(0)),
    (r.fillStyle = L),
    r.fillRect(0, 0, n, x));
  const z = r.createLinearGradient(0, i, 0, i - x);
  (z.addColorStop(0, A(T * 1.12)),
    z.addColorStop(0.58, A(T * 0.44)),
    z.addColorStop(1, A(0)),
    (r.fillStyle = z),
    r.fillRect(0, i - x, n, x));
  const $ = r.createLinearGradient(0, 0, x, 0);
  ($.addColorStop(0, A(T)),
    $.addColorStop(0.58, A(T * 0.4)),
    $.addColorStop(1, A(0)),
    (r.fillStyle = $),
    r.fillRect(0, 0, x, i));
  const J = r.createLinearGradient(n, 0, n - x, 0);
  (J.addColorStop(0, A(T)),
    J.addColorStop(0.58, A(T * 0.4)),
    J.addColorStop(1, A(0)),
    (r.fillStyle = J),
    r.fillRect(n - x, 0, x, i));
  const ae = T * 0.9,
    q = (Z, F) => {
      const ee = r.createRadialGradient(Z, F, 0, Z, F, M);
      (ee.addColorStop(0, A(ae)),
        ee.addColorStop(0.65, A(ae * 0.28)),
        ee.addColorStop(1, A(0)),
        (r.fillStyle = ee),
        r.fillRect(Z - M, F - M, M * 2, M * 2));
    };
  (q(0, 0), q(n, 0), q(0, i), q(n, i), r.restore());
}
function Gx(r, n, i, s = 0, l = 0, u = 1, m = 1, g = 0) {
  const y = r / 255;
  if (i.style === "halftone") {
    const T = mv,
      M =
        (Math.sin((s * 0.82 + l * 0.33) * 1.55) +
          Math.cos((s * 0.27 - l * 0.94) * 1.25) +
          2) *
        0.25,
      A = U(Math.pow(y, 0.9) * 0.8 + M * 0.2, 0, 1),
      L = Math.floor(A * (T.length - 1));
    return T[U(L, 0, T.length - 1)];
  }
  if (i.style === "braille") {
    const T = String(i.brailleVariant || "standard"),
      M = T === "dense" ? 0.11 : T === "sparse" ? -0.08 : 0,
      A =
        (Math.sin((s * 0.73 + l * 0.41) * 1.37) +
          Math.cos((s * 0.29 - l * 0.88) * 1.11) +
          2) *
        0.25,
      L = U(g * 1.55 + Math.max(0, y - 0.45) * 0.28, 0, 1),
      z = U(Math.pow(y, 0.88) * 0.82 + A * 0.11 + L * 0.24 + M, 0, 1),
      $ = Math.floor(z * (n.length - 1));
    return n[U($, 0, n.length - 1)];
  }
  if (i.style === "dotcross") {
    const T = "  .·:oO",
      M = "  ·+xX#",
      A =
        (Math.sin((s * 0.82 + l * 0.33) * 1.55) +
          Math.cos((s * 0.27 - l * 0.94) * 1.25) +
          2) *
        0.25,
      L = U(Math.pow(y, 0.9) * 0.82 + A * 0.18, 0, 1),
      z = Math.floor(L * (T.length - 1)),
      $ = Math.floor(L * (M.length - 1)),
      J = U(g * 1.4 + Math.max(0, L - 0.5) * 0.22, 0, 1),
      ae =
        (Math.sin((s + 1) * 1.71 + (l + 1) * 2.37) +
          Math.cos((s + 1) * 0.83 - (l + 1) * 1.29) +
          2) *
        0.25;
    return (
      (J > U(0.46 + ae * 0.28, 0, 1)
        ? M[U($, 0, M.length - 1)]
        : T[U(z, 0, T.length - 1)]) || " "
    );
  }
  if (i.style === "particles") {
    const T = U(i.particleDensity ?? 0.5, 0.05, 1),
      M = u > 1 ? (s / (u - 1)) * 2 - 1 : 0,
      A = m > 1 ? (l / (m - 1)) * 2 - 1 : 0,
      L = 1 - U(Math.sqrt(M * M + A * A), 0, 1),
      z = Math.pow(L, 1.35) * T * 0.42,
      $ = U(g * 1.6 + Math.max(0, y - 0.45) * 0.24, 0, 1),
      ae =
        ((Math.sin((s + 1) * 12.9898 + (l + 1) * 78.233) + 1) * 0.5 - 0.5) *
        (0.18 - T * 0.08),
      q = U((i.brightness ?? 0) / 50, -1, 1) * 0.12,
      Z = U(
        Math.pow(y, 0.74 + (1 - T) * 0.2) +
          z * 0.62 +
          $ * 0.28 +
          (T - 0.5) * 0.68 +
          ae * 0.3 +
          q * 0.16,
        0,
        1,
      ),
      F =
        typeof i.particleChar == "string" && i.particleChar
          ? i.particleChar[0]
          : "●",
      ee = F === "●" ? yx : `  .·•◦${F}${F}${F}`,
      Y = Math.floor(Z * (ee.length - 1));
    return ee[U(Y, 0, ee.length - 1)];
  }
  let p = y;
  if (i.style === "retro" || i.style === "winamp") {
    const T = U(Number(i.retroNoise ?? 0.45) || 0, 0, 1),
      A =
        ((Math.sin((s + 1) * 12.9898 + (l + 1) * 78.233) + 1) * 0.5 - 0.5) *
        T *
        0.22;
    p = U(Math.pow(y, 0.78) + A, 0, 1);
    const L = 10 + Math.round(T * 16);
    p = Math.round(p * L) / Math.max(1, L);
  }
  i.style === "terminal" && (p = Math.pow(y, 0.82));
  const x = Math.floor(p * (n.length - 1));
  return n[U(x, 0, n.length - 1)];
}
function qm(r, n, i, s, l, u = 0, m = 0, g = 1, y = 1, p = 0, x = 0) {
  let T = 0,
    M = 1,
    A = 0.5,
    L = 0;
  if (l.style === "particles") {
    const F = U(l.particleDensity ?? 0.5, 0.05, 1),
      ee = g > 1 ? (u / (g - 1)) * 2 - 1 : 0,
      Y = y > 1 ? (m / (y - 1)) * 2 - 1 : 0,
      Q = 1 - U(Math.sqrt(ee * ee + Y * Y), 0, 1),
      ge = Math.pow(Q, 1.4) * F,
      oe = U(x, 0, 1);
    ((A = F),
      (L = ge),
      (T = ge * (24 + F * 72) + oe * (18 + F * 34)),
      (M = 1 + ge * 0.45 + oe * 0.22));
  }
  const z = U(s + T, 0, 255),
    $ =
      l.style === "particles"
        ? (() => {
            const F = z / 255,
              ee = U((F - 0.46) * (1.5 + A * 0.35) + 0.5, 0, 1),
              Y = Math.pow(ee, 0.8),
              Q = 14 + A * 24 + L * 18;
            return U(Math.floor(Y * 255 + Q), 0, 255);
          })()
        : z,
    J = l.style === "particles" ? U((l.brightness ?? 0) / 50, -1, 1) : 0,
    ae =
      l.style === "particles"
        ? (() => {
            const F = 8 + A * 8 + Math.max(0, J) * 28,
              ee = 1 + Math.max(0, J) * 0.12,
              Q = ($ + F - 128) * ee + 128;
            return U(Math.floor(Q), 0, 255);
          })()
        : $,
    q =
      l.style === "particles" ? U(0.04 + Math.max(0, J) * 0.18, 0.04, 0.24) : 0;
  if (l.style === "claude") {
    const F = U(s + 36, 0, 255),
      ee = U(Math.floor(F * 1.03), 0, 255),
      Y = U(Math.floor(F * 0.5), 0, 255),
      Q = U(Math.floor(F * 0.08), 0, 255);
    return `rgb(${ee}, ${Y}, ${Q})`;
  }
  if (l.style === "retro" || l.style === "winamp") {
    const F = U(Number(l.retroNoise ?? 0.45) || 0, 0, 1),
      ee = Np(l),
      Y = g > 1 ? (u / (g - 1)) * 2 - 1 : 0,
      Q = y > 1 ? (m / (y - 1)) * 2 - 1 : 0,
      ge = 1 - U(Math.sqrt(Y * Y + Q * Q), 0, 1) * 0.32,
      oe = Math.sin((u + 1) * 12.9898 + (m + 1) * 78.233),
      Ce = Math.sin(u * 0.13 + m * 0.07) * 5,
      Re = Math.sin((u + 1) * 41.13 + (m + 1) * 17.37 + s * 0.031),
      Oe = U(
        s * 1.06 + 14 + Ce + oe * (3 + F * 7.5) + Re * (1 + F * 16),
        0,
        255,
      ),
      He = U(Math.pow((Oe * ge) / 255, 0.86), 0, 1),
      et = cu(ee.low.r, ee.high.r, He),
      P = cu(ee.low.g, ee.high.g, He),
      le = cu(ee.low.b, ee.high.b, He);
    return `rgb(${et}, ${P}, ${le})`;
  }
  if (l.style === "terminal") {
    const F = U(s + 32, 0, 255),
      ee = ((u + m) & 1) === 0 ? 1 : 0.84,
      Y = U(Math.floor(F * ee), 0, 255),
      Q = U(Math.floor(Y * 0.12), 0, 72),
      ge = U(Math.floor(Y * 0.2), 0, 88);
    return `rgb(${Q}, ${Y}, ${ge})`;
  }
  if (l.colorMode === "color") {
    let F = U(Math.floor(r * M + T * 0.22 + p), 0, 255),
      ee = U(Math.floor(n * M + T * 0.28 + p), 0, 255),
      Y = U(Math.floor(i * M + T * 0.2 + p), 0, 255);
    if (l.style === "particles") {
      const Q = 0.72 + A * 0.16,
        ge = ae;
      ((F = U(Math.floor(ge * (1 - Q) + F * Q), 0, 255)),
        (ee = U(Math.floor(ge * (1 - Q) + ee * Q), 0, 255)),
        (Y = U(Math.floor(ge * (1 - Q) + Y * Q), 0, 255)),
        (F = U(Math.floor(F * (1 - q) + 255 * q), 0, 255)),
        (ee = U(Math.floor(ee * (1 - q) + 249 * q), 0, 255)),
        (Y = U(Math.floor(Y * (1 - q) + 236 * q), 0, 255)));
    }
    return `rgb(${F}, ${ee}, ${Y})`;
  }
  if (l.colorMode === "green") {
    const F = U((l.style === "particles" ? ae : z) + 25, 0, 255);
    return `rgb(${Math.floor(F * 0.2)}, ${F}, ${Math.floor(F * 0.3)})`;
  }
  if (l.colorMode === "amber") {
    const F = U((l.style === "particles" ? ae : z) + 20, 0, 255);
    return `rgb(${F}, ${Math.floor(F * 0.7)}, ${Math.floor(F * 0.15)})`;
  }
  if (l.colorMode === "custom") {
    const F = l.style === "particles" ? ae : z,
      ee = Rp(l.customColor),
      Y = U(F / 255, 0, 1),
      Q = U(Math.floor(ee.r * Y), 0, 255),
      ge = U(Math.floor(ee.g * Y), 0, 255),
      oe = U(Math.floor(ee.b * Y), 0, 255);
    return `rgb(${Q}, ${ge}, ${oe})`;
  }
  const Z = l.style === "particles" ? ae : z;
  if (l.style === "particles") {
    const F = U(Math.floor(Z * (1 - q) + 255 * q), 0, 255),
      ee = U(Math.floor(Z * (1 - q) + 249 * q), 0, 255),
      Y = U(Math.floor(Z * (1 - q) + 236 * q), 0, 255);
    return `rgb(${F}, ${ee}, ${Y})`;
  }
  return `rgb(${Z}, ${Z}, ${Z})`;
}
function Vx(r, n, i, s, l, u, m) {
  const g = u.overlayPreset || "none",
    y = U(u.overlayStrength ?? 0.4, 0, 1);
  if (g === "none" || y <= 0) return r;
  if (g === "noise") {
    const p = U(u.noiseScale ?? 24, 4, 120),
      x = U(u.noiseSpeed ?? 1, 0, 4),
      T = ru(u.noiseDirection || "right"),
      { primaryNorm: M, secondaryNorm: A } = iu(n, i, s, l, T),
      L = Math.max(s, l),
      z = m * x * 2.4,
      $ = (M * L + 17.3) / p,
      J = (A * L - 9.7) / p,
      ae = Math.sin($ + z) * Math.cos(J - z * 0.73),
      q = Math.sin(M * L * 1.37 + A * L * 2.11 + z * 6.2),
      Z = 16 + y * 72;
    return U(r + (ae * 0.65 + q * 0.35) * Z, 0, 255);
  }
  if (g === "intervals" || g === "lines") {
    const p = U(u.intervalSpacing ?? 12, 4, 64),
      x = U(u.intervalSpeed ?? 1, 0, 4),
      T = U(u.intervalWidth ?? 2, 1, 8),
      M = ru(u.intervalDirection || "down"),
      { primaryNorm: A, secondaryNorm: L } = iu(n, i, s, l, M),
      z = Math.max(s, l),
      $ = A * z,
      J = L * z,
      q = (((m * x * p * 1.7) % p) + p) % p,
      Z = ($ + q) % p,
      F = Math.min(Z, p - Z),
      ee = 1 - U(F / T, 0, 1),
      Y = Math.sin(
        ($ / p) * Math.PI * 2 + m * x * 1.8 + (J / Math.max(z, 1)) * 1.1,
      ),
      Q = y * 88;
    return U(r + ee * Q * 0.85 + Y * Q * 0.32, 0, 255);
  }
  if (g === "beam") {
    const p = 0.45 + y * 2.2,
      x = 0.08 + y * 0.22,
      T = ru(u.beamDirection || "right"),
      { primaryNorm: M } = iu(n, i, s, l, T),
      L = ((((m * p) % 1.2) + 1.2) % 1.2) - 0.1,
      z = Math.abs(M - L),
      $ = Math.max(0, 1 - z / x);
    return U(r + $ * (34 + y * 120), 0, 255);
  }
  if (g === "glitch") {
    const p = ru(u.glitchDirection || "right"),
      { primaryNorm: x, secondaryNorm: T } = iu(n, i, s, l, p),
      M = Math.max(s, l),
      A = T * M,
      L = 2 + Math.floor((1 - y) * 3),
      z = Math.floor(A / L),
      $ = Math.floor(m * (0.75 + y * 1.35)),
      ae = (Math.sin((z + 1) * 19.73 + $ * 7.11) + 1) * 0.5 > 0.74 ? 1 : 0,
      q = 0.12 + (Math.sin((z + 1) * 6.37) + 1) * 0.5 * (0.22 + y * 0.34),
      Z = (Math.sin((z + 1) * 2.91) + 1) * 0.5,
      F = (m * q + Z) % 1,
      ee = 0.12 + y * 0.28,
      Y = (x - F + 1) % 1,
      Q = Math.max(0, 1 - Y / ee),
      ge = Math.max(0, Math.sin(Y * Math.PI * (5 + y * 8) - m * (2 + y * 5))),
      oe = ae * (Q * (18 + y * 86) + ge * (6 + y * 26)),
      Ce =
        ae *
        Math.sin(x * Math.PI * 2 * (2 + y * 4) - m * (1.4 + y * 2.2)) *
        (3 + y * 14),
      Re =
        Math.sin((n + 1) * 17.7 + (i + 1) * 29.3 + m * 9.1) * (1.5 + y * 4.5);
    return U(r + oe + Ce + Re + T * 0.5, 0, 255);
  }
  if (g === "crt") {
    const p = ru(u.crtDirection || "down"),
      { primaryNorm: x, secondaryNorm: T } = iu(n, i, s, l, p),
      M = Math.max(s, l),
      A = x * M,
      L = T * M,
      z = (n / Math.max(s - 1, 1)) * 2 - 1,
      $ = (i / Math.max(l - 1, 1)) * 2 - 1,
      J = z * z * 0.84 + $ * $ * 1.12,
      q = (1 - (1 - U(J, 0, 1))) * (24 + y * 116),
      Z = Math.sin((A + m * (34 + y * 24)) * Math.PI),
      F = Math.sin((L + m * 8.5) * 2.9),
      ee = Math.sin(m * 61) * 0.55 + Math.sin(m * 23) * 0.45,
      Q = (((m * (0.12 + y * 0.24)) % 1) + 1) % 1,
      ge = Math.abs(x - Q),
      oe = Math.max(0, 1 - ge / (0.045 + y * 0.08)),
      Re = Math.sin((L + 1) * 14.37 + Math.floor(m * 12) * 1.91) > 0.72 ? 1 : 0,
      He = (((m * (0.55 + y * 1.35) + L * 0.037) % 1) + 1) % 1,
      et = Math.abs(x - He),
      P = Math.max(0, 1 - et / (0.014 + y * 0.03)),
      le = Math.max(0, Math.sin(x * 170 - m * (28 + y * 58) + L * 2.4)),
      ve = Re * (P * (8 + y * 34) + le * (2 + y * 10)),
      Qe = Math.pow(r / 255, 1.35) * (22 + y * 72),
      Je = Math.pow(1 - r / 255, 1.2) * (8 + y * 24),
      j =
        Z * (14 + y * 36) +
        F * (6 + y * 14) +
        ee * (5 + y * 14) +
        oe * (18 + y * 64) +
        ve +
        Qe -
        Je;
    return U(r + j - q, 0, 255);
  }
  return r;
}
function $x({
  sourceImage: r,
  sourceVideo: n,
  sourceStream: i,
  settings: s,
  onProcessingChange: l,
  onFpsChange: u,
  onCanvasReady: m,
}) {
  const g = w.useRef(null),
    y = w.useRef(null),
    p = w.useRef(null),
    x = w.useRef(null),
    T = w.useRef(null),
    [M, A] = w.useState(900),
    [L, z] = w.useState(0),
    $ = w.useRef(null),
    J = w.useRef(null),
    ae = w.useRef(null),
    q = w.useRef(null),
    Z = w.useRef(null),
    F = w.useRef(null),
    ee = w.useRef(0),
    Y = w.useRef(null),
    Q = w.useRef(null),
    ge = w.useRef(null),
    oe = w.useRef(null),
    Ce = w.useRef(null),
    Re = w.useRef(!1),
    Oe = w.useRef(0),
    He = w.useRef(0),
    et = w.useRef({
      laneCount: 0,
      primaryCount: 0,
      speeds: [],
      phases: [],
      lengths: [],
    }),
    P = w.useRef({ inside: !1, x: 0, y: 0 }),
    le = w.useRef({ x: Ef, y: Cf, lastMove: -1e9, active: 0 }),
    ve = w.useRef([]),
    Qe = w.useMemo(() => Dx(s), [s]),
    Je = w.useMemo(() => Cx(s), [s]),
    j = s.backgroundColor || "#000000",
    te = s.renderFont || '"Helvetica Neue", Helvetica, Arial, sans-serif',
    he = Q0(s.webglOverlayType),
    Se = !!s.webglLayerEnabled && !!s.webglOverlayAffectsAscii,
    Me = !!s.webglLayerEnabled && !Se,
    Xe = Me && (s.webglOverlayPosition || "behind") === "behind",
    ze = Z0(he);
  w.useEffect(() => {
    F.current = Je;
  }, [Je]);
  const ot = w.useCallback(() => {
    const me = Q0(F.current?.overlayType);
    if (Z0(me)) {
      const gt = T.current;
      if (!gt) return null;
      let Fe = ge.current;
      return (
        Fe || ((Fe = document.createElement("canvas")), (ge.current = Fe)),
        Tx(gt, Fe)
      );
    }
    const de = x.current,
      xe = Z.current;
    if (!de || !xe) return null;
    const Ye = Math.max(1, xe.drawingBufferWidth || de.width || 1),
      pt = Math.max(1, xe.drawingBufferHeight || de.height || 1);
    if (!Ye || !pt) return null;
    let Ke = Q.current;
    Ke || ((Ke = document.createElement("canvas")), (Q.current = Ke));
    const ya = ry(xe, Ye, pt, Ke);
    if (ya) return ya;
    let It = Y.current;
    if (
      !It ||
      !It.canvas ||
      !It.gl ||
      It.gl.isContextLost?.() ||
      It.shaderKey !== me ||
      It.width !== Ye ||
      It.height !== pt
    ) {
      It?.gl && It.resources && Rd(It.gl, It.resources);
      const gt = document.createElement("canvas");
      ((gt.width = Ye), (gt.height = pt));
      const Fe =
          gt.getContext("webgl", {
            alpha: !0,
            antialias: !0,
            premultipliedAlpha: !0,
            preserveDrawingBuffer: !0,
          }) || gt.getContext("experimental-webgl"),
        Kt = ty(Fe, ey(me));
      if (!Fe || !Kt) return (Kt && Rd(Fe, Kt), null);
      ((It = {
        canvas: gt,
        gl: Fe,
        resources: Kt,
        shaderKey: me,
        width: Ye,
        height: pt,
      }),
        (Y.current = It));
    }
    const On = performance.now(),
      vn = ny({ ...le.current }, On);
    return (
      ay(It.gl, It.resources, Ye, pt, On, ee.current, vn, F.current),
      ry(It.gl, Ye, pt, Ke)
    );
  }, []);
  (w.useEffect(() => {
    if (typeof m != "function") return;
    const me = Me ? (ze ? T.current || null : x.current || null) : null;
    return (
      m(p.current || null, me, ot),
      () => {
        m(null, null, null);
      }
    );
  }, [ze, ot, m, Me]),
    w.useEffect(
      () => () => {
        (Y.current?.gl &&
          Y.current?.resources &&
          Rd(Y.current.gl, Y.current.resources),
          (Y.current = null));
      },
      [],
    ),
    w.useEffect(() => {
      const me = g.current;
      if (!me) return;
      const de = new ResizeObserver((xe) => {
        const Ye = xe[0]?.contentRect?.width || 900;
        A(Math.max(320, Ye));
      });
      return (de.observe(me), () => de.disconnect());
    }, []),
    w.useEffect(
      () => () => {
        (J.current && (cancelAnimationFrame(J.current), (J.current = null)),
          ae.current && (cancelAnimationFrame(ae.current), (ae.current = null)),
          q.current && (cancelAnimationFrame(q.current), (q.current = null)),
          (Ce.current = null),
          $.current &&
            ($.current.pause(),
            ($.current.srcObject = null),
            ($.current.src = "")),
          u(0));
      },
      [u],
    ),
    w.useEffect(() => {
      if (!n && !i) return;
      ((Re.current = !1),
        l(!0),
        J.current && cancelAnimationFrame(J.current),
        $.current &&
          ($.current.pause(),
          ($.current.srcObject = null),
          ($.current.src = "")));
      const me = document.createElement("video");
      (i ? (me.srcObject = i) : (me.src = n),
        (me.muted = !0),
        (me.loop = !0),
        (me.playsInline = !0),
        ($.current = me));
      const de = async () => {
        try {
          (await me.play(), z((xe) => xe + 1));
        } catch {
          l(!1);
        }
      };
      return (
        me.addEventListener("loadeddata", de),
        me.addEventListener("loadedmetadata", de),
        i && de(),
        () => {
          (me.removeEventListener("loadeddata", de),
            me.removeEventListener("loadedmetadata", de),
            me.pause(),
            (me.srcObject = null),
            (me.src = ""),
            J.current && cancelAnimationFrame(J.current),
            ($.current = null));
        }
      );
    }, [n, i, l]),
    w.useEffect(() => {
      const me = x.current,
        de = !!s.webglLayerEnabled && !ze;
      if (!me) return;
      if (
        (ae.current && (cancelAnimationFrame(ae.current), (ae.current = null)),
        !de)
      ) {
        Z.current = null;
        const Ke = me.getContext("webgl");
        (Ke &&
          (Ke.viewport(
            0,
            0,
            Ke.drawingBufferWidth || 1,
            Ke.drawingBufferHeight || 1,
          ),
          Ke.clearColor(0, 0, 0, 0),
          Ke.clear(Ke.COLOR_BUFFER_BIT)),
          Y.current?.gl &&
            Y.current?.resources &&
            (!s.webglLayerEnabled || ze) &&
            (Rd(Y.current.gl, Y.current.resources), (Y.current = null)));
        return;
      }
      const xe = me.getContext("webgl", {
        alpha: !0,
        antialias: !0,
        premultipliedAlpha: !0,
        preserveDrawingBuffer: !0,
      });
      if (!xe) return;
      Z.current = xe;
      const Ye = ty(xe, ey(he));
      if (!Ye) return;
      ee.current = performance.now();
      const pt = () => {
        ((ae.current = requestAnimationFrame(pt)),
          iy(me, g.current, y.current, p.current));
        const Ke = performance.now(),
          ya = ny(le.current, Ke);
        ay(xe, Ye, me.width, me.height, Ke, ee.current, ya, F.current);
      };
      return (
        pt(),
        () => {
          (ae.current &&
            (cancelAnimationFrame(ae.current), (ae.current = null)),
            (Z.current = null),
            Rd(xe, Ye));
        }
      );
    }, [
      ze,
      he,
      s.webglLayerEnabled,
      s.webglOverlayIntensity,
      s.webglOverlayLineSpread,
      s.webglOverlayPulseSpeed,
      s.webglOverlayMouseInfluence,
      s.webglOverlayGrain,
      s.webglOverlayColor,
    ]),
    w.useEffect(() => {
      const me = T.current,
        de = !!s.webglLayerEnabled && ze;
      if (!me) return;
      q.current && (cancelAnimationFrame(q.current), (q.current = null));
      const xe = me.getContext("2d");
      if (!xe) return;
      if (!de) {
        xe.clearRect(0, 0, me.width || 1, me.height || 1);
        return;
      }
      (he === "atmospheric-folds"
        ? (oe.current = null)
        : (!oe.current || oe.current.type !== he) &&
          (oe.current = ms.createCanvasOverlaySceneState(he)),
        (ee.current = performance.now()));
      const Ye = () => {
        q.current = requestAnimationFrame(Ye);
        const { width: pt, height: Ke } = iy(
            me,
            g.current,
            y.current,
            p.current,
          ),
          ya = performance.now();
        ms.renderCanvasOverlayFrame(
          xe,
          pt,
          Ke,
          ya,
          ee.current,
          F.current,
          le.current,
          oe.current?.value,
        );
      };
      return (
        Ye(),
        () => {
          q.current && (cancelAnimationFrame(q.current), (q.current = null));
        }
      );
    }, [
      ze,
      he,
      s.webglLayerEnabled,
      s.webglOverlayIntensity,
      s.webglOverlayLineSpread,
      s.webglOverlayPulseSpeed,
      s.webglOverlayMouseInfluence,
      s.webglOverlayGrain,
      s.webglOverlayColor,
    ]),
    w.useEffect(() => {
      const me = p.current;
      if (!me) return;
      const de = me.getContext("2d");
      if (!de) return;
      const xe =
        (n || i) && $.current && $.current.readyState >= 2 ? $.current : r;
      if (!xe) {
        (de.clearRect(0, 0, me.width, me.height),
          (me.width = M),
          (me.height = 500),
          (de.fillStyle = j),
          de.fillRect(0, 0, me.width, me.height),
          (de.fillStyle = "#9ca3af"),
          (de.font = `16px ${te}`),
          (de.textAlign = "center"),
          de.fillText(
            "Upload an image or video to render ASCII art",
            me.width / 2,
            me.height / 2,
          ),
          l(!1),
          u(0));
        return;
      }
      const Ye = xe.videoWidth || xe.naturalWidth,
        pt = xe.videoHeight || xe.naturalHeight;
      if (!Ye || !pt) return;
      const ya = Ix(s.outputAspect) || Ye / pt,
        It = U(s.fontSize, 6, 22),
        Js = U(s.charSpacing ?? 1, 0.7, 2),
        On = `${It}px ${te}`;
      de.font = On;
      const vn = de.measureText("M").width,
        Fe = Math.max(It * 0.45, vn || It * 0.62) * Js,
        Kt = It * Js,
        Le = Math.max(16, Math.floor(M / Fe)),
        Qs = Fe / Math.max(Kt, 1),
        rt = Math.max(12, Math.round((1 / ya) * Le * Qs)),
        ys = Math.floor(Le * Fe),
        Zs = Math.ceil(rt * Kt);
      ((me.width = ys), (me.height = Zs));
      const Ka = document.createElement("canvas");
      ((Ka.width = Le), (Ka.height = rt));
      const yt = Ka.getContext("2d", { willReadFrequently: !0 });
      if (!yt) return;
      const ra = () => {
        J.current = null;
        const rn = performance.now();
        ((Oe.current += 1), He.current || (He.current = rn));
        const vs = rn - He.current;
        if (vs >= 500) {
          const ye = Math.round((Oe.current * 1e3) / vs);
          (u(Number.isFinite(ye) ? ye : 0),
            (Oe.current = 0),
            (He.current = rn));
        }
        let Pl;
        try {
          const ye = (Le * Fe) / Math.max(rt * Kt, 1),
            {
              cropX: ce,
              cropY: lt,
              cropWidth: bt,
              cropHeight: Ot,
            } = Lx(Ye, pt, ye);
          if (
            (yt.clearRect(0, 0, Le, rt),
            yt.drawImage(xe, ce, lt, bt, Ot, 0, 0, Le, rt),
            Se)
          ) {
            const Vt = ot();
            Vt &&
              Vt.width &&
              Vt.height &&
              (yt.save(),
              (yt.globalCompositeOperation = "screen"),
              (yt.globalAlpha = U(s.webglOverlayOpacity ?? 1, 0, 1)),
              yt.drawImage(Vt, 0, 0, Le, rt),
              yt.restore());
          }
          Pl = yt.getImageData(0, 0, Le, rt);
        } catch (ye) {
          (console.warn(
            "ASCII renderer failed to read source pixels (likely cross-origin canvas taint).",
            ye,
          ),
            l(!1),
            u(0));
          return;
        }
        const Lr = Pl.data,
          Ma = new Float32Array(Le * rt),
          Aa = rn * 0.001;
        for (let ye = 0; ye < rt; ye += 1)
          for (let ce = 0; ce < Le; ce += 1) {
            const lt = ye * Le + ce,
              bt = lt * 4,
              Ot = Lr[bt],
              Vt = Lr[bt + 1],
              At = Lr[bt + 2],
              Lt = 0.299 * Ot + 0.587 * Vt + 0.114 * At,
              on = Mx(Lt, s);
            Ma[lt] = Vx(on, ce, ye, Le, rt, s, Aa);
          }
        if (s.ditherType === "bayer")
          for (let ye = 0; ye < rt; ye += 1)
            for (let ce = 0; ce < Le; ce += 1) {
              const lt = ye * Le + ce,
                Ot = (bp(ce, ye) - 0.5) * 255 * s.ditherStrength;
              Ma[lt] = U(Ma[lt] + Ot, 0, 255);
            }
        if (s.ditherType === "floyd-steinberg" || s.ditherType === "atkinson") {
          const ye = new Float32Array(Ma);
          for (let ce = 0; ce < rt; ce += 1)
            for (let lt = 0; lt < Le; lt += 1) {
              const bt = ce * Le + lt,
                Ot = ye[bt],
                Vt = 255 / Math.max(2, Qe.length - 1),
                At = Math.round(Ot / Vt) * Vt,
                Lt = (Ot - At) * s.ditherStrength;
              ((ye[bt] = U(At, 0, 255)),
                s.ditherType === "floyd-steinberg"
                  ? (lt + 1 < Le && (ye[bt + 1] += (Lt * 7) / 16),
                    lt - 1 >= 0 &&
                      ce + 1 < rt &&
                      (ye[bt + Le - 1] += (Lt * 3) / 16),
                    ce + 1 < rt && (ye[bt + Le] += (Lt * 5) / 16),
                    lt + 1 < Le && ce + 1 < rt && (ye[bt + Le + 1] += Lt / 16))
                  : (lt + 1 < Le && (ye[bt + 1] += Lt / 8),
                    lt + 2 < Le && (ye[bt + 2] += Lt / 8),
                    lt - 1 >= 0 && ce + 1 < rt && (ye[bt + Le - 1] += Lt / 8),
                    ce + 1 < rt && (ye[bt + Le] += Lt / 8),
                    lt + 1 < Le && ce + 1 < rt && (ye[bt + Le + 1] += Lt / 8),
                    ce + 2 < rt && (ye[bt + Le * 2] += Lt / 8)));
            }
          for (let ce = 0; ce < Ma.length; ce += 1) Ma[ce] = U(ye[ce], 0, 255);
        }
        const ri = s.overlayPreset === "matrix",
          Ra = U(s.overlayStrength ?? 0.45, 0, 1),
          ki = U(s.hoverStrength ?? bx, 4, 64),
          Tt = U(s.mouseAreaSize ?? vx, 40, 640),
          Bl = U(s.mouseSpread ?? 1, 0.25, 3),
          Ho = s.mouseInteractionMode === "push" ? -1 : 1;
        let Ii = null;
        const fr = P.current,
          Dr = fr.inside,
          Ja = ve.current.filter((ye) => rn - ye.startedAt < Ad);
        Ja.length !== ve.current.length && (ve.current = Ja);
        const fe = Ja.length > 0;
        if (ri) {
          const ye = U(s.matrixScale ?? 18, 6, 48),
            ce = U(s.matrixSpeed ?? 1, 0.1, 4),
            lt = ru(s.matrixDirection || "down"),
            bt = U(ye / 12, 0.6, 4),
            Ot = Math.max(Le, rt),
            Vt = Math.max(Le, rt),
            At = Math.max(6, Math.ceil(Vt / bt)),
            Lt = et.current;
          (Lt.laneCount !== At ||
            Lt.primaryCount !== Ot ||
            Lt.speeds.length !== At) &&
            (et.current = {
              laneCount: At,
              primaryCount: Ot,
              speeds: Array.from(
                { length: At },
                () => 0.55 + Math.random() * 1.85,
              ),
              phases: Array.from(
                { length: At },
                () => Math.random() * (Ot + 36),
              ),
              lengths: Array.from({ length: At }, () =>
                Math.max(7, Math.round(Ot * (0.2 + Math.random() * 0.38))),
              ),
            });
          const on = et.current;
          Ii = new Float32Array(Le * rt);
          const Jt = new Float32Array(At),
            ia = new Float32Array(At);
          for (let wt = 0; wt < At; wt += 1) {
            const ct = on.lengths[wt],
              Na = Ot + ct + 12,
              Br = ((Aa * on.speeds[wt] * ce * Ot + on.phases[wt]) % Na) - ct;
            ((Jt[wt] = Br),
              (ia[wt] = ct),
              Math.random() < 0.0032 &&
                ((on.speeds[wt] = 0.55 + Math.random() * 1.85),
                (on.phases[wt] = Math.random() * (Ot + 36)),
                (on.lengths[wt] = Math.max(
                  7,
                  Math.round(Ot * (0.2 + Math.random() * 0.38)),
                ))));
          }
          for (let wt = 0; wt < rt; wt += 1)
            for (let ct = 0; ct < Le; ct += 1) {
              const Na = wt * Le + ct,
                { primaryNorm: Br, secondaryNorm: mr } = iu(ct, wt, Le, rt, lt),
                Fn = U(Math.floor(mr * At), 0, At - 1),
                zr = Br * (Ot - 1),
                qn = Jt[Fn] - zr;
              if (qn < 0 || qn > ia[Fn]) continue;
              const sa = 1 - qn / (ia[Fn] + 1);
              Ii[Na] = sa * (44 + Ra * 148 + sa * (62 + Ra * 30));
            }
        }
        (de.clearRect(0, 0, ys, Zs),
          Xe || ((de.fillStyle = j), de.fillRect(0, 0, ys, Zs)),
          (de.font = On),
          (de.textBaseline = "top"));
        const ii = U(s.bgDither ?? 0, 0, 3),
          Ur = U(s.inverseDither ?? 0, 0, 3),
          eo = U(s.opacity ?? 1, 0, 1),
          Pr = U(s.vignette ?? 0, 0, 1),
          va = U(s.borderGlow ?? 0, 0, 1),
          sn = pv(j);
        de.globalAlpha = eo;
        for (let ye = 0; ye < rt; ye += 1)
          for (let ce = 0; ce < Le; ce += 1) {
            const lt = ye * Le + ce,
              bt = lt * 4,
              Ot = Math.round(Ma[lt]),
              Vt = Lr[bt],
              At = Lr[bt + 1],
              Lt = Lr[bt + 2],
              on = Le > 1 ? (ce / (Le - 1)) * 2 - 1 : 0,
              Jt = rt > 1 ? (ye / (rt - 1)) * 2 - 1 : 0,
              ia = 1 - U(Math.sqrt(on * on + Jt * Jt), 0, 1),
              wt = ia * ia * wx,
              ct = wt * 0.72,
              Na = Math.sqrt(on * on + Jt * Jt) / Math.SQRT2,
              Br = Math.pow(U(1 - Na, 0, 1), 1 + Pr * 2),
              mr = 1 - Pr + Pr * Br,
              Fn = eo * mr;
            if (Fn <= 0.002) continue;
            de.globalAlpha = Fn;
            const zr = U(Math.round(Ot + wt), 0, 255),
              qn = Rx(zr, ce, ye, Ur, Aa),
              sa = qn > 0.12,
              ba = U(Math.round(zr + (255 - zr * 2) * qn), 0, 255),
              Oa = ce * Fe,
              ja = ye * Kt;
            if (ii > 0) {
              const St = Ot / 255,
                Qt = bp(ce, ye),
                cn =
                  (Math.sin((ce + 1) * 7.31 + (ye + 1) * 3.17 + Aa * 0.75) +
                    1) *
                  0.5,
                Pt = Qt * 0.72 + cn * 0.28,
                Bt = U(St * (0.92 + ii * 0.9) - Pt + 0.34, 0, 1);
              if (Bt > 0.04) {
                const Cn = U(0.18 + Bt * (0.85 + ii * 0.5), 0.12, 1),
                  Yt = Math.max(0.45, Math.min(Fe, Kt) * Cn),
                  Bn = (Fe - Yt) * 0.5,
                  un = (Kt - Yt) * 0.5,
                  la = Px(Vt, At, Lt, Ot, s),
                  zn = U(Bt * (0.05 + ii * 0.34), 0, 1);
                ((de.fillStyle = Bo(
                  `rgba(${la.r}, ${la.g}, ${la.b}, ${zn.toFixed(3)})`,
                  s,
                )),
                  de.fillRect(Oa + Bn, ja + un, Yt, Yt));
              }
            }
            if (qn > 0.01) {
              const St = U(qn * (0.08 + Ur * 0.34), 0, 1);
              if (St > 0.005) {
                const Qt = de.globalAlpha;
                ((de.globalAlpha = Qt * St),
                  (de.fillStyle = sn),
                  de.fillRect(Oa, ja, Fe, Kt),
                  (de.globalAlpha = Qt));
              }
            }
            if (ri) {
              const St = Ii ? Ii[lt] : 0,
                Qt = 6 + (s.overlayStrength ?? 0.45) * 14,
                cn = U((ba - 128) * (1.2 + Ra * 0.55) + 128, 0, 255),
                Pt = U(Math.round(cn * 0.38 + St * 0.78 + Qt), 0, 255);
              if (Pt < 20) continue;
              const Bt = Aa * (10 + U(s.matrixSpeed ?? 1, 0.1, 4) * 16),
                Cn =
                  Math.sin((ce + 1) * 2.17 + Bt * 1.7) +
                  Math.cos((ye + 1) * 1.93 - Bt * 1.1),
                Yt = Math.sin(
                  (ce + 1) * 91.13 + (ye + 1) * 37.77 + Bt * 5.3 + St * 0.06,
                ),
                Bn = Cn * 0.28 + Yt * 0.72;
              let un = Math.floor(U((Bn + 2) / 4, 0, 1) * (hf.length - 1));
              Math.sin((Math.floor(Bt * 2.6) + ce * 13 + ye * 7) * 12.9898) >
                0.93 &&
                (un =
                  1 +
                  ((Math.floor(Bt * 11) + ce * 3 + ye * 5) % (hf.length - 1)));
              const zn = hf[U(un, 1, hf.length - 1)];
              if (zn === " ") continue;
              const dn = St > 182,
                ka = U(0.08 + Pt / 620 + (dn ? 0.12 : 0), 0, 0.56),
                jn = U(Math.floor(72 + Pt * 0.58), 0, 255),
                Tn = U(Math.floor(jn * 0.24), 0, 160),
                pr = U(Math.floor(jn * 0.34), 0, 180);
              let Di = Oa,
                _e = ja;
              if (Dr || fe) {
                const ca = Di + Fe * 0.5,
                  ua = _e + Kt * 0.5;
                let bn = 0,
                  gr = 0;
                if (Dr) {
                  const $t = fr.x - ca,
                    yr = fr.y - ua,
                    Ht = Math.hypot($t, yr);
                  if (Ht > 1e-4 && Ht < Tt) {
                    const bs = 1 - Ht / Tt,
                      hn = Math.pow(bs, 1 / Bl),
                      Vr = hn * hn * ki * Ho;
                    ((bn += ($t / Ht) * Vr), (gr += (yr / Ht) * Vr));
                  }
                }
                if (fe)
                  for (let $t = 0; $t < Ja.length; $t += 1) {
                    const yr = Ja[$t],
                      Ht = rn - yr.startedAt;
                    if (Ht >= Ad) continue;
                    const bs = U(Ht / Ad, 0, 1),
                      hn = ca - yr.x,
                      Vr = ua - yr.y,
                      Mn = Math.hypot(hn, Vr);
                    if (Mn >= ff) continue;
                    const Xn = 1 - Mn / ff,
                      fn =
                        K0 *
                        Xn *
                        (1 - bs * 0.55) *
                        (1.25 + Math.sin(bs * Math.PI) * 0.45);
                    let Ui = 1,
                      wn = 0;
                    if (Mn > 1e-4) ((Ui = hn / Mn), (wn = Vr / Mn));
                    else {
                      const Gl = (lt + yr.seed) * 0.61803398875;
                      ((Ui = Math.cos(Gl)), (wn = Math.sin(Gl)));
                    }
                    ((bn += Ui * fn), (gr += wn * fn));
                  }
                ((Di += bn), (_e += gr));
              }
              const zl = `rgba(${Tn}, ${jn}, ${pr}, ${ka})`;
              if (((de.fillStyle = Bo(zl, s, sa)), de.fillText(zn, Di, _e), dn))
                de.fillStyle = Bo("rgb(236, 248, 240)", s, sa);
              else {
                const ca = U(Math.floor(64 + Pt * 0.52), 0, 225),
                  ua = U(Math.floor(ca * 0.28 + cn * 0.08), 0, 180),
                  bn = U(Math.floor(ca * 0.36 + cn * 0.12), 0, 195),
                  gr = `rgb(${ua}, ${ca}, ${bn})`;
                de.fillStyle = Bo(gr, s, sa);
              }
              de.fillText(zn, Di, _e);
              continue;
            }
            let Yn = Oa,
              ln = ja,
              Gr = Yn + Fe * 0.5,
              Rt = ln + Kt * 0.5;
            if (Dr || fe) {
              let St = 0,
                Qt = 0;
              if (Dr) {
                const cn = fr.x - Gr,
                  Pt = fr.y - Rt,
                  Bt = Math.hypot(cn, Pt);
                if (Bt > 1e-4 && Bt < Tt) {
                  const Cn = 1 - Bt / Tt,
                    Yt = Math.pow(Cn, 1 / Bl),
                    Bn = Yt * Yt * ki * Ho;
                  ((St += (cn / Bt) * Bn), (Qt += (Pt / Bt) * Bn));
                }
              }
              if (fe)
                for (let cn = 0; cn < Ja.length; cn += 1) {
                  const Pt = Ja[cn],
                    Bt = rn - Pt.startedAt;
                  if (Bt >= Ad) continue;
                  const Cn = U(Bt / Ad, 0, 1),
                    Yt = Gr - Pt.x,
                    Bn = Rt - Pt.y,
                    un = Math.hypot(Yt, Bn);
                  if (un >= ff) continue;
                  const la = 1 - un / ff,
                    zn =
                      K0 *
                      la *
                      (1 - Cn * 0.55) *
                      (1.25 + Math.sin(Cn * Math.PI) * 0.45);
                  let dn = 1,
                    ka = 0;
                  if (un > 1e-4) ((dn = Yt / un), (ka = Bn / un));
                  else {
                    const jn = (lt + Pt.seed) * 0.61803398875;
                    ((dn = Math.cos(jn)), (ka = Math.sin(jn)));
                  }
                  ((St += dn * zn), (Qt += ka * zn));
                }
              ((Yn += St), (ln += Qt), (Gr += St), (Rt += Qt));
            }
            if (s.style === "halftone") {
              const St = String(s.halftoneShape || "circle"),
                Qt = U(Number(s.halftoneSize ?? 1) || 1, 0.4, 2.2),
                cn = U(Number(s.halftoneRotation ?? 0) || 0, -180, 180),
                Pt = ba / 255,
                Bt =
                  (Math.sin((ce * 0.82 + ye * 0.33) * 1.55) +
                    Math.cos((ce * 0.27 - ye * 0.94) * 1.25) +
                    2) *
                  0.25,
                Cn = U(Math.pow(Pt, 0.92) * 0.82 + Bt * 0.18, 0, 1),
                Bn = Math.max(0.1, Math.min(Fe, Kt) * 0.5) * Cn * Qt;
              if (Bn < 0.35) continue;
              const un = qm(Vt, At, Lt, ba, s, ce, ye, Le, rt, ct);
              ((de.fillStyle = Bo(un, s, sa)), Ax(de, St, Gr, Rt, Bn, cn));
              continue;
            }
            if (s.style === "line") {
              const St = ba / 255,
                Qt = U(s.lineLength ?? 1, 0.1, 2.5),
                cn = U(s.lineWidth ?? 1, 0.2, 2.5),
                Pt = U(s.lineThickness ?? 1.6, 0.2, 8),
                Bt = s.lineRotation ?? 0,
                Cn =
                  (Math.sin((ce * 0.79 + ye * 0.41) * 1.37) +
                    Math.cos((ce * 0.33 - ye * 0.93) * 1.09) +
                    2) *
                  0.25,
                Yt = (Bt * Math.PI) / 180 + (Cn - 0.5) * 0.55,
                un =
                  Math.max(0.8, Math.min(Fe, Kt) * cn) * U(St * Qt, 0.05, 1.5);
              if (un < 0.6) continue;
              const la = un * 0.5,
                zn = Gr - Math.cos(Yt) * la,
                dn = Rt - Math.sin(Yt) * la,
                ka = Gr + Math.cos(Yt) * la,
                jn = Rt + Math.sin(Yt) * la,
                Tn = U(Pt, 0.2, Math.max(0.2, Math.min(Fe, Kt) * 1.4)),
                pr = qm(Vt, At, Lt, ba, s, ce, ye, Le, rt, ct);
              ((de.strokeStyle = Bo(pr, s, sa)),
                (de.lineWidth = Tn),
                (de.lineCap = "round"),
                de.beginPath(),
                de.moveTo(zn, dn),
                de.lineTo(ka, jn),
                de.stroke());
              continue;
            }
            const Qa =
                s.style === "dotcross" ||
                s.style === "braille" ||
                s.style === "particles"
                  ? Ux(Ma, ce, ye, Le, rt)
                  : 0,
              Li = String(s.brailleVariant || "standard"),
              Pn =
                s.style === "braille"
                  ? 8 +
                    Qa * 40 +
                    (Li === "dense" ? 10 : Li === "sparse" ? -4 : 4)
                  : 0,
              Fo = U(s.particleDensity ?? 0.5, 0.05, 1),
              Wn = s.style === "particles" ? Qa * 44 + (Fo - 0.5) * 12 : 0,
              oa =
                s.style === "braille"
                  ? U(ba + Pn, 0, 255)
                  : s.style === "particles"
                    ? U(ba + Wn, 0, 255)
                    : ba,
              to = Gx(oa, Qe, s, ce, ye, Le, rt, Qa);
            if (to === " ") continue;
            const no = qm(Vt, At, Lt, oa, s, ce, ye, Le, rt, ct, Qa);
            ((de.fillStyle = Bo(no, s, sa)), de.fillText(to, Yn, ln));
          }
        (va > 0.001 && zx(de, ys, Zs, va, s),
          (de.globalAlpha = 1),
          Re.current || ((Re.current = !0), l(!1)));
        const vt = s.overlayPreset !== "none" || Se;
        (((n || i) && $.current) ||
          vt ||
          P.current.inside ||
          ve.current.length > 0) &&
          (J.current = requestAnimationFrame(ra));
      };
      return (
        (Ce.current = () => {
          J.current || ra();
        }),
        (Oe.current = 0),
        (He.current = 0),
        ra(),
        () => {
          (J.current && (cancelAnimationFrame(J.current), (J.current = null)),
            (Ce.current = null));
        }
      );
    }, [r, n, i, L, s, M, Qe, l, u, j, te, Xe, Se, ot]));
  const Gt = (me) => {
      const de = p.current;
      if (!de) return null;
      const xe = de.getBoundingClientRect();
      if (
        !xe.width ||
        !xe.height ||
        me.clientX < xe.left ||
        me.clientX > xe.right ||
        me.clientY < xe.top ||
        me.clientY > xe.bottom
      )
        return null;
      const Ye = U(me.clientX - xe.left, 0, xe.width),
        pt = U(me.clientY - xe.top, 0, xe.height),
        Ke = (Ye / xe.width) * de.width,
        ya = (pt / xe.height) * de.height;
      return {
        x: U(Ke, 0, de.width),
        y: U(ya, 0, de.height),
        xClient: Ye,
        yClient: pt,
        clientHeight: xe.height,
      };
    },
    aa = (me) => {
      const de = Me
        ? ze
          ? T.current || p.current
          : x.current || p.current
        : p.current;
      if (!de) return null;
      const xe = de.getBoundingClientRect();
      if (
        !xe.width ||
        !xe.height ||
        me.clientX < xe.left ||
        me.clientX > xe.right ||
        me.clientY < xe.top ||
        me.clientY > xe.bottom
      )
        return null;
      const Ye = U(me.clientX - xe.left, 0, xe.width),
        pt = U(me.clientY - xe.top, 0, xe.height);
      return { xClient: Ye, yClient: pt, clientHeight: xe.height };
    },
    Ir = (me) => {
      const de = Gt(me);
      de
        ? (P.current = { inside: !0, x: de.x, y: de.y })
        : (P.current = { ...P.current, inside: !1 });
      const xe = aa(me);
      (xe
        ? (le.current = {
            ...le.current,
            x: xe.xClient,
            y: xe.yClient,
            lastMove: performance.now(),
          })
        : (le.current = { ...le.current, x: Ef, y: Cf }),
        typeof Ce.current == "function" && Ce.current());
    },
    gs = () => {
      ((P.current = { ...P.current, inside: !1 }),
        (le.current = {
          ...le.current,
          x: Ef,
          y: Cf,
          lastMove: -1e9,
          active: 0,
        }),
        typeof Ce.current == "function" && Ce.current());
    },
    Ks = (me) => {
      const de = Gt(me),
        xe = performance.now();
      if (de) {
        P.current = { inside: !0, x: de.x, y: de.y };
        const pt = {
          x: de.x,
          y: de.y,
          startedAt: xe,
          seed: Math.random() * Math.PI * 2,
        };
        ve.current = [...ve.current.slice(-2), pt];
      }
      const Ye = aa(me);
      (Ye &&
        (le.current = {
          ...le.current,
          x: Ye.xClient,
          y: Ye.yClient,
          lastMove: xe,
        }),
        typeof Ce.current == "function" && Ce.current());
    };
  return d.jsxs("div", {
    ref: g,
    className: "ascii-renderer",
    onPointerMove: Ir,
    onPointerLeave: gs,
    onPointerDown: Ks,
    children: [
      d.jsx("div", {
        ref: y,
        className: "ascii-renderer-stage",
        style: { backgroundColor: Xe ? "transparent" : j },
        children: d.jsx("canvas", {
          ref: p,
          "aria-label": "ASCII art preview",
        }),
      }),
      d.jsx("canvas", {
        ref: x,
        className: "ascii-renderer-gl-layer",
        "aria-hidden": "true",
        style: {
          display: s.webglLayerEnabled && !ze ? "block" : "none",
          opacity: Me ? U(s.webglOverlayOpacity ?? 1, 0, 1) : 0,
          zIndex: (s.webglOverlayPosition || "behind") === "above" ? 3 : 1,
        },
      }),
      d.jsx("canvas", {
        ref: T,
        className: "ascii-renderer-gl-layer",
        "aria-hidden": "true",
        style: {
          display: s.webglLayerEnabled && ze ? "block" : "none",
          opacity: Me ? U(s.webglOverlayOpacity ?? 1, 0, 1) : 0,
          zIndex: (s.webglOverlayPosition || "behind") === "above" ? 3 : 1,
        },
      }),
    ],
  });
}
const Hx = {
    classic: "Classic ASCII",
    braille: "Braille",
    halftone: "Halftone",
    dotcross: "Dot Cross",
    line: "Line",
    particles: "Particles",
    claude: "Claude Code",
    retro: "Retro Art",
    terminal: "Terminal",
  },
  Fx = {
    standard: "Standard (@%#*+=-:. )",
    blocks: "Blocks (█▓▒░ )",
    detailed: "Detailed ($@B%8&WM... )",
    minimal: "Minimal (·░█)",
    binary: "Binary (01)",
    custom: "Custom",
    "letters-alphabet": "Letters (A-Z)",
    "letters-lowercase": "Letters (a-z)",
    "letters-mixed": "Letters (Aa)",
    "letters-symbols": "Letters (Symbols)",
  },
  qx = { standard: "Standard", sparse: "Sparse", dense: "Dense" },
  Yx = {
    circle: "Circle",
    square: "Square",
    diamond: "Diamond",
    pentagon: "Pentagon",
    hexagon: "Hexagon",
  },
  Wx = {
    "amber-classic": "Amber Classic",
    "cyan-night": "Cyan Night",
    "violet-haze": "Violet Haze",
    "lime-pulse": "Lime Pulse",
    "mono-ice": "Mono Ice",
  },
  Xx = {
    binary: "101010",
    brackets: "[]/\\<>",
    symbols: "$_+",
    mixed: "Mixed Terminal",
    matrix: "{}[]|/\\_+-",
  },
  Kx = {
    none: "None",
    "floyd-steinberg": "Floyd-Steinberg",
    bayer: "Bayer (Ordered)",
    atkinson: "Atkinson",
  },
  Jx = {
    grayscale: "Grayscale",
    color: "Full Color",
    green: "Matrix Green",
    amber: "Amber Monitor",
    custom: "Custom",
  },
  Qx = {
    none: "None",
    noise: "Noise Field",
    intervals: "Intervals",
    beam: "Beam Sweep",
    glitch: "Glitch",
    crt: "CRT Monitor",
    matrix: "Matrix Rain",
  },
  Zx = { attract: "Attract", push: "Push" },
  e1 = [
    { key: "up", label: "Up", icon: "↑" },
    { key: "down", label: "Down", icon: "↓" },
    { key: "left", label: "Left", icon: "←" },
    { key: "right", label: "Right", icon: "→" },
    { key: "top-left", label: "Top Left", icon: "↖" },
    { key: "top-right", label: "Top Right", icon: "↗" },
    { key: "bottom-left", label: "Bottom Left", icon: "↙" },
    { key: "bottom-right", label: "Bottom Right", icon: "↘" },
  ],
  Jc = {
    '"Helvetica Neue", Helvetica, Arial, sans-serif': "Helvetica Neue",
    '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif': "Inter",
    '"Poppins", "Helvetica Neue", Helvetica, Arial, sans-serif': "Poppins",
    '"Space Grotesk", "Helvetica Neue", Helvetica, Arial, sans-serif':
      "Space Grotesk",
    '"VT323", "Arial", sans-serif': "VT323 (Pixel)",
  },
  t1 = {
    "lightning-rails": "Lightning Rails",
    "atmospheric-folds": "Atmospheric Folds",
    "network-dome": "Network Dome",
    "ambient-starfield": "Ambient Starfield",
    "terrain-mesh": "Terrain Mesh",
    "topology-dots": "Topology Dots",
    "radial-burst": "Radial Burst",
  },
  n1 = { behind: "Behind", above: "Above" },
  a1 = { false: "Separate", true: "ASCII FX" },
  r1 = "#00ff99",
  If = "#99bbff",
  i1 =
    "linear-gradient(90deg, #ff4d4d 0%, #ffd24d 17%, #6dff6d 33%, #4dffff 50%, #4d6dff 67%, #d24dff 83%, #ff4d4d 100%)";
function Bd(r, n, i) {
  return Math.max(n, Math.min(i, r));
}
function gv(r, n = If) {
  return /^#[0-9a-fA-F]{6}$/.test(r || "") ? r.toLowerCase() : n;
}
function s1(r, n = If) {
  const i = gv(r, n);
  return {
    r: Number.parseInt(i.slice(1, 3), 16),
    g: Number.parseInt(i.slice(3, 5), 16),
    b: Number.parseInt(i.slice(5, 7), 16),
  };
}
function o1(r, n, i) {
  const s = Bd(r / 255, 0, 1),
    l = Bd(n / 255, 0, 1),
    u = Bd(i / 255, 0, 1),
    m = Math.max(s, l, u),
    g = Math.min(s, l, u),
    y = (m + g) / 2,
    p = m - g;
  if (p === 0) return { h: 0, s: 0, l: y };
  const x = y > 0.5 ? p / (2 - m - g) : p / Math.max(m + g, Number.EPSILON);
  let T;
  switch (m) {
    case s:
      T = (l - u) / p + (l < u ? 6 : 0);
      break;
    case l:
      T = (u - s) / p + 2;
      break;
    default:
      T = (s - l) / p + 4;
      break;
  }
  return { h: (T / 6) * 360, s: x, l: y };
}
function Ym(r, n, i) {
  let s = i;
  return (
    s < 0 && (s += 1),
    s > 1 && (s -= 1),
    s < 1 / 6
      ? r + (n - r) * 6 * s
      : s < 1 / 2
        ? n
        : s < 2 / 3
          ? r + (n - r) * (2 / 3 - s) * 6
          : r
  );
}
function l1(r, n, i) {
  const s = (((r % 360) + 360) % 360) / 360,
    l = Bd(n, 0, 1),
    u = Bd(i, 0, 1);
  if (l === 0) {
    const M = Math.round(u * 255)
      .toString(16)
      .padStart(2, "0");
    return `#${M}${M}${M}`;
  }
  const m = u < 0.5 ? u * (1 + l) : u + l - u * l,
    g = 2 * u - m,
    y = Math.round(Ym(g, m, s + 1 / 3) * 255),
    p = Math.round(Ym(g, m, s) * 255),
    x = Math.round(Ym(g, m, s - 1 / 3) * 255);
  return `#${y.toString(16).padStart(2, "0")}${p.toString(16).padStart(2, "0")}${x.toString(16).padStart(2, "0")}`;
}
function c1(r, n = If) {
  const { r: i, g: s, b: l } = s1(r, n);
  return o1(i, s, l);
}
function oy({
  label: r,
  sliderId: n,
  pickerId: i,
  value: s,
  fallback: l,
  onChange: u,
}) {
  const m = gv(s, l),
    g = c1(m, l),
    y = (p) => {
      const x = Number(p),
        T = g.s < 0.08 ? 0.75 : g.s;
      u(l1(x, T, g.l));
    };
  return d.jsxs("div", {
    className: "control-row",
    children: [
      d.jsx("label", { htmlFor: i, children: r }),
      d.jsxs("div", {
        className: "hue-color-inputs",
        children: [
          d.jsx("input", {
            id: n,
            className: "hue-slider",
            type: "range",
            min: 0,
            max: 360,
            step: 1,
            "aria-label": `${r} hue`,
            title: `${r} hue`,
            value: Math.round(g.h),
            onChange: (p) => y(p.target.value),
            style: { background: i1 },
          }),
          d.jsx("input", {
            id: i,
            className: "control-color",
            type: "color",
            "aria-label": r,
            value: m,
            onChange: (p) => u(p.target.value),
          }),
        ],
      }),
    ],
  });
}
function ft({
  label: r,
  value: n,
  min: i,
  max: s,
  step: l,
  onChange: u,
  suffix: m = "",
}) {
  return d.jsxs("div", {
    className: "control-row",
    children: [
      d.jsxs("div", {
        className: "split-line",
        children: [
          d.jsx("span", { className: "control-label", children: r }),
          d.jsxs("span", { className: "control-value", children: [n, m] }),
        ],
      }),
      d.jsx("input", {
        type: "range",
        min: i,
        max: s,
        step: l,
        value: n,
        onChange: (g) => u(Number(g.target.value)),
      }),
    ],
  });
}
function ni({ label: r, value: n, options: i, onChange: s }) {
  return d.jsxs("div", {
    className: "control-row",
    children: [
      d.jsx("label", { children: r }),
      d.jsx("select", {
        className: "control-select",
        value: n,
        onChange: (l) => s(l.target.value),
        children: Object.entries(i).map(([l, u]) =>
          d.jsx("option", { value: l, children: u }, l),
        ),
      }),
    ],
  });
}
function Qc({ value: r, onChange: n, ariaLabel: i }) {
  return d.jsx("div", {
    className: "tab-buttons fx-direction-tabs",
    role: "tablist",
    "aria-label": i,
    children: e1.map((s) =>
      d.jsx(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-label": s.label,
          title: s.label,
          "aria-selected": r === s.key,
          className:
            r === s.key
              ? "active direction-icon-button"
              : "direction-icon-button",
          onClick: () => n(s.key),
          children: d.jsx("span", { "aria-hidden": "true", children: s.icon }),
        },
        s.key,
      ),
    ),
  });
}
function u1({ settings: r, onChange: n }) {
  const [i, s] = w.useState(() => (r.webglLayerEnabled ? "webgl" : "ascii")),
    l = r.webglLayerEnabled ? i : "ascii",
    u = l === "webgl",
    m = (p) => {
      const x = p === "webgl" ? "webgl" : "ascii";
      (s(x),
        x === "webgl" && !r.webglLayerEnabled && n("webglLayerEnabled", !0));
    },
    g = () => {
      (n("webglLayerEnabled", !1), s("ascii"));
    },
    y = d.jsx(ni, {
      label: "Dither Algorithm",
      value: r.ditherType,
      options: Kx,
      onChange: (p) => n("ditherType", p),
    });
  return d.jsxs("div", {
    className: "controls-panel interactive",
    children: [
      d.jsxs("div", {
        className: "control-row",
        children: [
          d.jsx("span", { className: "control-label", children: "Layer" }),
          d.jsxs("div", {
            className: "tab-buttons layer-tabs",
            role: "tablist",
            "aria-label": "Render Layer",
            children: [
              d.jsx("button", {
                type: "button",
                role: "tab",
                "aria-selected": l === "ascii",
                className: l === "ascii" ? "active" : "",
                onClick: () => m("ascii"),
                children: "ASCII",
              }),
              r.webglLayerEnabled
                ? d.jsx("button", {
                    type: "button",
                    role: "tab",
                    "aria-selected": l === "webgl",
                    className: l === "webgl" ? "active" : "",
                    onClick: () => m("webgl"),
                    children: "WEBGL",
                  })
                : d.jsx("button", {
                    type: "button",
                    className: "layer-add-button",
                    onClick: () => m("webgl"),
                    children: "ADD LAYER",
                  }),
            ],
          }),
        ],
      }),
      !u &&
        d.jsxs(d.Fragment, {
          children: [
            d.jsxs("div", {
              className: "control-row",
              children: [
                d.jsx("span", {
                  className: "control-label",
                  children: "Art Style",
                }),
                d.jsx("div", {
                  className: "style-buttons",
                  children: Object.entries(Hx).map(([p, x]) =>
                    d.jsx(
                      "button",
                      {
                        type: "button",
                        className: r.style === p ? "active" : "",
                        onClick: () => n("style", p),
                        children: x,
                      },
                      p,
                    ),
                  ),
                }),
              ],
            }),
            r.style === "classic"
              ? d.jsxs(d.Fragment, {
                  children: [
                    d.jsxs("div", {
                      className: "control-grid-3",
                      children: [
                        d.jsx(ni, {
                          label: "Font",
                          value: r.renderFont,
                          options: Jc,
                          onChange: (p) => n("renderFont", p),
                        }),
                        d.jsx(ni, {
                          label: "Character Set",
                          value: r.charset,
                          options: Fx,
                          onChange: (p) => n("charset", p),
                        }),
                        y,
                      ],
                    }),
                    r.charset === "custom" &&
                      d.jsxs("div", {
                        className: "control-row",
                        children: [
                          d.jsx("label", {
                            htmlFor: "custom-charset-input",
                            children: "Custom Character Sequence",
                          }),
                          d.jsx("input", {
                            id: "custom-charset-input",
                            type: "text",
                            maxLength: 100,
                            className: "control-text",
                            value:
                              typeof r.customCharset == "string"
                                ? r.customCharset
                                : "",
                            onChange: (p) => n("customCharset", p.target.value),
                            placeholder: "aura",
                          }),
                        ],
                      }),
                  ],
                })
              : r.style === "braille"
                ? d.jsxs("div", {
                    className: "control-grid-3",
                    children: [
                      d.jsx(ni, {
                        label: "Font",
                        value: r.renderFont,
                        options: Jc,
                        onChange: (p) => n("renderFont", p),
                      }),
                      d.jsx(ni, {
                        label: "Braille Set",
                        value: r.brailleVariant || "standard",
                        options: qx,
                        onChange: (p) => n("brailleVariant", p),
                      }),
                      y,
                    ],
                  })
                : r.style === "halftone"
                  ? d.jsxs("div", {
                      className: "control-grid-3",
                      children: [
                        d.jsx(ni, {
                          label: "Font",
                          value: r.renderFont,
                          options: Jc,
                          onChange: (p) => n("renderFont", p),
                        }),
                        d.jsx(ni, {
                          label: "Halftone Shape",
                          value: r.halftoneShape || "circle",
                          options: Yx,
                          onChange: (p) => n("halftoneShape", p),
                        }),
                        y,
                      ],
                    })
                  : r.style === "retro"
                    ? d.jsxs("div", {
                        className: "control-grid-3",
                        children: [
                          d.jsx(ni, {
                            label: "Font",
                            value: r.renderFont,
                            options: Jc,
                            onChange: (p) => n("renderFont", p),
                          }),
                          d.jsx(ni, {
                            label: "Retro Duotone",
                            value: r.retroDuotone || "amber-classic",
                            options: Wx,
                            onChange: (p) => n("retroDuotone", p),
                          }),
                          y,
                        ],
                      })
                    : r.style === "terminal"
                      ? d.jsxs("div", {
                          className: "control-grid-3",
                          children: [
                            d.jsx(ni, {
                              label: "Font",
                              value: r.renderFont,
                              options: Jc,
                              onChange: (p) => n("renderFont", p),
                            }),
                            d.jsx(ni, {
                              label: "Terminal Set",
                              value: r.terminalCharset || "binary",
                              options: Xx,
                              onChange: (p) => n("terminalCharset", p),
                            }),
                            y,
                          ],
                        })
                      : d.jsxs("div", {
                          className: "control-grid-2",
                          children: [
                            d.jsx(ni, {
                              label: "Font",
                              value: r.renderFont,
                              options: Jc,
                              onChange: (p) => n("renderFont", p),
                            }),
                            y,
                          ],
                        }),
            r.style === "particles" &&
              d.jsxs(d.Fragment, {
                children: [
                  d.jsx(ft, {
                    label: "Particle Density",
                    value: r.particleDensity,
                    min: 0.1,
                    max: 1,
                    step: 0.05,
                    onChange: (p) => n("particleDensity", p),
                  }),
                  d.jsxs("div", {
                    className: "control-row",
                    children: [
                      d.jsx("label", { children: "Particle Char" }),
                      d.jsx("input", {
                        type: "text",
                        maxLength: 1,
                        className: "control-text",
                        value: r.particleChar,
                        onChange: (p) =>
                          n("particleChar", p.target.value || "*"),
                      }),
                    ],
                  }),
                ],
              }),
            r.style === "halftone" &&
              d.jsxs(d.Fragment, {
                children: [
                  d.jsx(ft, {
                    label: "Halftone Size",
                    value: r.halftoneSize ?? 1,
                    min: 0.4,
                    max: 2.2,
                    step: 0.05,
                    suffix: "x",
                    onChange: (p) => n("halftoneSize", p),
                  }),
                  d.jsx(ft, {
                    label: "Halftone Rotation",
                    value: r.halftoneRotation ?? 0,
                    min: -180,
                    max: 180,
                    step: 1,
                    suffix: "deg",
                    onChange: (p) => n("halftoneRotation", p),
                  }),
                ],
              }),
            r.style === "retro" &&
              d.jsx(ft, {
                label: "Retro Noise",
                value: r.retroNoise ?? 0.45,
                min: 0,
                max: 1,
                step: 0.05,
                onChange: (p) => n("retroNoise", p),
              }),
            r.style === "line" &&
              d.jsxs(d.Fragment, {
                children: [
                  d.jsx(ft, {
                    label: "Line Length",
                    value: r.lineLength,
                    min: 0.1,
                    max: 2.5,
                    step: 0.05,
                    onChange: (p) => n("lineLength", p),
                  }),
                  d.jsx(ft, {
                    label: "Line Width",
                    value: r.lineWidth,
                    min: 0.2,
                    max: 2.5,
                    step: 0.05,
                    onChange: (p) => n("lineWidth", p),
                  }),
                  d.jsx(ft, {
                    label: "Line Thickness",
                    value: r.lineThickness,
                    min: 0.2,
                    max: 8,
                    step: 0.1,
                    suffix: "px",
                    onChange: (p) => n("lineThickness", p),
                  }),
                  d.jsx(ft, {
                    label: "Line Rotation",
                    value: r.lineRotation,
                    min: -180,
                    max: 180,
                    step: 1,
                    suffix: "deg",
                    onChange: (p) => n("lineRotation", p),
                  }),
                ],
              }),
            d.jsxs("div", {
              className: "control-columns",
              children: [
                d.jsxs("div", {
                  className: "control-column",
                  children: [
                    d.jsx(ft, {
                      label: "Brightness",
                      value: r.brightness,
                      min: -50,
                      max: 50,
                      step: 1,
                      onChange: (p) => n("brightness", p),
                    }),
                    d.jsx(ft, {
                      label: "BG Dither",
                      value: r.bgDither ?? 0,
                      min: 0,
                      max: 3,
                      step: 0.05,
                      onChange: (p) => n("bgDither", p),
                    }),
                    d.jsx(ft, {
                      label: "Inverse Dither",
                      value: r.inverseDither ?? 0,
                      min: 0,
                      max: 3,
                      step: 0.05,
                      onChange: (p) => n("inverseDither", p),
                    }),
                    d.jsx(ft, {
                      label: "Character Spacing",
                      value: r.charSpacing,
                      min: 0.7,
                      max: 2,
                      step: 0.05,
                      suffix: "x",
                      onChange: (p) => n("charSpacing", p),
                    }),
                    d.jsx(ft, {
                      label: "Vignette",
                      value: r.vignette ?? 0,
                      min: 0,
                      max: 1,
                      step: 0.05,
                      onChange: (p) => n("vignette", p),
                    }),
                  ],
                }),
                d.jsxs("div", {
                  className: "control-column",
                  children: [
                    d.jsx(ft, {
                      label: "Contrast",
                      value: r.contrast,
                      min: 0.5,
                      max: 2.5,
                      step: 0.1,
                      onChange: (p) => n("contrast", p),
                    }),
                    r.ditherType !== "none" &&
                      d.jsx(ft, {
                        label: "Dither Strength",
                        value: r.ditherStrength,
                        min: 0,
                        max: 2,
                        step: 0.05,
                        onChange: (p) => n("ditherStrength", p),
                      }),
                    d.jsx(ft, {
                      label: "Font Size",
                      value: r.fontSize,
                      min: 6,
                      max: 20,
                      step: 1,
                      suffix: "px",
                      onChange: (p) => n("fontSize", p),
                    }),
                    d.jsx(ft, {
                      label: "Opacity",
                      value: r.opacity ?? 1,
                      min: 0,
                      max: 1,
                      step: 0.05,
                      onChange: (p) => n("opacity", p),
                    }),
                    d.jsx(ft, {
                      label: "Border Glow",
                      value: r.borderGlow ?? 0,
                      min: 0,
                      max: 1,
                      step: 0.05,
                      onChange: (p) => n("borderGlow", p),
                    }),
                  ],
                }),
              ],
            }),
            d.jsxs("div", {
              className: "control-row",
              children: [
                d.jsxs("div", {
                  className: "control-row-head",
                  children: [
                    d.jsx("span", {
                      className: "control-label",
                      children: "Color Mode",
                    }),
                    d.jsxs("label", {
                      className: "check-line compact",
                      children: [
                        d.jsx("input", {
                          type: "checkbox",
                          checked: r.invert,
                          onChange: (p) => n("invert", p.target.checked),
                        }),
                        d.jsx("span", { children: "Invert Color" }),
                      ],
                    }),
                  ],
                }),
                d.jsx("div", {
                  className: "tab-buttons color-mode-tabs",
                  role: "tablist",
                  "aria-label": "Color Mode",
                  children: Object.entries(Jx).map(([p, x]) =>
                    d.jsx(
                      "button",
                      {
                        type: "button",
                        title: x,
                        role: "tab",
                        "aria-selected": r.colorMode === p,
                        className: r.colorMode === p ? "active" : "",
                        onClick: () => n("colorMode", p),
                        children: x,
                      },
                      p,
                    ),
                  ),
                }),
              ],
            }),
            r.colorMode === "custom" &&
              d.jsx(oy, {
                label: "Custom Color",
                sliderId: "custom-color-hue-slider",
                pickerId: "custom-color-picker",
                value: r.customColor,
                fallback: r1,
                onChange: (p) => n("customColor", p),
              }),
            d.jsxs("div", {
              className: "control-section",
              children: [
                d.jsxs("div", {
                  className: "control-row",
                  children: [
                    d.jsx("span", {
                      className: "control-label",
                      children: "FX Preset",
                    }),
                    d.jsx("div", {
                      className: "tab-buttons fx-preset-tabs",
                      role: "tablist",
                      "aria-label": "FX Preset",
                      children: Object.entries(Qx).map(([p, x]) =>
                        d.jsx(
                          "button",
                          {
                            type: "button",
                            title: x,
                            role: "tab",
                            "aria-selected": r.overlayPreset === p,
                            className: r.overlayPreset === p ? "active" : "",
                            onClick: () => n("overlayPreset", p),
                            children: x,
                          },
                          p,
                        ),
                      ),
                    }),
                  ],
                }),
                r.overlayPreset !== "none" &&
                  d.jsxs(d.Fragment, {
                    children: [
                      d.jsx(ft, {
                        label: "FX Strength",
                        value: r.overlayStrength,
                        min: 0.05,
                        max: 1,
                        step: 0.05,
                        onChange: (p) => n("overlayStrength", p),
                      }),
                      r.overlayPreset === "noise" &&
                        d.jsxs(d.Fragment, {
                          children: [
                            d.jsxs("div", {
                              className: "control-row",
                              children: [
                                d.jsx("span", {
                                  className: "control-label",
                                  children: "Direction",
                                }),
                                d.jsx(Qc, {
                                  value: r.noiseDirection,
                                  onChange: (p) => n("noiseDirection", p),
                                  ariaLabel: "Noise Direction",
                                }),
                              ],
                            }),
                            d.jsx(ft, {
                              label: "Noise Scale",
                              value: r.noiseScale,
                              min: 4,
                              max: 96,
                              step: 1,
                              onChange: (p) => n("noiseScale", p),
                            }),
                            d.jsx(ft, {
                              label: "Noise Speed",
                              value: r.noiseSpeed,
                              min: 0,
                              max: 3,
                              step: 0.1,
                              onChange: (p) => n("noiseSpeed", p),
                            }),
                          ],
                        }),
                      r.overlayPreset === "intervals" &&
                        d.jsxs(d.Fragment, {
                          children: [
                            d.jsxs("div", {
                              className: "control-row",
                              children: [
                                d.jsx("span", {
                                  className: "control-label",
                                  children: "Direction",
                                }),
                                d.jsx(Qc, {
                                  value: r.intervalDirection,
                                  onChange: (p) => n("intervalDirection", p),
                                  ariaLabel: "Intervals Direction",
                                }),
                              ],
                            }),
                            d.jsx(ft, {
                              label: "Interval Spacing",
                              value: r.intervalSpacing,
                              min: 4,
                              max: 36,
                              step: 1,
                              onChange: (p) => n("intervalSpacing", p),
                            }),
                            d.jsx(ft, {
                              label: "Interval Speed",
                              value: r.intervalSpeed,
                              min: 0,
                              max: 3,
                              step: 0.1,
                              onChange: (p) => n("intervalSpeed", p),
                            }),
                            d.jsx(ft, {
                              label: "Interval Width",
                              value: r.intervalWidth,
                              min: 1,
                              max: 8,
                              step: 1,
                              onChange: (p) => n("intervalWidth", p),
                            }),
                          ],
                        }),
                      r.overlayPreset === "beam" &&
                        d.jsxs("div", {
                          className: "control-row",
                          children: [
                            d.jsx("span", {
                              className: "control-label",
                              children: "Direction",
                            }),
                            d.jsx(Qc, {
                              value: r.beamDirection,
                              onChange: (p) => n("beamDirection", p),
                              ariaLabel: "Beam Direction",
                            }),
                          ],
                        }),
                      r.overlayPreset === "glitch" &&
                        d.jsxs("div", {
                          className: "control-row",
                          children: [
                            d.jsx("span", {
                              className: "control-label",
                              children: "Direction",
                            }),
                            d.jsx(Qc, {
                              value: r.glitchDirection,
                              onChange: (p) => n("glitchDirection", p),
                              ariaLabel: "Glitch Direction",
                            }),
                          ],
                        }),
                      r.overlayPreset === "crt" &&
                        d.jsxs("div", {
                          className: "control-row",
                          children: [
                            d.jsx("span", {
                              className: "control-label",
                              children: "Direction",
                            }),
                            d.jsx(Qc, {
                              value: r.crtDirection,
                              onChange: (p) => n("crtDirection", p),
                              ariaLabel: "CRT Direction",
                            }),
                          ],
                        }),
                      r.overlayPreset === "matrix" &&
                        d.jsxs(d.Fragment, {
                          children: [
                            d.jsxs("div", {
                              className: "control-row",
                              children: [
                                d.jsx("span", {
                                  className: "control-label",
                                  children: "Direction",
                                }),
                                d.jsx(Qc, {
                                  value: r.matrixDirection,
                                  onChange: (p) => n("matrixDirection", p),
                                  ariaLabel: "Matrix Direction",
                                }),
                              ],
                            }),
                            d.jsx(ft, {
                              label: "Matrix Scale",
                              value: r.matrixScale,
                              min: 6,
                              max: 48,
                              step: 1,
                              onChange: (p) => n("matrixScale", p),
                            }),
                            d.jsx(ft, {
                              label: "Matrix Speed",
                              value: r.matrixSpeed,
                              min: 0.1,
                              max: 3.5,
                              step: 0.1,
                              onChange: (p) => n("matrixSpeed", p),
                            }),
                          ],
                        }),
                    ],
                  }),
              ],
            }),
            d.jsxs("div", {
              className: "control-section control-section-separated",
              children: [
                d.jsxs("div", {
                  className: "control-row",
                  children: [
                    d.jsx("span", {
                      className: "control-label",
                      children: "Mouse Interaction",
                    }),
                    d.jsx("div", {
                      className: "tab-buttons",
                      role: "tablist",
                      "aria-label": "Mouse Interaction",
                      children: Object.entries(Zx).map(([p, x]) =>
                        d.jsx(
                          "button",
                          {
                            type: "button",
                            role: "tab",
                            "aria-selected": r.mouseInteractionMode === p,
                            className:
                              r.mouseInteractionMode === p ? "active" : "",
                            onClick: () => n("mouseInteractionMode", p),
                            children: x,
                          },
                          p,
                        ),
                      ),
                    }),
                  ],
                }),
                d.jsx(ft, {
                  label: "Hover Strength",
                  value: r.hoverStrength,
                  min: 4,
                  max: 64,
                  step: 1,
                  onChange: (p) => n("hoverStrength", p),
                }),
                d.jsx(ft, {
                  label: "Area Size",
                  value: r.mouseAreaSize,
                  min: 40,
                  max: 640,
                  step: 1,
                  suffix: "px",
                  onChange: (p) => n("mouseAreaSize", p),
                }),
                d.jsx(ft, {
                  label: "Spread",
                  value: r.mouseSpread,
                  min: 0.25,
                  max: 3,
                  step: 0.05,
                  suffix: "x",
                  onChange: (p) => n("mouseSpread", p),
                }),
              ],
            }),
          ],
        }),
      u &&
        d.jsxs("div", {
          className: "control-section control-section-separated",
          children: [
            d.jsx("div", {
              className: "control-row",
              children: d.jsx("span", {
                className: "control-label",
                children: "WebGL Overlay",
              }),
            }),
            d.jsxs("div", {
              className: "control-row",
              children: [
                d.jsx("span", {
                  className: "control-label",
                  children: "Layer Type",
                }),
                d.jsx("div", {
                  className: "tab-buttons fx-preset-tabs",
                  role: "tablist",
                  "aria-label": "WebGL Layer Type",
                  children: Object.entries(t1).map(([p, x]) =>
                    d.jsx(
                      "button",
                      {
                        type: "button",
                        title: x,
                        role: "tab",
                        "aria-selected":
                          (r.webglOverlayType || "lightning-rails") === p,
                        className:
                          (r.webglOverlayType || "lightning-rails") === p
                            ? "active"
                            : "",
                        onClick: () => n("webglOverlayType", p),
                        children: x,
                      },
                      p,
                    ),
                  ),
                }),
              ],
            }),
            d.jsxs("div", {
              className: "control-row",
              children: [
                d.jsx("span", {
                  className: "control-label",
                  children: "Affects ASCII",
                }),
                d.jsx("div", {
                  className: "tab-buttons",
                  role: "tablist",
                  "aria-label": "WebGL ASCII Effect",
                  children: Object.entries(a1).map(([p, x]) => {
                    const T = String(!!r.webglOverlayAffectsAscii) === p;
                    return d.jsx(
                      "button",
                      {
                        type: "button",
                        role: "tab",
                        "aria-selected": T,
                        className: T ? "active" : "",
                        onClick: () =>
                          n("webglOverlayAffectsAscii", p === "true"),
                        children: x,
                      },
                      p,
                    );
                  }),
                }),
              ],
            }),
            !r.webglOverlayAffectsAscii &&
              d.jsxs("div", {
                className: "control-row",
                children: [
                  d.jsx("span", {
                    className: "control-label",
                    children: "Placement",
                  }),
                  d.jsx("div", {
                    className: "tab-buttons",
                    role: "tablist",
                    "aria-label": "WebGL Placement",
                    children: Object.entries(n1).map(([p, x]) =>
                      d.jsx(
                        "button",
                        {
                          type: "button",
                          role: "tab",
                          "aria-selected":
                            (r.webglOverlayPosition || "behind") === p,
                          className:
                            (r.webglOverlayPosition || "behind") === p
                              ? "active"
                              : "",
                          onClick: () => n("webglOverlayPosition", p),
                          children: x,
                        },
                        p,
                      ),
                    ),
                  }),
                ],
              }),
            d.jsx(ft, {
              label: "Opacity",
              value: r.webglOverlayOpacity ?? 1,
              min: 0,
              max: 1,
              step: 0.05,
              onChange: (p) => n("webglOverlayOpacity", p),
            }),
            d.jsx(ft, {
              label: "Intensity",
              value: r.webglOverlayIntensity ?? 0.45,
              min: 0,
              max: 1,
              step: 0.05,
              onChange: (p) => n("webglOverlayIntensity", p),
            }),
            d.jsx(ft, {
              label: "Line Spread",
              value: r.webglOverlayLineSpread ?? 0.25,
              min: 0.1,
              max: 0.55,
              step: 0.01,
              onChange: (p) => n("webglOverlayLineSpread", p),
            }),
            d.jsx(ft, {
              label: "Pulse Speed",
              value: r.webglOverlayPulseSpeed ?? 1,
              min: 0.2,
              max: 4,
              step: 0.05,
              onChange: (p) => n("webglOverlayPulseSpeed", p),
            }),
            d.jsx(ft, {
              label: "Mouse Influence",
              value: r.webglOverlayMouseInfluence ?? 1,
              min: 0,
              max: 2,
              step: 0.05,
              onChange: (p) => n("webglOverlayMouseInfluence", p),
            }),
            d.jsx(ft, {
              label: "Film Grain",
              value: r.webglOverlayGrain ?? 0.02,
              min: 0,
              max: 0.12,
              step: 0.005,
              onChange: (p) => n("webglOverlayGrain", p),
            }),
            d.jsx(oy, {
              label: "WebGL Color",
              sliderId: "webgl-overlay-hue-slider",
              pickerId: "webgl-overlay-color-picker",
              value: r.webglOverlayColor,
              fallback: If,
              onChange: (p) => n("webglOverlayColor", p),
            }),
            d.jsx("div", {
              className: "control-row",
              children: d.jsx("button", {
                type: "button",
                className: "webgl-remove-action",
                onClick: g,
                children: "Remove Layer",
              }),
            }),
          ],
        }),
    ],
  });
}
