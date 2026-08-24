/**
 * Runtime verification for the homepage taste pass: arrow-tail wiggle,
 * hand-drawn hero-sun motion, the extras "giving box" (auto-eject, tap-eject,
 * shake-eject, snap-back), and the removed hero caption.
 *
 * Run: node verify/verify-interactions.mjs [baseUrl]
 * Screenshots land in verify/ prefixed 09-.
 */

import puppeteer from "puppeteer-core";

const BASE = process.argv[2] ?? "http://localhost:3000";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = new URL(".", import.meta.url).pathname.replace(/^\//, "");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];

function report(name, pass, evidence) {
    results.push({ name, pass, evidence });
    console.log(`${pass ? "PASS" : "FAIL"} — ${name}${evidence ? ` (${evidence})` : ""}`);
}

const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "new",
    args: ["--window-size=1440,900", "--hide-scrollbars"],
    defaultViewport: { width: 1440, height: 900 },
});

try {
    const page = await browser.newPage();
    await page.goto(BASE, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(1000);

    // 1 · Arrow tail wiggles, head planted.
    const getTailD = () =>
        page.evaluate(() => {
            const p = document.querySelector('svg[viewBox="0 0 18 46"] path');
            return p?.getAttribute("d");
        });
    const dA = await getTailD();
    await sleep(1300);
    const dB = await getTailD();
    const tailPath = dA;
    const headPlanted = dA?.trim().endsWith("9 41") && dB?.trim().endsWith("9 41");
    report(
        "arrow tail wiggles while head stays planted",
        Boolean(tailPath && dA && dB && dA !== dB && headPlanted),
        `d changed: ${dA !== dB}, head anchored: ${headPlanted}`,
    );

    await page.setViewport({ width: 414, height: 535 });
    await sleep(100);
    const mobileHint = await page.evaluate(() => {
        const hint = document.querySelector('svg[viewBox="0 0 20 100"]')?.parentElement;
        const board = document.querySelector('img[alt^="The Icarus strategy board"]')
            ?.parentElement;
        if (!(hint instanceof HTMLElement) || !(board instanceof HTMLElement)) return null;

        const hintRect = hint.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();
        return {
            gap: hintRect.top - boardRect.bottom,
            centered: Math.abs(hintRect.left + hintRect.width / 2 - window.innerWidth / 2) < 0.5,
            position: getComputedStyle(hint).position,
        };
    });
    report(
        "mobile scroll hint starts below the board",
        mobileHint?.position === "static" && mobileHint.centered && Math.abs(mobileHint.gap - 28) < 0.5,
        `gap: ${mobileHint?.gap.toFixed(1)}px, centered: ${mobileHint?.centered}`,
    );
    await page.setViewport({ width: 1440, height: 900 });
    await sleep(100);
    const desktopHint = await page.evaluate(() => {
        const hint = document.querySelector('svg[viewBox="0 0 20 100"]')?.parentElement;
        const board = document.querySelector('img[alt^="The Icarus strategy board"]')
            ?.parentElement;
        if (!(hint instanceof HTMLElement) || !(board instanceof HTMLElement)) return null;

        const hintRect = hint.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();
        return {
            gap: hintRect.top - boardRect.bottom,
            centered: Math.abs(hintRect.left + hintRect.width / 2 - window.innerWidth / 2) < 0.5,
            position: getComputedStyle(hint).position,
        };
    });
    report(
        "desktop scroll hint starts below the board",
        desktopHint?.position === "static" &&
            desktopHint.centered &&
            Math.abs(desktopHint.gap - 28) < 0.5,
        `gap: ${desktopHint?.gap.toFixed(1)}px, centered: ${desktopHint?.centered}`,
    );

    // 2 · The original sun is split into one circle and fourteen moving rays.
    const sunState = () =>
        page.evaluate(() => {
            const circle = document.querySelector("[data-sun-circle]");
            const rays = [...document.querySelectorAll("[data-sun-ray]")];
            const firstRayStyle =
                rays[0] instanceof HTMLElement ? getComputedStyle(rays[0]) : null;
            const matrix = firstRayStyle ? new DOMMatrix(firstRayStyle.transform) : null;
            const delays = rays.map((ray) => getComputedStyle(ray).animationDelay);
            const sequences = rays.map((ray) =>
                Array.from({ length: 6 }, (_, frame) =>
                    ray instanceof HTMLElement
                        ? ray.style.getPropertyValue(`--ray-s-${frame}`)
                        : "",
                ).join(","),
            );
            const scaleRanges = sequences.map((sequence) => {
                const scales = sequence.split(",").map(Number);
                return Math.max(...scales) - Math.min(...scales);
            });
            return {
                rays: rays.map((ray) => getComputedStyle(ray).transform),
                rayCount: rays.length,
                independentlyTimed: new Set(delays).size === rays.length,
                uniqueSequences: new Set(sequences).size === rays.length,
                minimumScaleRange: Math.min(...scaleRanges),
                stepped: firstRayStyle?.animationTimingFunction.includes("steps(1") ?? false,
                lengthOnly:
                    firstRayStyle?.animationName === "sun-ray-length-redraw" &&
                    matrix !== null &&
                    Math.abs(matrix.b) < 0.0001 &&
                    Math.abs(matrix.c) < 0.0001 &&
                    Math.abs(matrix.a - matrix.d) < 0.0001,
                circleStatic:
                    circle instanceof HTMLElement &&
                    getComputedStyle(circle).animationName === "none",
                usesOriginal:
                    circle instanceof HTMLElement &&
                    getComputedStyle(circle).backgroundImage.includes("sun.png"),
            };
        });
    const sunA = await sunState();
    await sleep(100);
    const sunB = await sunState();
    const onTwos = await page.evaluate(() => {
        const ray = document.querySelector("[data-sun-ray]");
        const animation = ray?.getAnimations()[0];
        if (!(ray instanceof HTMLElement) || !animation) {
            return { held: false, advanced: false };
        }

        animation.pause();
        animation.currentTime = 10;
        const frameOneEarly = getComputedStyle(ray).transform;
        animation.currentTime = 70;
        const frameOneLate = getComputedStyle(ray).transform;
        animation.currentTime = 90;
        const frameTwo = getComputedStyle(ray).transform;
        animation.play();

        return {
            held: frameOneEarly === frameOneLate,
            advanced: frameOneLate !== frameTwo,
        };
    });
    report(
        "original hero sun is preserved",
        sunA.usesOriginal && sunA.rayCount === 14 && sunA.stepped && sunA.circleStatic,
        `asset: sun.png, rays: ${sunA.rayCount}, stepped: ${sunA.stepped}, circle static: ${sunA.circleStatic}`,
    );
    report(
        "ray drawings are held on twos",
        onTwos.held && onTwos.advanced,
        `held through 70ms: ${onTwos.held}, changed after 83ms: ${onTwos.advanced}`,
    );
    report(
        "hero sun rays change length without rotating",
        sunA.lengthOnly && sunA.rays.some((ray, index) => ray !== sunB.rays[index]),
        `length only: ${sunA.lengthOnly}, rays changed: ${sunA.rays.some((ray, index) => ray !== sunB.rays[index])}`,
    );
    report(
        "hero sun rays vary independently",
        sunA.independentlyTimed && sunA.uniqueSequences && sunA.minimumScaleRange >= 0.169,
        `unique phases: ${sunA.independentlyTimed}, unique length sequences: ${sunA.uniqueSequences}, minimum scale range: ${sunA.minimumScaleRange.toFixed(3)}`,
    );
    await page.screenshot({ path: `${OUT}09-arrow-hero.png` });

    // 3 · Hero caption is gone.
    const hasCaption = await page.evaluate(() =>
        document.body.innerText.toLowerCase().includes("no staging"),
    );
    report("hero caption removed", !hasCaption, "innerText scan");

    // 4 · Auto-eject on scroll into view.
    const chipCount = () =>
        page.evaluate(
            () => document.querySelectorAll("#extras .pointer-events-none.absolute").length,
        );
    await page.evaluate(() => {
        document.querySelector("#extras")?.scrollIntoView({ block: "center" });
    });
    await sleep(2600);
    const afterScroll = await chipCount();
    await page.screenshot({ path: `${OUT}09-box-autoeject.png` });
    report("3 chips auto-eject when box scrolls into view", afterScroll === 3, `chips: ${afterScroll}`);

    // 5 · Tap ejects 2 more.
    const box = await page.$("#extras .cursor-grab");
    const bb = await box.boundingBox();
    const cx = bb.x + bb.width / 2;
    const cy = bb.y + bb.height / 2;
    await page.mouse.click(cx, cy);
    await sleep(1200);
    const afterTap = await chipCount();
    await page.screenshot({ path: `${OUT}09-box-tap.png` });
    report("tap ejects 2 more chips", afterTap === afterScroll + 2, `chips: ${afterTap}`);

    // 6 · Shake ejects more; box snaps back.
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    for (let i = 0; i < 14; i += 1) {
        await page.mouse.move(cx + (i % 2 === 0 ? 130 : -130), cy + (i % 3 === 0 ? 40 : -40), {
            steps: 2,
        });
        await sleep(30);
    }
    await page.mouse.move(cx, cy, { steps: 2 });
    await page.mouse.up();
    await sleep(1400);
    const afterShake = await chipCount();
    const bbAfter = await box.boundingBox();
    const snappedBack =
        Math.abs(bbAfter.x - bb.x) < 8 && Math.abs(bbAfter.y - bb.y) < 8;
    await page.screenshot({ path: `${OUT}09-box-shake.png` });
    report("shaking ejects more chips", afterShake > afterTap, `chips: ${afterTap} -> ${afterShake}`);
    report("box springs back to origin after shake", snappedBack, `dx=${(bbAfter.x - bb.x).toFixed(1)}, dy=${(bbAfter.y - bb.y).toFixed(1)}`);
} finally {
    await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
