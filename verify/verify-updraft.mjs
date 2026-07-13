/**
 * Runtime verification for the updraft extras section: chips stream upward
 * on their own, the column keeps flowing, and clicking releases a burst.
 *
 * Run: node verify/verify-updraft.mjs [baseUrl]
 * Screenshots land in verify/ prefixed 10-.
 */

import puppeteer from "puppeteer-core";

const BASE = process.argv[2] ?? "http://localhost:3000";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = new URL(".", import.meta.url).pathname.replace(/^\//, "");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];

function report(name, pass, evidence) {
    results.push({ name, pass });
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

    const chipStates = () =>
        page.evaluate(() =>
            [...document.querySelectorAll("#extras .pointer-events-none.absolute.left-0")].map(
                (el) => ({
                    transform: el.style.transform,
                    y: Number(/translate3d\([^,]+, ([-\d.]+)px/.exec(el.style.transform)?.[1] ?? NaN),
                }),
            ),
        );

    // 1 · Chips flow without interaction once in view.
    await page.evaluate(() => {
        document.querySelector("#extras")?.scrollIntoView({ block: "center" });
    });
    await sleep(2200);
    const a = await chipStates();
    await page.screenshot({ path: `${OUT}10-updraft-flowing.png` });
    report("chips appear without interaction", a.length >= 4, `chips: ${a.length}`);

    // 2 · The stream rises: same-index chips are higher a moment later.
    await sleep(1500);
    const b = await chipStates();
    const rising = a.length > 0 && b.length > 0 && b[0].y < a[0].y;
    report("chips rise over time", rising, `first chip y: ${a[0]?.y?.toFixed(0)} -> ${b[0]?.y?.toFixed(0)}`);

    // 3 · The stream keeps giving: still flowing much later, count sane.
    await sleep(4000);
    const c = await chipStates();
    await page.screenshot({ path: `${OUT}10-updraft-later.png` });
    report(
        "stream keeps flowing and stays capped",
        c.length >= 4 && c.length <= 22,
        `chips: ${c.length}`,
    );

    // 4 · Click releases a burst from the base.
    const box = await (await page.$("#extras")).boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.6);
    await sleep(500);
    const d = await chipStates();
    await page.screenshot({ path: `${OUT}10-updraft-burst.png` });
    report("click releases a burst", d.length > c.length, `chips: ${c.length} -> ${d.length}`);
} finally {
    await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
