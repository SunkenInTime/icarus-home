"use client";

import { useSyncExternalStore } from "react";

/**
 * prefers-reduced-motion, safe to branch *markup* on.
 *
 * framer's useReducedMotion reports null until after mount, so a className or
 * a whole subtree chosen from it renders one way on the server and another on
 * the client — a hydration mismatch. useSyncExternalStore hands the server a
 * defined snapshot and re-renders once the client can read the real query.
 *
 * For animation props (framer `animate`, transitions) framer's hook is fine;
 * reach for this one when the answer changes what is in the DOM.
 */

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
    const list = window.matchMedia(QUERY);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
}

function getSnapshot() {
    return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
    return false;
}

export function usePrefersReducedMotion(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
