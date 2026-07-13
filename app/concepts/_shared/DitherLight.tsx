"use client";

import { CSSProperties, useEffect, useRef } from "react";

/**
 * Sibling of DitherFire: the same halftone dot lattice, but instead of a
 * noise-driven fire field it renders a torchlight — a radial pool of violet
 * light with fbm flicker at its edge. `progress` (0..1) grows the pool from
 * a tight beam to a glow that covers the canvas, and raises the ambient
 * floor with it. `light` places the source in fractional canvas coords.
 */

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

type Props = {
    /** 0..1 — grows the light pool and raises the ambient floor. */
    progress?: number;
    /** Light source position as fractions of canvas width/height. */
    light?: { x: number; y: number };
    /** Dot lattice pitch in CSS pixels. */
    cell?: number;
    speed?: number;
    className?: string;
    style?: CSSProperties;
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export default function DitherLight({
    progress = 0,
    light = { x: 0.5, y: 0.5 },
    cell = 9,
    speed = 1,
    className,
    style,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const progressTarget = useRef(progress);
    const lightTarget = useRef(light);
    const redraw = useRef<(() => void) | null>(null);

    useEffect(() => {
        progressTarget.current = Math.max(0, Math.min(1, progress));
        lightTarget.current = light;
        redraw.current?.();
    }, [progress, light]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl", {
            alpha: true,
            premultipliedAlpha: true,
            antialias: false,
            depth: false,
            stencil: false,
        });
        if (!gl) return;

        const vert = compile(gl, gl.VERTEX_SHADER, VERT);
        const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
        if (!vert || !frag) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vert);
        gl.attachShader(program, frag);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 3, -1, -1, 3]),
            gl.STATIC_DRAW,
        );
        const aPos = gl.getAttribLocation(program, "aPos");
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uSize = gl.getUniformLocation(program, "uSize");
        const uTime = gl.getUniformLocation(program, "uTime");
        const uProgress = gl.getUniformLocation(program, "uProgress");
        const uCell = gl.getUniformLocation(program, "uCell");
        const uLight = gl.getUniformLocation(program, "uLight");

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let raf = 0;
        let visible = true;
        let progressCurrent = progressTarget.current;
        const start = performance.now();

        function render(timeSeconds: number) {
            gl!.uniform1f(uTime, timeSeconds * speed);
            gl!.uniform1f(uProgress, progressCurrent);
            gl!.uniform2f(uLight, lightTarget.current.x, lightTarget.current.y);
            gl!.drawArrays(gl!.TRIANGLES, 0, 3);
        }

        function frame(now: number) {
            raf = 0;
            if (!visible) return;
            progressCurrent += (progressTarget.current - progressCurrent) * 0.12;
            render((now - start) * 0.001);
            if (!reduceMotion) raf = requestAnimationFrame(frame);
        }

        function kick() {
            if (!raf && visible) raf = requestAnimationFrame(frame);
        }

        function resize() {
            const rect = canvas!.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
            gl!.viewport(0, 0, canvas!.width, canvas!.height);
            gl!.uniform2f(uSize, canvas!.width, canvas!.height);
            gl!.uniform1f(uCell, cell * dpr);
            if (reduceMotion) {
                progressCurrent = progressTarget.current;
                render(0);
            } else {
                kick();
            }
        }

        redraw.current = () => {
            if (reduceMotion) {
                progressCurrent = progressTarget.current;
                render(0);
            } else {
                kick();
            }
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);

        const intersectionObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) redraw.current?.();
            else if (raf) {
                cancelAnimationFrame(raf);
                raf = 0;
            }
        });
        intersectionObserver.observe(canvas);

        resize();

        return () => {
            if (raf) cancelAnimationFrame(raf);
            redraw.current = null;
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            gl.deleteProgram(program);
            gl.deleteShader(vert);
            gl.deleteShader(frag);
            gl.deleteBuffer(buffer);
        };
    }, [cell, speed]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className={className}
            style={{ display: "block", width: "100%", height: "100%", ...style }}
        />
    );
}
