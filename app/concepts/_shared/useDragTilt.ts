"use client";

import { RefObject, useEffect, useRef, useState } from "react";

/**
 * Web port of the app's drag-preview physics
 * (icarus-release/lib/widgets/drag_tilt_feedback.dart).
 *
 * The dragged element hangs from the pointer and swings a few degrees away
 * from the direction of travel, pivoting around its top-center, settling
 * back with an exponential ease when movement stops. No bounce, no
 * overshoot. Tuning constants are the app's own, converted to wall-time so
 * the feel is identical across refresh rates.
 */

// ~3.4 degrees: readable as physical swing without looking cartoonish.
const MAX_TILT = 0.06;
const VELOCITY_TO_TILT = 0.0001;
const BASELINE_FRAME_SECONDS = 1 / 60;
const VELOCITY_DECAY = 0.78;
const ANGLE_DECAY = 0.76;
const RETURN_DECAY = 0.72;

export type DragTiltOptions = {
    /** Element follows the pointer while held. Default true. */
    follow?: boolean;
    /** After release: glide back to rest, or stay where dropped. Default "return". */
    settle?: "return" | "stay";
    disabled?: boolean;
    onDragStart?: (event: PointerEvent) => void;
    onDrag?: (info: { x: number; y: number; event: PointerEvent }) => void;
    onDragEnd?: (info: { x: number; y: number; moved: boolean; event: PointerEvent }) => void;
};

export function useDragTilt<T extends HTMLElement>(
    options: DragTiltOptions = {},
): { ref: RefObject<T | null>; isDragging: boolean } {
    const ref = useRef<T>(null);
    const [isDragging, setIsDragging] = useState(false);
    const optionsRef = useRef(options);

    useEffect(() => {
        optionsRef.current = options;
    });

    useEffect(() => {
        const el = ref.current;
        if (!el || options.disabled) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let raf = 0;
        let dragging = false;
        let settling = false;
        let moved = false;
        let lastTime = 0;
        let pendingDx = 0;
        let velocity = 0;
        let angle = 0;
        let x = 0;
        let y = 0;
        let targetX = 0;
        let targetY = 0;
        let startClientX = 0;
        let startClientY = 0;
        let lastClientX = 0;

        el.style.touchAction = "none";
        const restCursor = el.style.cursor;
        if (!restCursor) el.style.cursor = "grab";

        function apply() {
            el!.style.transformOrigin = "50% 0%";
            el!.style.transform =
                `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${angle.toFixed(4)}rad)`;
        }

        function clearStyles() {
            el!.style.transform = "";
            el!.style.transformOrigin = "";
            el!.style.opacity = "";
            el!.style.zIndex = "";
            el!.style.willChange = "";
        }

        function tick(now: number) {
            raf = 0;
            const rawDt = lastTime ? (now - lastTime) / 1000 : BASELINE_FRAME_SECONDS;
            lastTime = now;
            const dt = Math.min(Math.max(rawDt, 1 / 240), 1 / 15);
            const frameScale = dt / BASELINE_FRAME_SECONDS;

            // Low-pass pointer velocity, then chase the tilt target.
            const velocityAlpha = 1 - Math.pow(VELOCITY_DECAY, frameScale);
            const angleAlpha = 1 - Math.pow(ANGLE_DECAY, frameScale);
            const movementVelocity = pendingDx / dt;
            pendingDx = 0;

            velocity += (movementVelocity - velocity) * velocityAlpha;
            const tiltTarget = reduceMotion
                ? 0
                : Math.max(-MAX_TILT, Math.min(MAX_TILT, velocity * VELOCITY_TO_TILT));
            angle += (tiltTarget - angle) * angleAlpha;

            if (dragging) {
                x = targetX;
                y = targetY;
                apply();
                raf = requestAnimationFrame(tick);
                return;
            }

            if (settling) {
                const returnAlpha = 1 - Math.pow(RETURN_DECAY, frameScale);
                x += (0 - x) * returnAlpha;
                y += (0 - y) * returnAlpha;
                if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5 && Math.abs(angle) < 0.0005) {
                    settling = false;
                    clearStyles();
                    return;
                }
                apply();
                raf = requestAnimationFrame(tick);
                return;
            }

            // "stay" mode: keep position, let the tilt finish settling.
            if (Math.abs(angle) < 0.0005) {
                angle = 0;
                apply();
                return;
            }
            apply();
            raf = requestAnimationFrame(tick);
        }

        function start() {
            lastTime = 0;
            if (!raf) raf = requestAnimationFrame(tick);
        }

        function onPointerDown(event: PointerEvent) {
            if (optionsRef.current.disabled || event.button !== 0) return;
            event.preventDefault();
            el!.setPointerCapture(event.pointerId);
            dragging = true;
            settling = false;
            moved = false;
            // Continue from the current offset if re-grabbed mid-settle.
            startClientX = event.clientX - x;
            startClientY = event.clientY - y;
            lastClientX = event.clientX;
            pendingDx = 0;
            el!.style.cursor = "grabbing";
            el!.style.opacity = "0.95";
            el!.style.zIndex = "50";
            el!.style.willChange = "transform";
            setIsDragging(true);
            optionsRef.current.onDragStart?.(event);
            start();
        }

        function onPointerMove(event: PointerEvent) {
            if (!dragging) return;
            pendingDx += event.clientX - lastClientX;
            lastClientX = event.clientX;
            if (optionsRef.current.follow !== false) {
                targetX = event.clientX - startClientX;
                targetY = event.clientY - startClientY;
            }
            if (!moved && Math.hypot(targetX - x, targetY - y) + Math.abs(pendingDx) > 4) {
                moved = true;
            }
            optionsRef.current.onDrag?.({ x: targetX, y: targetY, event });
        }

        function onPointerUp(event: PointerEvent) {
            if (!dragging) return;
            dragging = false;
            el!.style.cursor = "grab";
            el!.style.opacity = "";
            setIsDragging(false);
            optionsRef.current.onDragEnd?.({ x, y, moved, event });

            if (optionsRef.current.settle !== "stay") {
                if (reduceMotion) {
                    x = 0;
                    y = 0;
                    angle = 0;
                    clearStyles();
                    return;
                }
                settling = true;
            }
            start();
        }

        el.addEventListener("pointerdown", onPointerDown);
        el.addEventListener("pointermove", onPointerMove);
        el.addEventListener("pointerup", onPointerUp);
        el.addEventListener("pointercancel", onPointerUp);

        return () => {
            if (raf) cancelAnimationFrame(raf);
            el.removeEventListener("pointerdown", onPointerDown);
            el.removeEventListener("pointermove", onPointerMove);
            el.removeEventListener("pointerup", onPointerUp);
            el.removeEventListener("pointercancel", onPointerUp);
            clearStyles();
            el.style.cursor = restCursor;
        };
    }, [options.disabled]);

    return { ref, isDragging };
}
