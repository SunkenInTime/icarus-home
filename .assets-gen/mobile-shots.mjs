import puppeteer from "puppeteer-core";

const res = await fetch("http://127.0.0.1:9222/json/version");
const { webSocketDebuggerUrl } = await res.json();
const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });

const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
page.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE ERROR:", m.text()); });
await page.goto("http://127.0.0.1:3535/concepts/closer-to-the-sun", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1500));

async function shot(name, sel, extraScroll = 0) {
    await page.evaluate((s, extra) => {
        const el = document.querySelector(s);
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + extra);
    }, sel, extraScroll);
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: `.assets-gen/${name}.png` });
    console.log(name, "done");
}

await shot("m-extras-top", "#extras");
await shot("m-extras-mid", "#extras", 500);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: ".assets-gen/m-sun-bottom.png" });
console.log("m-sun-bottom done");
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - window.innerHeight * 2));
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: ".assets-gen/m-sun-approach.png" });
console.log("m-sun-approach done");

const diag = await page.evaluate(() => {
    const sun = document.querySelector("#the-sun");
    const canvas = sun && sun.querySelector("canvas");
    const gl = canvas && canvas.getContext("webgl");
    return {
        vw: innerWidth, vh: innerHeight, dpr: devicePixelRatio,
        overflowX: document.documentElement.scrollWidth - innerWidth,
        sunH: sun && Math.round(sun.getBoundingClientRect().height),
        canvasCss: canvas && { w: canvas.clientWidth, h: canvas.clientHeight },
        canvasBuf: canvas && { w: canvas.width, h: canvas.height },
        glLost: gl ? gl.isContextLost() : "no-gl",
    };
});
console.log("DIAG:", JSON.stringify(diag));

await page.close();
browser.disconnect();
