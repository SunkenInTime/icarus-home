import puppeteer from "puppeteer-core";

const res = await fetch("http://127.0.0.1:9222/json/version");
const { webSocketDebuggerUrl } = await res.json();
const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto("http://127.0.0.1:3535/concepts/closer-to-the-sun", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1200));

// Walk down in steps so the traveler animates along and we catch it over content.
const stops = [0.12, 0.3, 0.5];
for (let i = 0; i < stops.length; i += 1) {
    await page.evaluate((f) => {
        window.scrollTo(0, (document.body.scrollHeight - innerHeight) * f);
    }, stops[i]);
    await new Promise((r) => setTimeout(r, 1400));
    await page.screenshot({ path: `.assets-gen/flight-${i}.png` });
    console.log(`flight-${i} at ${stops[i]} done`);
}
// Landing at the sun.
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await new Promise((r) => setTimeout(r, 2200));
await page.screenshot({ path: ".assets-gen/flight-landing.png" });
console.log("flight-landing done");

await page.close();
browser.disconnect();
