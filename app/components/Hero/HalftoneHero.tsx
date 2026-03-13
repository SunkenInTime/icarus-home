"use client";

import { useEffect, useRef } from "react";

type HalftoneHeroProps = {
    videoSrc?: string;
    fit?: "contain" | "cover";
    className?: string;
};

type Direction =
    | "up"
    | "down"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

type DirectionProjection = {
    dx: number;
    dy: number;
    perpX: number;
    perpY: number;
    primaryMin: number;
    primarySpan: number;
    secondaryMin: number;
    secondarySpan: number;
};

const DEFAULT_SAMPLE_WIDTH = 420;
const MIN_SAMPLE_HEIGHT = 220;
const DEFAULT_CONTRAST = 1.02;
const DEFAULT_BRIGHTNESS = 0;
const DEFAULT_OVERLAY_STRENGTH = 0.4;
const DEFAULT_NOISE_SCALE = 24;
const DEFAULT_NOISE_SPEED = 1;
const DEFAULT_NOISE_DIRECTION: Direction = "up";
const DEFAULT_HALFTONE_SIZE = 1;

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
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
        return;
    }

    drawFallbackFrame(sourceContext, width, height, time, reducedMotion);
}

function getDirectionVector(direction: Direction) {
    switch (direction) {
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
        case "right":
        default:
            return { dx: 1, dy: 0 };
    }
}

function getDirectionProjection(direction: Direction): DirectionProjection {
    const { dx, dy } = getDirectionVector(direction);
    const perpX = -dy;
    const perpY = dx;
    const primaryMin = (dx < 0 ? dx : 0) + (dy < 0 ? dy : 0);
    const primaryMax = (dx > 0 ? dx : 0) + (dy > 0 ? dy : 0);
    const secondaryMin = (perpX < 0 ? perpX : 0) + (perpY < 0 ? perpY : 0);
    const secondaryMax = (perpX > 0 ? perpX : 0) + (perpY > 0 ? perpY : 0);

    return {
        dx,
        dy,
        perpX,
        perpY,
        primaryMin,
        primarySpan: Math.max(0.0001, primaryMax - primaryMin),
        secondaryMin,
        secondarySpan: Math.max(0.0001, secondaryMax - secondaryMin),
    };
}

function projectDirection(x: number, y: number, cols: number, rows: number, projection: DirectionProjection) {
    const xNorm = x / Math.max(cols - 1, 1);
    const yNorm = y / Math.max(rows - 1, 1);
    const primaryRaw = xNorm * projection.dx + yNorm * projection.dy;
    const secondaryRaw = xNorm * projection.perpX + yNorm * projection.perpY;
    const primaryNorm = clamp((primaryRaw - projection.primaryMin) / projection.primarySpan, 0, 1);
    const secondaryNorm = clamp((secondaryRaw - projection.secondaryMin) / projection.secondarySpan, 0, 1);

    return { primaryNorm, secondaryNorm };
}

export default function HalftoneHero({
    videoSrc,
    fit = "contain",
    className,
}: HalftoneHeroProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

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
        let lastSampleWidth = 0;
        let lastSampleHeight = 0;
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

            const sampleWidth = DEFAULT_SAMPLE_WIDTH;
            const sampleHeight = Math.max(MIN_SAMPLE_HEIGHT, Math.round((cssHeight / Math.max(cssWidth, 1)) * sampleWidth));

            if (sampleWidth !== lastSampleWidth || sampleHeight !== lastSampleHeight) {
                sourceCanvas.width = sampleWidth;
                sourceCanvas.height = sampleHeight;
                lastSampleWidth = sampleWidth;
                lastSampleHeight = sampleHeight;
            }

            drawSourceFrame(sourceContext, video, sampleWidth, sampleHeight, reducedMotion ? 0 : time, reducedMotion, fit);

            const sourceFrame = sourceContext.getImageData(0, 0, sampleWidth, sampleHeight).data;
            const cellSize = clamp(Math.round(cssWidth / 64), 4, 8);
            const cols = Math.max(1, Math.ceil(cssWidth / cellSize));
            const rows = Math.max(1, Math.ceil(cssHeight / cellSize));
            const cellWidth = cssWidth / cols;
            const cellHeight = cssHeight / rows;
            const overlayTimeSeconds = reducedMotion ? 0 : time * 0.001;
            const scale = clamp(DEFAULT_NOISE_SCALE, 4, 120);
            const speed = clamp(DEFAULT_NOISE_SPEED, 0, 4);
            const strength = clamp(DEFAULT_OVERLAY_STRENGTH, 0, 1);
            const projection = getDirectionProjection(DEFAULT_NOISE_DIRECTION);
            const flowSpan = Math.max(cols, rows);
            const maxRadius = Math.max(0.1, Math.min(cellWidth, cellHeight) * 0.5);

            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            context.clearRect(0, 0, cssWidth, cssHeight);

            for (let y = 0; y < rows; y += 1) {
                for (let x = 0; x < cols; x += 1) {
                    const sampleX = clamp(Math.floor(((x + 0.5) / cols) * sampleWidth), 0, sampleWidth - 1);
                    const sampleY = clamp(Math.floor(((y + 0.5) / rows) * sampleHeight), 0, sampleHeight - 1);
                    const frameIndex = (sampleY * sampleWidth + sampleX) * 4;
                    const red = sourceFrame[frameIndex];
                    const green = sourceFrame[frameIndex + 1];
                    const blue = sourceFrame[frameIndex + 2];
                    const alpha = sourceFrame[frameIndex + 3] / 255;

                    if (alpha <= 0) {
                        continue;
                    }

                    const gray = ((red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255) * 255;
                    const mappedGray = clamp((gray - 128) * DEFAULT_CONTRAST + 128 + DEFAULT_BRIGHTNESS * 2, 0, 255);
                    const { primaryNorm, secondaryNorm } = projectDirection(x, y, cols, rows, projection);
                    const phase = overlayTimeSeconds * speed * 2.4;
                    const axisPrimary = (primaryNorm * flowSpan + 17.3) / scale;
                    const axisSecondary = (secondaryNorm * flowSpan - 9.7) / scale;
                    const wave = Math.sin(axisPrimary + phase) * Math.cos(axisSecondary - phase * 0.73);
                    const grain = Math.sin(primaryNorm * flowSpan * 1.37 + secondaryNorm * flowSpan * 2.11 + phase * 6.2);
                    const overlayDelta = (wave * 0.65 + grain * 0.35) * (16 + strength * 72);
                    const overlaidGray = clamp(mappedGray + overlayDelta, 0, 255);
                    const normalized = overlaidGray / 255;
                    const screen =
                        (Math.sin((x * 0.82 + y * 0.33) * 1.55) + Math.cos((x * 0.27 - y * 0.94) * 1.25) + 2) * 0.25;
                    const dotLevel = clamp(Math.pow(normalized, 0.92) * 0.82 + screen * 0.18, 0, 1);
                    const radius = maxRadius * dotLevel * DEFAULT_HALFTONE_SIZE;

                    if (radius < 0.35) {
                        continue;
                    }

                    const centerX = x * cellWidth + cellWidth * 0.5;
                    const centerY = y * cellHeight + cellHeight * 0.5;

                    context.fillStyle = alpha >= 0.999 ? `rgb(${red}, ${green}, ${blue})` : `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                    context.beginPath();
                    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    context.fill();
                }
            }

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
    }, [fit, videoSrc]);

    return (
        <div className={["relative h-full overflow-hidden rounded-[24px]", className].filter(Boolean).join(" ")}>
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
        </div>
    );
}
