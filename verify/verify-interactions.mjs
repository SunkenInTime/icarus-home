/**
 * Runtime verification for the homepage taste pass: arrow-tail wiggle,
 * the extras "giving box" (auto-eject, tap-eject, shake-eject, snap-back),
 * and the removed hero caption.
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
    await page.screenshot({ path: `${OUT}09-arrow-hero.png` });

    // 5 · Hero caption is gone.
    const hasCaption = await page.evaluate(() =>
        document.body.innerText.toLowerCase().includes("no staging"),
    );
    report("hero caption removed", !hasCaption, "innerText scan");

    // 2 · Auto-eject on scroll into view.
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

    // 3 · Tap ejects 2 more.
    const box = await page.$("#extras .cursor-grab");
    const bb = await box.boundingBox();
    const cx = bb.x + bb.width / 2;
    const cy = bb.y + bb.height / 2;
    await page.mouse.click(cx, cy);
    await sleep(1200);
    const afterTap = await chipCount();
    await page.screenshot({ path: `${OUT}09-box-tap.png` });
    report("tap ejects 2 more chips", afterTap === afterScroll + 2, `chips: ${afterTap}`);

    // 4 · Shake ejects more; box snaps back.
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
