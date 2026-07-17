import puppeteer from "puppeteer-core";

const res = await fetch("http://127.0.0.1:9222/json/version");
const { webSocketDebuggerUrl } = await res.json();
const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });

async function sunShot(name, vp) {
    const page = await browser.newPage();
    await page.setViewport(vp);
    await page.goto("http://127.0.0.1:3535/concepts/closer-to-the-sun", { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: `.assets-gen/${name}.png` });
    console.log(name, "done");
    await page.close();
}

await sunShot("sun-desktop", { width: 1440, height: 900, deviceScaleFactor: 1 });
await sunShot("sun-mobile", { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

browser.disconnect();
