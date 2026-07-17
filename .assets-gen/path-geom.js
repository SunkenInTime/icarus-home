/* Pull the generated flight-path `d` from the live DOM and rasterize it
 * offline, chunked side-by-side, to eyeball the whole route at once. */
const { execFile } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");
const sharp = require("sharp");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9333;
const URL = "http://localhost:3100/concepts/closer-to-the-sun";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function targets() {
    return new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${PORT}/json`, (res) => {
            let body = "";
            res.on("data", (c) => (body += c));
            res.on("end", () => resolve(JSON.parse(body)));
        }).on("error", reject);
    });
}

(async () => {
    const edge = execFile(EDGE, [
        "--headless=new",
        `--remote-debugging-port=${PORT}`,
        "--window-size=1440,900",
        "--user-data-dir=" + path.join(__dirname, "edge-profile"),
        "about:blank",
    ]);

    let page;
    for (let i = 0; i < 30; i += 1) {
        try {
            page = (await targets()).find((t) => t.type === "page");
            if (page) break;
        } catch {}
        await sleep(500);
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
    await new Promise((r) => ws.on("open", r));
    let id = 0;
    const pending = new Map();
    ws.on("message", (m) => {
        const msg = JSON.parse(m);
        if (msg.id && pending.has(msg.id)) {
            pending.get(msg.id)(msg);
            pending.delete(msg.id);
        }
    });
    const send = (method, params = {}) =>
        new Promise((resolve, reject) => {
            id += 1;
            pending.set(id, (msg) => (msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)));
            ws.send(JSON.stringify({ id, method, params }));
        });

    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
    });
    await send("Page.navigate", { url: URL });
    await sleep(6000);

    const res = await send("Runtime.evaluate", {
        expression: `(() => {
            const svg = document.querySelector('main svg');
            const d = svg.querySelector('path[stroke-dasharray]').getAttribute('d');
            return JSON.stringify({ d, w: +svg.getAttribute('width'), h: +svg.getAttribute('height') });
        })()`,
        returnByValue: true,
    });
    if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails).slice(0, 500));
    const { d, w, h } = JSON.parse(res.result.value);
    console.log(`path: ${d.length} chars, svg ${w}x${h}`);

    // Render just the gutter region, split into 4 side-by-side chunks.
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#0a0a0a"/><path d="${d}" fill="none" stroke="#fafafa" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 10"/></svg>`;
    const full = await sharp(Buffer.from(svgStr)).png().toBuffer();
    const STRIP = 430;
    const chunkH = Math.ceil(h / 4);
    const strips = [];
    for (let i = 0; i < 4; i += 1) {
        strips.push(
            await sharp(full)
                .extract({ left: w - STRIP, top: i * chunkH, width: STRIP, height: Math.min(chunkH, h - i * chunkH) })
                .resize({ height: 1400 })
                .png()
                .toBuffer(),
        );
    }
    const meta = await sharp(strips[0]).metadata();
    await sharp({
        create: { width: (meta.width + 10) * 4, height: 1400, channels: 4, background: "#333" },
    })
        .composite(strips.map((b, i) => ({ input: b, left: i * (meta.width + 10), top: 0 })))
        .png()
        .toFile(path.join(__dirname, "shots", "path-geom.png"));
    console.log("→ shots/path-geom.png");

    ws.close();
    edge.kill();
    process.exit(0);
})();
