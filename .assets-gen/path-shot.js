/* Capture the full static flight path (reduced-motion) and lay the right-side
 * strip out as side-by-side chunks so the whole route is readable at once. */
const { execFile } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");
const sharp = require("sharp");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9333;
const URL = "http://localhost:3100/concepts/closer-to-the-sun";
const W = 1440;

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
        `--window-size=${W},900`,
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
    if (!page) throw new Error("no CDP page target");

    const ws = new WebSocket(page.webSocketDebuggerUrl, { maxPayload: 256 * 1024 * 1024 });
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
    await send("Runtime.enable");
    ws.on("message", (m) => {
        const msg = JSON.parse(m);
        if (msg.method === "Runtime.exceptionThrown")
            console.log("EXC:", JSON.stringify(msg.params.exceptionDetails).slice(0, 800));
        if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error")
            console.log(
                "ERR:",
                msg.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 600),
            );
    });
    await send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    await send("Emulation.setDeviceMetricsOverride", {
        width: W,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
    });
    await send("Page.navigate", { url: URL });
    await sleep(6000);

    const evalJs = async (expr) => {
        const res = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
        if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
        return res.result.value;
    };
    // Drop the dev overlay (pre-existing reduced-motion hydration warning).
    await evalJs("document.querySelectorAll('nextjs-portal').forEach(e => e.remove()); 1");
    await sleep(500);
    console.log(
        await evalJs(
            `JSON.stringify({doc: document.documentElement.scrollHeight, body: document.body.scrollHeight, main: document.querySelector('main')?.scrollHeight, sections: [...document.querySelectorAll('section')].map(s => s.offsetHeight)})`,
        ),
    );
    const docH = await evalJs("document.documentElement.scrollHeight");
    await send("Emulation.setDeviceMetricsOverride", {
        width: W,
        height: Math.min(docH, 9000),
        deviceScaleFactor: 1,
        mobile: false,
    });
    await sleep(2500); // rebuild after resize
    const shot = await send("Page.captureScreenshot", { format: "png" });
    const full = Buffer.from(shot.data, "base64");
    fs.writeFileSync(path.join(__dirname, "shots", "path-full.png"), full);

    // Right-side strip where the path lives, in 4 side-by-side chunks.
    const STRIP = 420;
    const H = Math.min(docH, 9000);
    const chunkH = Math.ceil(H / 4);
    const strips = [];
    for (let i = 0; i < 4; i += 1) {
        strips.push(
            await sharp(full)
                .extract({
                    left: W - STRIP,
                    top: i * chunkH,
                    width: STRIP,
                    height: Math.min(chunkH, H - i * chunkH),
                })
                .png()
                .toBuffer(),
        );
    }
    await sharp({
        create: { width: (STRIP + 12) * 4, height: chunkH, channels: 4, background: "#222" },
    })
        .composite(strips.map((b, i) => ({ input: b, left: i * (STRIP + 12), top: 0 })))
        .png()
        .toFile(path.join(__dirname, "shots", "path-strips.png"));
    console.log(`docH=${docH} → path-strips.png`);

    ws.close();
    edge.kill();
    process.exit(0);
})();
