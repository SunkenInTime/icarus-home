"use client";

import { CSSProperties, useEffect, useRef } from "react";

/**
 * WebGL port of the app's update-dialog hero shader
 * (icarus-release/shaders/dither_fire.frag).
 *
 * A halftone lattice of round dots whose size and color follow layered
 * noise fields: violet "heat" and cool silver drift through each other over
 * a near-black background. `progress` (0..1) energizes the field — at 0 it
 * drifts slowly and dim, at 1 it brightens and the violet layer dominates.
 * In the app it's wired to download progress; here wire it to anything
 * meaningful (scroll proximity, a real download, hover intent).
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

type Props = {
    /** 0..1 — energizes the field. Defaults to idle drift. */
    progress?: number;
    /** Dot lattice pitch in CSS pixels. The app uses 9. */
    cell?: number;
    /** Time multiplier; 1 matches the app. */
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

export default function DitherFire({
    progress = 0,
    cell = 9,
    speed = 1,
    className,
    style,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const progressTarget = useRef(progress);
    const redraw = useRef<(() => void) | null>(null);

    useEffect(() => {
        progressTarget.current = Math.max(0, Math.min(1, progress));
        // In reduced-motion mode there is no loop; repaint for the new value.
        redraw.current?.();
    }, [progress]);

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

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let raf = 0;
        let visible = true;
        let dpr = 1;
        let progressCurrent = progressTarget.current;
        const start = performance.now();

        function render(timeSeconds: number) {
            gl!.uniform1f(uTime, timeSeconds * speed);
            gl!.uniform1f(uProgress, progressCurrent);
            gl!.drawArrays(gl!.TRIANGLES, 0, 3);
        }

        function frame(now: number) {
            raf = 0;
            if (!visible) return;
            progressCurrent += (progressTarget.current - progressCurrent) * 0.1;
            render((now - start) * 0.001);
            if (!reduceMotion) raf = requestAnimationFrame(frame);
        }

        function kick() {
            if (!raf && visible) raf = requestAnimationFrame(frame);
        }

        function resize() {
            const rect = canvas!.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
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
