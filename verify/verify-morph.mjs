/**
 * Runtime verification for the falling flight path (right gutter + loop),
 * the morphing traveler, and the spread-from-center torchlit extras.
 *
 * Run: node verify/verify-morph.mjs [baseUrl]
 * Screenshots land in verify/ prefixed 11-.
 */

import puppeteer from "puppeteer-core";

const BASE = process.argv[2] ?? "http://localhost:3000";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = new URL(".", import.meta.url).pathname.replace(/^\//, "");
const VW = 1440;
const VH = 900;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];

function report(name, pass, evidence) {
    results.push({ name, pass });
    console.log(`${pass ? "PASS" : "FAIL"} — ${name}${evidence ? ` (${evidence})` : ""}`);
}

const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "new",
    args: [`--window-size=${VW},${VH}`, "--hide-scrollbars"],
    defaultViewport: { width: VW, height: VH },
});

try {
    const page = await browser.newPage();
    await page.goto(BASE, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(800);

    const travelerState = () =>
        page.evaluate(() => {
            const wrap = document.querySelector("main .z-20 > div");
            const svg = wrap?.querySelector("svg");
            const logo = wrap?.querySelector(":scope > div > div");
            const m = /translate3d\(([-\d.]+)px, ([-\d.]+)px.*rotate\(([-\d.]+)deg\)/.exec(
                wrap?.style.transform ?? "",
            );
            return {
                x: Number(m?.[1] ?? NaN),
                y: Number(m?.[2] ?? NaN),
                rot: Number(m?.[3] ?? NaN),
                firstD: svg?.querySelector("path")?.getAttribute("d") ?? "",
                strokesOpacity: svg?.style.opacity || "1",
                logoOpacity: logo?.style.opacity || "0",
            };
        });

    const scrollToSection = async (id) => {
        await page.evaluate((sel) => {
            document.querySelector(sel)?.scrollIntoView({ block: "center" });
        }, id);
        await sleep(900);
    };

    // 1 · Starts as the wing, in the right-hand gutter.
    const atHero = await travelerState();
    report(
        "traveler starts as the Icarus logo",
        Number(atHero.logoOpacity) > 0.95 && Number(atHero.strokesOpacity) < 0.05,
        `logo: ${atHero.logoOpacity}, strokes: ${atHero.strokesOpacity}`,
    );
    report("traveler lives in the right gutter", atHero.x > VW * 0.72, `x: ${atHero.x.toFixed(0)}`);

    // 2 · Loop-the-loop: sample rotations between claims and agent bar and
    // expect the heading to swing past ±120° somewhere.
    const claimsY = await page.evaluate(
        () => document.querySelector("#why").getBoundingClientRect().top + window.scrollY,
    );
    const agentsY = await page.evaluate(
        () => document.querySelector("#agent-bar").getBoundingClientRect().top + window.scrollY,
    );
    let maxAbsRot = 0;
    let gutterOk = true;
    for (let f = 0; f <= 1; f += 0.04) {
        await page.evaluate((y) => window.scrollTo(0, y), claimsY + (agentsY - claimsY) * f);
        await sleep(70);
        const s = await travelerState();
        maxAbsRot = Math.max(maxAbsRot, Math.abs(s.rot));
        if (s.x < VW * 0.7) gutterOk = false;
    }
    report("traveler somersaults through the loop", maxAbsRot > 120, `max |rot|: ${maxAbsRot.toFixed(0)}°`);
    report("path stays in the gutter through the fall", gutterOk);
    await page.screenshot({ path: `${OUT}11-loop.png` });

    // 3 · Morph stages still fire.
    await scrollToSection("#agent-bar");
    const atAgents = await travelerState();
    report(
        "traveler morphs into crosshair at agent bar",
        atAgents.firstD.startsWith("M 32"),
        `d: ${atAgents.firstD.slice(0, 12)}…`,
    );
    await scrollToSection("#local-first");
    const atLocal = await travelerState();
    report(
        "traveler morphs into folder at local-first",
        atLocal.firstD.startsWith("M 8"),
        `d: ${atLocal.firstD.slice(0, 12)}…`,
    );

    // 4 · Logo crossfades in at the sun.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1400);
    const atSun = await travelerState();
    report(
        "traveler resolves into a wing at the sun",
        Number(atSun.logoOpacity) < 0.15 && Number(atSun.strokesOpacity) > 0.85,
        `logo: ${atSun.logoOpacity}, strokes: ${atSun.strokesOpacity}`,
    );
    await page.screenshot({ path: `${OUT}11-morph-logo.png` });

    // 5 · Extras: cards spread from the center, staggered, dim → lit.
    const cardStates = () =>
        page.evaluate(() => {
            const cards = [...document.querySelectorAll("#extras .sticky .absolute.rounded-xl")];
            return cards.map((c) => {
                const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(c.style.transform);
                return {
                    x: Number(m?.[1] ?? NaN),
                    y: Number(m?.[2] ?? NaN),
                    lit: Number(c.style.opacity),
                };
            });
        });
    const meanDist = (cards) =>
        cards.reduce((a, c) => a + Math.hypot(c.x, c.y), 0) / cards.length;

    const extrasTop = await page.evaluate(
        () => document.querySelector("#extras").getBoundingClientRect().top + window.scrollY,
    );
    const extrasH = await page.evaluate(
        () => document.querySelector("#extras").getBoundingClientRect().height,
    );

    await page.evaluate((y) => window.scrollTo(0, y), extrasTop + (extrasH - VH) * 0.05);
    await sleep(600);
    const early = await cardStates();
    await page.screenshot({ path: `${OUT}11-spread-early.png` });

    await page.evaluate((y) => window.scrollTo(0, y), extrasTop + (extrasH - VH) * 0.45);
    await sleep(600);
    const mid = await cardStates();
    await page.screenshot({ path: `${OUT}11-spread-mid.png` });

    await page.evaluate((y) => window.scrollTo(0, y), extrasTop + (extrasH - VH) * 0.98);
    await sleep(600);
    const late = await cardStates();
    await page.screenshot({ path: `${OUT}11-spread-late.png` });

    report(
        "cards start piled at the light",
        meanDist(early) < 60,
        `mean dist early: ${meanDist(early).toFixed(0)}px`,
    );
    report(
        "cards spread outward with scroll",
        meanDist(mid) > meanDist(early) + 80 && meanDist(late) > meanDist(mid) + 80,
        `mean dist: ${meanDist(early).toFixed(0)} -> ${meanDist(mid).toFixed(0)} -> ${meanDist(late).toFixed(0)}`,
    );
    const spreadStagger =
        Math.max(...mid.map((c) => Math.hypot(c.x, c.y))) -
        Math.min(...mid.map((c) => Math.hypot(c.x, c.y)));
    report("departures are staggered", spreadStagger > 100, `mid range: ${spreadStagger.toFixed(0)}px`);
    const avgLateLit = late.reduce((a, c) => a + c.lit, 0) / late.length;
    report(
        "cards end lit",
        Math.min(...early.map((c) => c.lit)) < 0.4 && avgLateLit > 0.9,
        `dimmest early: ${Math.min(...early.map((c) => c.lit)).toFixed(2)}, avg late: ${avgLateLit.toFixed(2)}`,
    );
} finally {
    await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
