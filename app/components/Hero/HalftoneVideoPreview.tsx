"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export type HalftoneVideoSettings = {
    sampleWidth: number;
    brightness: number;
    contrast: number;
    ditherStrength: number;
    bgDither: number;
    invertDither: boolean;
    opacity: number;
    vignette: number;
    borderGlow: number;
    halftoneShape: "circle";
    halftoneScale: number;
    halftoneRotationDeg: number;
    colorMode: "grayscale";
    fxPreset: "noise-field";
    fxStrength: number;
    fxDirection: "right";
    noiseScale: number;
    noiseSpeed: number;
    pointerMode: "push";
    pointerStrength: number;
    pointerRadiusPx: number;
    pointerSpread: number;
};

export const QLOOP_HALFTONE_PRESET: HalftoneVideoSettings = {
    sampleWidth: 320,
    brightness: 0,
    contrast: 1,
    ditherStrength: 0.8,
    bgDither: 0,
    invertDither: false,
    opacity: 1,
    vignette: 0,
    borderGlow: 0,
    halftoneShape: "circle",
    halftoneScale: 1,
    halftoneRotationDeg: 0,
    colorMode: "grayscale",
    fxPreset: "noise-field",
    fxStrength: 0.45,
    fxDirection: "right",
    noiseScale: 24,
    noiseSpeed: 1,
    pointerMode: "push",
    pointerStrength: 24,
    pointerRadiusPx: 180,
    pointerSpread: 1,
};

type HalftoneVideoPreviewProps = {
    videoSrc?: string;
    title?: string;
    subtitle?: string;
    settings?: Partial<HalftoneVideoSettings>;
    fit?: "contain" | "cover";
};

type PointerState = {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    intensity: number;
    targetIntensity: number;
};

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function lerp(from: number, to: number, amount: number) {
    return from + (to - from) * amount;
}

function smoothstep(edge0: number, edge1: number, x: number) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

function hash2d(x: number, y: number) {
    const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return value - Math.floor(value);
}

function valueNoise2d(x: number, y: number) {
    const cellX = Math.floor(x);
    const cellY = Math.floor(y);
    const localX = x - cellX;
    const localY = y - cellY;
    const fadeX = localX * localX * (3 - 2 * localX);
    const fadeY = localY * localY * (3 - 2 * localY);

    const topLeft = hash2d(cellX, cellY);
    const topRight = hash2d(cellX + 1, cellY);
    const bottomLeft = hash2d(cellX, cellY + 1);
    const bottomRight = hash2d(cellX + 1, cellY + 1);

    const top = lerp(topLeft, topRight, fadeX);
    const bottom = lerp(bottomLeft, bottomRight, fadeX);

    return lerp(top, bottom, fadeY);
}

function fbm(x: number, y: number) {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;

    for (let octave = 0; octave < 4; octave += 1) {
        value += valueNoise2d(x * frequency, y * frequency) * amplitude;
        frequency *= 2;
        amplitude *= 0.5;
    }

    return value;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
    ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
    ctx.arcTo(x, y + height, x, y, safeRadius);
    ctx.arcTo(x, y, x + width, y, safeRadius);
    ctx.closePath();
}

function drawCapsule(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number
) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    drawRoundedRect(ctx, -width / 2, -height / 2, width, height, Math.min(width, height) / 2);
    ctx.fill();
    ctx.restore();
}

function drawFallbackFrame(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, reducedMotion: boolean) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    const halo = ctx.createRadialGradient(width * 0.5, height * 0.46, 0, width * 0.5, height * 0.46, width * 0.5);
    halo.addColorStop(0, "rgba(255,255,255,0.16)");
    halo.addColorStop(0.28, "rgba(255,255,255,0.05)");
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(reducedMotion ? 0.38 : 0.38 + time * 0.00022);
    ctx.fillStyle = "#fff";

    drawCapsule(ctx, 0, -height * 0.18, width * 0.16, height * 0.36, -0.05);
    drawCapsule(ctx, width * 0.16, 0, width * 0.16, height * 0.36, 0.56);
    drawCapsule(ctx, -width * 0.17, height * 0.04, width * 0.12, height * 0.3, -0.62);
    drawCapsule(ctx, width * 0.02, height * 0.2, width * 0.12, height * 0.22, 0.18);

    ctx.globalAlpha = reducedMotion ? 0.98 : 0.92 + Math.sin(time * 0.0025) * 0.08;
    ctx.beginPath();
    ctx.arc(-width * 0.08, height * 0.27, Math.max(width, height) * 0.055, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = reducedMotion ? 0.5 : 0.25 + Math.sin(time * 0.0017) * 0.15;
    ctx.beginPath();
    ctx.arc(width * 0.28, -height * 0.24, Math.max(width, height) * 0.03, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
}

function drawBackdrop(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    const gridSize = Math.max(16, Math.floor(width / 30));
    ctx.fillStyle = "rgba(255,255,255,0.04)";

    for (let y = gridSize * 0.75; y < height; y += gridSize) {
        for (let x = gridSize * 0.75; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.arc(x, y, 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawSourceFrame(
    sourceContext: CanvasRenderingContext2D,
    video: HTMLVideoElement | null,
    width: number,
    height: number,
    time: number,
    reducedMotion: boolean,
    fit: "contain" | "cover"
) {
    sourceContext.fillStyle = "#000";
    sourceContext.fillRect(0, 0, width, height);

    if (video && video.readyState >= 2) {
        const videoWidth = Math.max(1, video.videoWidth || width);
        const videoHeight = Math.max(1, video.videoHeight || height);
        const scale = fit === "cover" ? Math.max(width / videoWidth, height / videoHeight) : Math.min(width / videoWidth, height / videoHeight);
        const drawWidth = videoWidth * scale;
        const drawHeight = videoHeight * scale;
        const offsetX = (width - drawWidth) / 2;
        const offsetY = (height - drawHeight) / 2;

        sourceContext.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
        return true;
    }

    drawFallbackFrame(sourceContext, width, height, time, reducedMotion);
    return false;
}

function atkinsonDither(input: Float32Array, width: number, height: number, strength: number, invert: boolean) {
    const working = new Float32Array(input);
    const output = new Float32Array(input.length);

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const index = y * width + x;
            const original = clamp(working[index], 0, 1);
            const quantized = original >= 0.5 ? 1 : 0;
            const error = (original - quantized) * strength / 8;

            output[index] = clamp(input[index] * 0.42 + quantized * 0.58, 0, 1);

            if (x + 1 < width) working[index + 1] += error;
            if (x + 2 < width) working[index + 2] += error;
            if (y + 1 < height) {
                if (x - 1 >= 0) working[index + width - 1] += error;
                working[index + width] += error;
                if (x + 1 < width) working[index + width + 1] += error;
            }
            if (y + 2 < height) working[index + width * 2] += error;
        }
    }

    if (!invert) {
        return output;
    }

    for (let index = 0; index < output.length; index += 1) {
        output[index] = 1 - output[index];
    }

    return output;
}

export default function HalftoneVideoPreview({
    videoSrc,
    title = "Live Halftone",
    subtitle = "Canvas render / grayscale",
    settings,
    fit = "contain",
}: HalftoneVideoPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointerRef = useRef<PointerState>({
        x: 0.5,
        y: 0.5,
        targetX: 0.5,
        targetY: 0.5,
        intensity: 0,
        targetIntensity: 0,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const mergedSettings: HalftoneVideoSettings = { ...QLOOP_HALFTONE_PRESET, ...settings };

        if (!canvas) {
            return;
        }

        const context = canvas.getContext("2d");
        const sourceCanvas = document.createElement("canvas");
        const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });

        if (!context || !sourceContext) {
            return;
        }

        const video = videoSrc ? document.createElement("video") : null;
        let rafId = 0;
        let reducedMotion = false;
        let lastWidth = 0;
        let lastHeight = 0;
        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updateReducedMotion = () => {
            reducedMotion = motionQuery.matches;
        };

        updateReducedMotion();
        motionQuery.addEventListener("change", updateReducedMotion);

        if (video && videoSrc) {
            video.src = videoSrc;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.autoplay = true;
            video.preload = "auto";
            video.crossOrigin = "anonymous";
            video.play().catch(() => undefined);
        }

        const render = (time: number) => {
            const bounds = canvas.getBoundingClientRect();
            const cssWidth = Math.max(1, Math.floor(bounds.width));
            const cssHeight = Math.max(1, Math.floor(bounds.height));
            const dpr = window.devicePixelRatio || 1;
            const pixelWidth = Math.max(1, Math.floor(cssWidth * dpr));
            const pixelHeight = Math.max(1, Math.floor(cssHeight * dpr));

            if (pixelWidth !== lastWidth || pixelHeight !== lastHeight) {
                canvas.width = pixelWidth;
                canvas.height = pixelHeight;
                lastWidth = pixelWidth;
                lastHeight = pixelHeight;
            }

            const sampleWidth = mergedSettings.sampleWidth;
            const sampleHeight = Math.max(180, Math.round((cssHeight / Math.max(cssWidth, 1)) * sampleWidth));
            sourceCanvas.width = sampleWidth;
            sourceCanvas.height = sampleHeight;

            const pointer = pointerRef.current;
            pointer.x = lerp(pointer.x, pointer.targetX, 0.16);
            pointer.y = lerp(pointer.y, pointer.targetY, 0.16);
            pointer.intensity = lerp(pointer.intensity, pointer.targetIntensity, pointer.targetIntensity > pointer.intensity ? 0.18 : 0.1);

            const motionTime = reducedMotion ? 0 : time * 0.001 * mergedSettings.noiseSpeed;
            drawSourceFrame(sourceContext, video, sampleWidth, sampleHeight, reducedMotion ? 0 : time, reducedMotion, fit);
            const sourceFrame = sourceContext.getImageData(0, 0, sampleWidth, sampleHeight).data;

            const processed = new Float32Array(sampleWidth * sampleHeight);
            const pointerRadius = (mergedSettings.pointerRadiusPx / Math.max(cssWidth, 1)) * sampleWidth;
            const pointerActive = reducedMotion ? 0 : pointer.intensity;

            // Distort sample coordinates before dithering so the dots stay circular while the image flows.
            for (let y = 0; y < sampleHeight; y += 1) {
                for (let x = 0; x < sampleWidth; x += 1) {
                    const normalizedX = x / Math.max(sampleWidth - 1, 1);
                    const normalizedY = y / Math.max(sampleHeight - 1, 1);
                    const noiseX = normalizedX * mergedSettings.noiseScale * 0.085 + motionTime * 0.18;
                    const noiseY = normalizedY * mergedSettings.noiseScale * 0.085;
                    const noiseValue = fbm(noiseX, noiseY);
                    const angle = noiseValue * Math.PI * 2;
                    const noiseAmplitude = reducedMotion ? 0 : mergedSettings.fxStrength * 8;

                    let offsetX = Math.cos(angle) * noiseAmplitude * 0.7 + noiseAmplitude * 0.8;
                    let offsetY = Math.sin(angle) * noiseAmplitude * 0.55;

                    if (pointerActive > 0 && mergedSettings.pointerMode === "push") {
                        const dx = x - pointer.x * sampleWidth;
                        const dy = y - pointer.y * sampleHeight;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < pointerRadius) {
                            const distanceRatio = distance / Math.max(pointerRadius, 1);
                            const influence = (1 - smoothstep(0, 1, distanceRatio)) * pointerActive;
                            const push = mergedSettings.pointerStrength * 0.055 * Math.pow(influence, mergedSettings.pointerSpread);
                            const safeDistance = Math.max(distance, 0.001);
                            offsetX += (dx / safeDistance) * push;
                            offsetY += (dy / safeDistance) * push;
                        }
                    }

                    const sampleX = clamp(Math.round(x + offsetX), 0, sampleWidth - 1);
                    const sampleY = clamp(Math.round(y + offsetY), 0, sampleHeight - 1);
                    const frameIndex = (sampleY * sampleWidth + sampleX) * 4;
                    const red = sourceFrame[frameIndex];
                    const green = sourceFrame[frameIndex + 1];
                    const blue = sourceFrame[frameIndex + 2];
                    const alpha = sourceFrame[frameIndex + 3] / 255;
                    const luminance = ((red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255) * alpha;
                    const adjusted = clamp(((luminance - 0.5) * mergedSettings.contrast) + 0.5 + mergedSettings.brightness, 0, 1);
                    const backgroundNoise = mergedSettings.bgDither > 0 ? (hash2d(x + time * 0.001, y) - 0.5) * mergedSettings.bgDither : 0;

                    processed[y * sampleWidth + x] = clamp(adjusted + backgroundNoise, 0, 1);
                }
            }

            const dithered = atkinsonDither(
                processed,
                sampleWidth,
                sampleHeight,
                mergedSettings.ditherStrength,
                mergedSettings.invertDither
            );

            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            context.clearRect(0, 0, cssWidth, cssHeight);
            drawBackdrop(context, cssWidth, cssHeight);

            const cellSize = clamp(Math.round(cssWidth / 52), 5, 9) * mergedSettings.halftoneScale;
            const columns = Math.max(1, Math.ceil(cssWidth / cellSize));
            const rows = Math.max(1, Math.ceil(cssHeight / cellSize));
            const rotation = mergedSettings.halftoneRotationDeg * (Math.PI / 180);

            context.save();
            context.translate(cssWidth / 2, cssHeight / 2);
            context.rotate(rotation);
            context.translate(-cssWidth / 2, -cssHeight / 2);

            for (let row = 0; row < rows; row += 1) {
                for (let column = 0; column < columns; column += 1) {
                    const sampleX = clamp(Math.floor(((column + 0.5) / columns) * sampleWidth), 0, sampleWidth - 1);
                    const sampleY = clamp(Math.floor(((row + 0.5) / rows) * sampleHeight), 0, sampleHeight - 1);
                    const luminance = dithered[sampleY * sampleWidth + sampleX];

                    if (luminance < 0.05) {
                        continue;
                    }

                    const dotX = column * cellSize + cellSize * 0.5;
                    const dotY = row * cellSize + cellSize * 0.5;
                    const dotRadius = Math.max(0, luminance * cellSize * 0.58);
                    const dotAlpha = clamp(mergedSettings.opacity * luminance, 0, 1);

                    context.fillStyle = `rgba(255,255,255,${dotAlpha})`;
                    context.beginPath();
                    context.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
                    context.fill();
                }
            }

            context.restore();

            rafId = window.requestAnimationFrame(render);
        };

        rafId = window.requestAnimationFrame(render);

        return () => {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
            }

            motionQuery.removeEventListener("change", updateReducedMotion);

            if (video) {
                video.pause();
                video.removeAttribute("src");
                video.load();
            }
        };
    }, [fit, settings, videoSrc]);

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const pointer = pointerRef.current;

        pointer.targetX = clamp((event.clientX - bounds.left) / Math.max(bounds.width, 1), 0, 1);
        pointer.targetY = clamp((event.clientY - bounds.top) / Math.max(bounds.height, 1), 0, 1);
        pointer.targetIntensity = 1;
    };

    const handlePointerLeave = () => {
        pointerRef.current.targetIntensity = 0;
    };

    return (
        <div
            className="relative h-full overflow-hidden rounded-[24px] border border-white/10 bg-black"
            style={{
                boxShadow: "0 24px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.02)",
            }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
        >
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between border-b border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/55">{title}</p>
                    <p className="mt-1 text-xs text-white/80">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
                    Active
                </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-white/10 bg-black/45 px-4 py-3 text-[10px] uppercase tracking-[0.28em] text-white/55 backdrop-blur-md">
                <span>{QLOOP_HALFTONE_PRESET.fxPreset.replace("-", " ")}</span>
                <span>{sourceLabel(videoSrc)}</span>
            </div>
        </div>
    );
}

function sourceLabel(videoSrc?: string) {
    if (!videoSrc) {
        return "Fallback";
    }

    return videoSrc.split("/").pop() ?? "Video";
}
