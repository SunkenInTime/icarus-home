/**
 * Chroma-key the generated purple-background assets to transparent PNGs.
 * The background is flat, so: sample it from the corners, turn each pixel's
 * max-channel distance from it into alpha, then unmix (pixel = a*fg +
 * (1-a)*bg) so anti-aliased stroke edges keep no purple spill.
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const RAW = path.join(__dirname, "raw");
const OUT = path.join(__dirname, "..", "public", "assets");
fs.mkdirSync(OUT, { recursive: true });

const TOE = 0.07; // alpha below this is background noise → fully transparent

async function key(file) {
    const { data, info } = await sharp(path.join(RAW, file))
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;

    const px = (x, y) => {
        const i = (y * width + x) * channels;
        return [data[i], data[i + 1], data[i + 2]];
    };
    const corners = [px(2, 2), px(width - 3, 2), px(2, height - 3), px(width - 3, height - 3)];
    const bg = [0, 1, 2].map((c) => Math.round(corners.reduce((s, p) => s + p[c], 0) / 4));
    // Normalize by the bg↔white distance so a full stroke pixel hits alpha 1.
    const denom = Math.max(...bg.map((v) => Math.abs(250 - v)), 1);

    const out = Buffer.alloc(width * height * 4);
    for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
        const d = Math.max(
            Math.abs(data[i] - bg[0]),
            Math.abs(data[i + 1] - bg[1]),
            Math.abs(data[i + 2] - bg[2]),
        );
        let a = Math.min(1, d / denom);
        a = a <= TOE ? 0 : (a - TOE) / (1 - TOE);
        if (a === 0) continue;
        for (let c = 0; c < 3; c += 1) {
            const v = (data[i + c] - (1 - a) * bg[c]) / a;
            out[o + c] = Math.max(0, Math.min(255, Math.round(v)));
        }
        out[o + 3] = Math.round(a * 255);
    }

    await sharp(out, { raw: { width, height, channels: 4 } })
        .png()
        .toFile(path.join(OUT, file));
    console.log(`${file}: keyed bg rgb(${bg.join(",")})`);
}

(async () => {
    const files = fs.readdirSync(RAW).filter((f) => f.endsWith(".png"));
    if (!files.length) throw new Error("no raw pngs found");
    for (const f of files) await key(f);
    console.log(`done → ${OUT}`);
})();
