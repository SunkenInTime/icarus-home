import puppeteer from "puppeteer-core";

const res = await fetch("http://127.0.0.1:9222/json/version");
const { webSocketDebuggerUrl } = await res.json();
const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto("http://127.0.0.1:3535/concepts/closer-to-the-sun", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1200));
await page.evaluate(() => {
    const el = document.querySelector("#extras");
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + innerHeight * 1.3);
});
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: ".assets-gen/extras-desktop.png" });
console.log("done");
await page.close();
browser.disconnect();
