/**
 * Runtime verification for the four hero "cheap wins" and the bigger-swings
 * judging rig: the scaled-up corner sun, the staggered load reveal, the
 * traveler's entrance, the download-hover sun warmth, and the swing toggles.
 *
 * Run: node verify/verify-cheap-wins.mjs [baseUrl]
 * Screenshots land in verify/ prefixed 12-.
 */

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = fileURLToPath(new URL(".", import.meta.url));

const CHROMIUM_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

const executablePath = CHROMIUM_CANDIDATES.find((path) => existsSync(path));
if (!executablePath) {
    console.error("No Chromium build found. Checked:\n" + CHROMIUM_CANDIDATES.join("\n"));
    process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];

function report(name, pass, evidence) {
    results.push({ name, pass, evidence });
    console.log(`${pass ? "PASS" : "FAIL"} — ${name}${evidence ? ` (${evidence})` : ""}`);
}

const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: ["--window-size=1440,900", "--hide-scrollbars", "--enable-unsafe-swiftshader"],
    defaultViewport: { width: 1440, height: 900 },
});

try {
    const page = await browser.newPage();

    // The traveler's y, read straight off the inline transform FlightPath writes.
    const travelerY = () =>
        page.evaluate(() => {
            const wing = [...document.querySelectorAll("div")].find(
                (el) =>
                    el.style.willChange === "transform" &&
                    el.style.transform.includes("translate3d"),
            );
            const match = wing?.style.transform.match(/translate3d\(([-\d.]+)px, ([-\d.]+)px/);
            return match ? Number(match[2]) : null;
        });

    // First load also warms up the CDP round-trip, which otherwise costs enough
    // to miss the front half of a 1.3s entrance.
    await page.goto(BASE, { waitUntil: "networkidle0", timeout: 30000 });
    await travelerY();

    // ── 1 · The sun is large and bleeds off the top-right corner ──────
    await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });

    const travelerYs = [];
    for (let i = 0; i < 110; i += 1) {
        const y = await travelerY();
        if (y !== null) travelerYs.push(y);
        await sleep(25);
    }

    await page.waitForNetworkIdle({ idleTime: 400, timeout: 20000 }).catch(() => {});
    await sleep(600);

    const sun = await page.evaluate(() => {
        const el = document.querySelector("[data-animated-sun]");
        if (!(el instanceof HTMLElement)) return null;
        const rect = el.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            right: rect.right,
            viewportWidth: window.innerWidth,
            opacity: Number(getComputedStyle(el).opacity),
        };
    });
    // Bigger than the 118px original, well short of the 620px first pass.
    report(
        "hero sun sits between invisible and dominant, bled off the corner",
        Boolean(sun) &&
            sun.width >= 200 &&
            sun.width <= 420 &&
            sun.top < 0 &&
            sun.right > sun.viewportWidth,
        `${Math.round(sun?.width)}px, top ${Math.round(sun?.top)}, right ${Math.round(sun?.right)} vs viewport ${sun?.viewportWidth}`,
    );

    const noOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    report("the bled sun does not create horizontal overflow", noOverflow, "scrollWidth vs innerWidth");

    // ── 2 · Load reveal is staggered and settles fully visible ────────
    const reveal = await page.evaluate(() => {
        const words = [...document.querySelectorAll("h1 span.rise-in")];
        const rest = [
            document.querySelector("p.rise-in"),
            document.querySelector("div.rise-in"),
            document.querySelector("div.rise-lift"),
        ];
        if (words.length === 0 || rest.some((node) => !(node instanceof HTMLElement))) {
            return null;
        }
        return {
            words: words.map((node) => parseFloat(getComputedStyle(node).animationDelay) * 1000),
            rest: rest.map((node) => ({
                name: getComputedStyle(node).animationName,
                delay: parseFloat(getComputedStyle(node).animationDelay) * 1000,
                opacity: Number(getComputedStyle(node).opacity),
            })),
            headlineAnimated: document.querySelector("h1")?.classList.contains("rise-in"),
            preEcho: document.querySelector("[data-pre-echo]")?.dataset.preEcho,
            bandHeight: document.querySelector("[data-pre-echo]")?.getBoundingClientRect().height,
            canvases: document.querySelectorAll("section:first-of-type canvas").length,
        };
    });
    const wordDelays = reveal?.words ?? [];
    const restDelays = reveal?.rest.map((entry) => entry.delay) ?? [];
    const wordsRising = wordDelays.every((delay, i) => i === 0 || delay > wordDelays[i - 1]);
    const restRising = restDelays.every((delay, i) => i === 0 || delay > restDelays[i - 1]);
    report(
        "hero reveals in a staggered sequence",
        Boolean(reveal) &&
            reveal.words.length === 6 &&
            wordsRising &&
            restRising &&
            reveal.headlineAnimated === false &&
            reveal.rest.every((entry) => entry.name === "rise" || entry.name === "rise-lift"),
        `words: ${wordDelays.join(", ")}ms; rest: ${restDelays.join(", ")}ms`,
    );
    report(
        "every revealed element settles fully visible",
        Boolean(reveal) && reveal.rest.every((entry) => entry.opacity === 1),
        `opacities: ${reveal?.rest.map((entry) => entry.opacity).join(", ")}`,
    );
    report(
        "production ships the hairline pre-echo at the dialled settings",
        reveal?.preEcho === "hairline" &&
            reveal.canvases === 1 &&
            Math.abs((reveal.bandHeight ?? 0) - 340) < 1,
        `${reveal?.preEcho} ${Math.round(reveal?.bandHeight ?? 0)}px, canvases: ${reveal?.canvases}`,
    );

    // ── 3 · The traveler flies in and settles, without any scrolling ──
    const travelled = travelerYs.length
        ? Math.max(...travelerYs) - Math.min(...travelerYs)
        : 0;
    const tail = travelerYs.slice(-5);
    const settled = tail.length === 5 && Math.max(...tail) - Math.min(...tail) < 1.5;
    report(
        "traveler flies in on load and settles",
        travelled > 120 && settled,
        `travelled ${travelled.toFixed(0)}px over ${travelerYs.length} samples, settled: ${settled}`,
    );
    report(
        "traveler enters from above its resting place",
        travelerYs.length > 2 && travelerYs[0] < travelerYs[travelerYs.length - 1],
        `first ${travelerYs[0]?.toFixed(0)} → last ${travelerYs[travelerYs.length - 1]?.toFixed(0)}`,
    );
    await page.screenshot({ path: `${OUT}12-hero-settled.png` });

    // ── 4 · Hovering the download warms the sun, then it cools ───────
    const buttonBox = await page.evaluate(() => {
        const button = [...document.querySelectorAll("button")].find((el) =>
            el.textContent?.trim().startsWith("Download"),
        );
        if (!button) return null;
        const rect = button.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });
    const sunOpacity = () =>
        page.evaluate(() => {
            const el = document.querySelector("[data-animated-sun]");
            return el instanceof HTMLElement ? Number(getComputedStyle(el).opacity) : null;
        });

    const cold = await sunOpacity();
    await page.mouse.move(buttonBox.x, buttonBox.y);
    await sleep(520);
    const warm = await sunOpacity();
    await page.screenshot({ path: `${OUT}12-hero-warm.png` });
    await page.mouse.move(20, 700);
    await sleep(1500);
    const cooled = await sunOpacity();

    report(
        "download hover warms the sun for a beat",
        warm > cold + 0.05,
        `${cold?.toFixed(3)} → ${warm?.toFixed(3)}`,
    );
    report(
        "the sun cools back down after the beat",
        Math.abs(cooled - cold) < 0.02,
        `settled at ${cooled?.toFixed(3)} (cold was ${cold?.toFixed(3)})`,
    );

    // ── 5 · The bigger-swings rig toggles each swing ─────────────────
    await page.goto(`${BASE}/concepts/bigger-swings`, {
        waitUntil: "networkidle0",
        timeout: 30000,
    });
    await sleep(900);

    const heroCanvases = () =>
        page.evaluate(() => document.querySelectorAll("section:first-of-type canvas").length);
    const sectionOrder = () =>
        page.evaluate(() =>
            [...document.querySelectorAll("main > section")].map((s) => s.id || "hero"),
        );

    const shippedCanvases = await heroCanvases();
    report(
        "the judging rig opens on the shipped pre-echo",
        shippedCanvases === 1,
        `canvases: ${shippedCanvases}`,
    );

    const selectShape = (name) =>
        page.evaluate((want) => {
            const chip = [...document.querySelectorAll("button")].find(
                (button) => button.textContent?.trim() === want,
            );
            chip?.click();
            return Boolean(chip);
        }, name);

    // Each shape moves the same field to a different box.
    const preEchoBox = () =>
        page.evaluate(() => {
            const el = document.querySelector("[data-pre-echo]");
            if (!(el instanceof HTMLElement)) return null;
            const rect = el.getBoundingClientRect();
            return {
                shape: el.dataset.preEcho,
                box: `${Math.round(rect.width)}x${Math.round(rect.height)}@${Math.round(rect.left)},${Math.round(rect.top)}`,
            };
        });

    const shapes = [];
    for (let i = 0; i < 5; i += 1) {
        const seen = await preEchoBox();
        if (seen) shapes.push(seen);
        await page.screenshot({ path: `${OUT}12-shape-${seen?.shape ?? i}.png` });
        await page.keyboard.press("s");
        await sleep(650);
    }
    // vignette and sunward share a box on purpose; only the mask differs.
    report(
        "S cycles the pre-echo through five distinct shapes",
        shapes.length === 5 && new Set(shapes.map((s) => s.shape)).size === 5,
        shapes.map((s) => `${s.shape} ${s.box}`).join(" | "),
    );

    // Five presses returns the cycle to hairline (the shipped shape).
    const shapeState = () =>
        page.evaluate(() => {
            const el = document.querySelector("[data-pre-echo]");
            if (!(el instanceof HTMLElement)) return null;
            return { shape: el.dataset.preEcho, display: getComputedStyle(el).display };
        });

    await selectShape("corona");
    await sleep(500);
    await page.setViewport({ width: 390, height: 844 });
    await sleep(650);
    const narrowCorona = await shapeState();
    report(
        "corona stands down below sm, where the sun it answers is hidden",
        narrowCorona?.shape === "corona" && narrowCorona.display === "none",
        `${narrowCorona?.shape} display: ${narrowCorona?.display}`,
    );

    await page.keyboard.press("s");
    await sleep(400);
    await page.keyboard.press("s");
    await sleep(500);
    const narrowVignette = await shapeState();
    report(
        "the page-motivated shapes still render below sm",
        narrowVignette?.shape === "vignette" && narrowVignette.display !== "none",
        `${narrowVignette?.shape} display: ${narrowVignette?.display}`,
    );

    await page.setViewport({ width: 1440, height: 900 });
    await sleep(500);

    // Land on hairline and confirm the depth dial resizes the band live.
    await selectShape("hairline");
    await sleep(600);
    const dialled = await page.evaluate(async () => {
        const field = () =>
            document.querySelector("[data-pre-echo]")?.getBoundingClientRect().height ?? 0;
        const slider = [...document.querySelectorAll('input[type="range"]')][0];
        if (!(slider instanceof HTMLInputElement)) return null;

        const before = field();
        const setter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value",
        )?.set;
        setter?.call(slider, "220");
        slider.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => requestAnimationFrame(resolve));
        return { shape: document.querySelector("[data-pre-echo]")?.dataset.preEcho, before, after: field() };
    });
    report(
        "the depth dial resizes the hairline band live",
        dialled?.shape === "hairline" && dialled.before === 340 && dialled.after === 220,
        `${dialled?.before}px → ${dialled?.after}px`,
    );

    await page.keyboard.press("0");
    await sleep(400);
    const shippedBand = await page.evaluate(() => {
        const band = document.querySelector("[data-pre-echo]");
        const headline = document.querySelector("h1");
        if (!(band instanceof HTMLElement) || !(headline instanceof HTMLElement)) return null;
        const bandBox = band.getBoundingClientRect();
        const headlineBox = headline.getBoundingClientRect();
        return {
            shape: band.dataset.preEcho,
            height: bandBox.height,
            overlap: bandBox.bottom - headlineBox.top,
        };
    });
    report(
        "shipped hairline is 340px and still overlaps the headline",
        shippedBand?.shape === "hairline" &&
            Math.abs((shippedBand.height ?? 0) - 340) < 1 &&
            shippedBand.overlap > 0,
        `${Math.round(shippedBand?.height ?? 0)}px band, overlap ${Math.round(shippedBand?.overlap ?? 0)}px`,
    );

    await page.keyboard.press("2");
    await sleep(700);
    const withBoth = await heroCanvases();
    await page.screenshot({ path: `${OUT}12-swing-both.png` });
    report("swing 2 stacks the pointer field alongside it", withBoth === 2, `canvases: ${withBoth}`);

    await page.keyboard.press("0");
    await sleep(500);
    const afterReset = await heroCanvases();
    report("0 returns to the shipped pre-echo", afterReset === 1, `canvases: ${afterReset}`);

    const shippedOrder = await sectionOrder();
    await page.keyboard.press("3");
    await sleep(900);
    const reorderedOrder = await sectionOrder();
    await page.screenshot({ path: `${OUT}12-swing-reorder.png` });
    report(
        "swing 3 leads with the agent bar instead of the claims",
        shippedOrder.indexOf("why") < shippedOrder.indexOf("agent-bar") &&
            reorderedOrder.indexOf("agent-bar") < reorderedOrder.indexOf("why"),
        `${shippedOrder.slice(0, 3).join(" → ")}  vs  ${reorderedOrder.slice(0, 3).join(" → ")}`,
    );

    const flightRebuilt = await page.evaluate(() => {
        const path = document.querySelector("svg path[mask]");
        return path instanceof SVGPathElement ? path.getTotalLength() > 100 : false;
    });
    report("the flight path rebuilds after a reorder", flightRebuilt, "path length > 100");

    // ── 6 · Headline treatments ──────────────────────────────────────
    await page.keyboard.press("0");
    await sleep(400);
    const cascade = await page.evaluate(() => {
        const words = [...document.querySelectorAll("h1 span.rise-in")];
        return {
            count: words.length,
            delays: words.map((w) => parseFloat(getComputedStyle(w).animationDelay) * 1000),
            headlineAnimated: document.querySelector("h1")?.classList.contains("rise-in"),
            sentence: document.querySelector("h1")?.textContent?.trim(),
        };
    });
    const rising = cascade.delays.every((d, i) => i === 0 || d > cascade.delays[i - 1]);
    report(
        "word cascade staggers each word and stands the block reveal down",
        cascade.count === 6 && rising && cascade.headlineAnimated === false,
        `${cascade.count} words at ${cascade.delays.join(", ")}ms`,
    );
    report(
        "the headline still reads as one sentence",
        cascade.sentence === "The strategy board that actually flies.",
        `"${cascade.sentence}"`,
    );

    await page.keyboard.press("5");
    await sleep(2200);
    const underline = await page.evaluate(() => {
        const path = document.querySelector("h1 path.draw-stroke");
        if (!(path instanceof SVGPathElement)) return null;
        const style = getComputedStyle(path);
        return {
            name: style.animationName,
            offset: Number(style.strokeDashoffset.replace("px", "")),
            length: path.getTotalLength(),
            width: path.getBoundingClientRect().width,
        };
    });
    report(
        "the underline draws itself under the last word and finishes",
        Boolean(underline) &&
            underline.name === "draw-stroke" &&
            underline.offset === 0 &&
            underline.width > 60,
        `offset ${underline?.offset}, path ${underline?.length.toFixed(0)}px, spans ${underline?.width.toFixed(0)}px`,
    );
    await page.screenshot({ path: `${OUT}12-headline-treatments.png` });

    // ── 7 · Narrow viewports keep the bled sun out of the way ────────
    for (const width of [390, 768]) {
        await page.setViewport({ width, height: 844 });
        await sleep(400);
        const narrow = await page.evaluate(() => ({
            overflows: document.documentElement.scrollWidth > window.innerWidth,
            sunShown: Boolean(
                document.querySelector("[data-animated-sun]") &&
                    getComputedStyle(document.querySelector("[data-animated-sun]")).display !==
                        "none",
            ),
        }));
        report(
            `no horizontal overflow at ${width}px`,
            !narrow.overflows,
            `sun shown: ${narrow.sunShown}`,
        );
    }
    await page.screenshot({ path: `${OUT}12-hero-narrow.png` });

    // ── 8 · Reduced motion stands everything still ───────────────────
    const still = await browser.newPage();
    await still.setViewport({ width: 1440, height: 900 });
    await still.emulateMediaFeatures([
        { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    await still.goto(BASE, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(900);

    const reduced = await still.evaluate(() => {
        const revealed = [...document.querySelectorAll(".rise-in, .rise-lift")];
        const ray = document.querySelector("[data-sun-ray]");
        return {
            revealCount: revealed.length,
            revealsDisabled: revealed.every(
                (el) => getComputedStyle(el).animationName === "none",
            ),
            allVisible: revealed.every((el) => Number(getComputedStyle(el).opacity) === 1),
            raysStill:
                ray instanceof HTMLElement && getComputedStyle(ray).animationName === "none",
            gridKept: Boolean(document.querySelector("section.tactical-dots")),
        };
    });
    report(
        "reduced motion drops the reveal but keeps the content",
        reduced.revealCount === 9 && reduced.revealsDisabled && reduced.allVisible,
        `${reduced.revealCount} elements, animations off: ${reduced.revealsDisabled}, all visible: ${reduced.allVisible}`,
    );
    report(
        "reduced motion stills the sun rays and keeps the dot grid",
        reduced.raysStill && reduced.gridKept,
        `rays still: ${reduced.raysStill}, grid: ${reduced.gridKept}`,
    );
    await still.screenshot({ path: `${OUT}12-hero-reduced-motion.png` });
} finally {
    await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
