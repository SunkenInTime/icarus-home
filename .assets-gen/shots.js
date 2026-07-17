/* Screenshot the wired sections with headless Edge over CDP. */
const { execFile } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9333;
const URL = "http://localhost:3100/concepts/closer-to-the-sun";
const OUT = path.join(__dirname, "shots");
fs.mkdirSync(OUT, { recursive: true });

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
        '--host-resolver-rules=MAP localhost [::1]',
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
    if (!page) throw new Error("no CDP page target");

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
    await sleep(5000); // load + videos + fonts

    const evaluate = async (expr) => {
        const res = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
        if (res.exceptionDetails) throw new Error(res.exceptionDetails.text + " " + JSON.stringify(res.result));
        return res.result.value;
    };
    console.log("page:", await evaluate("location.href + ' ' + document.readyState"));
    console.log(
        "dom:",
        await evaluate(
            `JSON.stringify({sections: [...document.querySelectorAll('section')].map(s => s.id || '(none)'), bodyLen: document.body.innerHTML.length, err: document.querySelector('nextjs-portal') ? 'nextjs error overlay' : null, body: document.body.innerHTML.slice(0, 300)})`,
        ),
    );

    const spots = await evaluate(`(() => {
        const y = (sel) => document.querySelector(sel).getBoundingClientRect().top + window.scrollY;
        const extras = document.querySelector('#extras');
        return {
            'local-first': y('#local-first') - 120,
            'community': y('#community') - 120,
            'torch': extras.getBoundingClientRect().top + window.scrollY + extras.offsetHeight * 0.45,
            'sun': y('#the-sun') + 60,
        };
    })()`);

    for (const [name, top] of Object.entries(spots)) {
        // Step-scroll so scroll-driven animations get frames to run.
        await evaluate(`window.scrollTo({top: ${Math.max(0, top - 600)}})`);
        await sleep(300);
        await evaluate(`window.scrollTo({top: ${top}})`);
        await sleep(700); // settle, but beat the flight layer's idle fade
        const shot = await send("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(shot.data, "base64"));
        console.log(`${name}.png @ y=${Math.round(top)}`);
    }

    ws.close();
    edge.kill();
    process.exit(0);
})();
