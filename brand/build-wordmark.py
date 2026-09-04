from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
import re, sys, os
OUT = os.path.dirname(os.path.abspath(__file__))

font = TTFont(sys.argv[1] if len(sys.argv) > 1 else "Saira.ttf")
inst = instantiateVariableFont(font, {"wdth": 125, "wght": 600})
upm = inst["head"].unitsPerEm
gs = inst.getGlyphSet()
cmap = inst.getBestCmap()
cap = inst["OS/2"].sCapHeight

def glyph(ch):
    name = cmap[ord(ch)]
    g = gs[name]
    pen = SVGPathPen(gs); g.draw(pen)
    bp = BoundsPen(gs); g.draw(bp)
    return {"path": pen.getCommands(), "adv": g.width, "bounds": bp.bounds}

letters = {c: glyph(c) for c in "ICARUS"}
TRACK = round(0.08 * upm)  # 0.08em letter-spacing

# --- mark (from icarus-logo-svg.svg), bbox measured from path data
MARK_PATHS = [
 "M277.01 263.558L223.768 209.558C222.561 208.474 222.227 207.631 221.873 205.958V203.305V200.084C221.873 199.326 223.389 197.242 223.389 197.053C223.389 196.901 226.547 193.2 228.126 191.369L235.136 184.358L241.199 177.537L247.073 167.684L250.863 156.695L252.189 152.905C252.34 151.996 254.399 151.137 255.41 150.821C256.111 150.756 256.521 150.748 257.305 150.821C258.741 150.848 260.087 152.005 260.526 152.337L265.641 158.779L269.81 165.221L275.684 174.316L279.852 181.137L284.02 188.716L288.189 197.053L291.41 207.474L292.736 213.726L293.305 219.032L293.684 225.284V230.59C293.557 233.621 293.305 239.76 293.305 240.063C293.305 240.366 292.673 244.99 292.357 247.263C292.357 248.931 290.084 254.526 288.947 257.116L286.863 260.716C286.863 261.171 285.473 262.548 284.778 263.179C284.273 263.558 282.921 264.392 281.557 264.695C280.193 264.998 277.957 264.063 277.01 263.558Z",
 "M220.891 307.937C213.337 300.426 213.303 288.214 220.814 280.66L230.191 271.23C237.702 263.676 249.914 263.642 257.468 271.153C265.022 278.664 265.056 290.876 257.545 298.43L248.168 307.86C240.657 315.414 228.445 315.448 220.891 307.937Z",
 "M151.2 234.189C141.663 244.231 122.286 264.429 121.074 264.884H115.579L110.842 261.853L105.916 255.032L101.558 243.474L100.421 231.347L101.558 220.358L103.831 210.695L108.947 198.568L115.579 188.905L168.631 129.789L173.179 122.21C174.568 118.547 177.65 110.842 178.863 109.326C180.076 107.81 181.768 95.0526 182.463 88.8631L183.031 80.3368L184.737 76.1684C184.737 74.8421 187.579 72.9473 187.768 72.7579C187.92 72.6063 190.358 72.4421 191.558 72.3789L194.968 75.0315L202.547 82.6105L210.126 90L215.431 96.4421L221.305 104.021L226.231 113.684L229.452 122.21L231.158 130.547L232.105 136.8V147.41L230.779 153.663L228.695 159.158L224.147 167.116L218.463 173.937L210.126 182.463L204.063 188.337C203.684 188.526 203.305 188.716 202.547 188.905H199.516C198.899 188.785 198.645 188.625 198.196 188.341L198.189 188.337L188.716 181.137C187.845 180.452 187.317 180.18 186.252 180H180.568C179.121 180.063 178.47 180.426 177.537 181.516L159.347 201.979C158.21 203.495 156.526 205.388 155.937 206.526C155.395 207.571 154.667 208.797 154.61 210.695V228.884C154.275 230.187 153.63 231.271 151.2 234.189Z",
 "M134.336 274.358L166.547 241.769C168.185 239.756 168.845 238.57 169.199 236.274V217.516L170.336 215.053L171.284 213.158L181.136 202.737C182.308 201.909 183.026 201.666 184.357 201.411H186.252C187.613 201.748 188.389 202.044 189.094 202.737L228.694 242.147C229.386 242.975 229.714 243.472 229.831 244.611V248.969C229.715 250.008 229.438 250.526 228.884 251.432L220.736 259.769L168.252 312.442C167.747 312.695 166.66 313.2 166.357 313.2H163.326C162.315 312.821 160.256 311.987 160.105 311.684C159.953 311.381 142.105 293.621 133.199 284.779C132.757 284.147 131.873 282.657 131.873 281.747V278.147C132.477 276.427 133.063 275.629 134.336 274.358Z",
]
from fontTools.svgLib.path import parse_path
from fontTools.pens.transformPen import TransformPen
_bp = BoundsPen(None)
for p in MARK_PATHS: parse_path(p, _bp)
mx0, my0, mx1, my1 = _bp.bounds
mw, mh = mx1 - mx0, my1 - my0

def mark_path(sx, sy, tx, ty):
    """Return the mark as one path string in font units: x' = tx + (x-mx0)*sx ; y' = ty + (my1-y)*sy (flip: mark is y-down, font is y-up)."""
    pen = SVGPathPen(None)
    tp = TransformPen(pen, (sx, 0, 0, -sy, tx - mx0*sx, ty + my1*sy))
    for p in MARK_PATHS: parse_path(p, tp)
    return pen.getCommands()

def build(kind, mark_fill, fill="#fafafa", mark_scale_y=1.12, widen=1.12):
    """kind: 'lockup' (mark as A) or 'plain'"""
    x = 0
    els = []
    seq = "ICARUS"
    for i, ch in enumerate(seq):
        if ch == "A" and kind == "lockup":
            H = cap * mark_scale_y
            s = H / mh
            W = mw * s * widen
            # side bearings: borrow the real A's
            lsb = letters["A"]["bounds"][0]
            rsb = letters["A"]["adv"] - letters["A"]["bounds"][2]
            # mark box: bottom on baseline, top at cap*scale
            # y flip: font coords y-up; we render in a group with scale(1,-1); mark is y-down, so map mark y -> -(H - (y - my0)*s)
            els.append(f'<path class="mark" fill="{mark_fill}" d="{mark_path(s*widen, s, x + lsb, 0)}"/>')
            x += lsb + W + rsb + TRACK
        else:
            g = letters[ch]
            els.append(f'<path class="letter" transform="translate({x:.2f} 0)" d="{g["path"]}"/>')
            x += g["adv"] + TRACK
    total_w = x - TRACK
    # tight bounds
    pad = 40
    top = cap * (mark_scale_y if kind == "lockup" else 1.0)
    # overshoot for round letters: use max glyph bound
    top = max(top, max(l["bounds"][3] for l in letters.values()))
    bottom = min(l["bounds"][1] for l in letters.values())
    vb_x, vb_y, vb_w, vb_h = -pad, -(top + pad), total_w + 2 * pad, (top - bottom) + 2 * pad
    body = "\n    ".join(els)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb_x:.0f} {vb_y:.0f} {vb_w:.0f} {vb_h:.0f}" fill="{fill}" role="img" aria-label="Icarus">
  <!-- Icarus wordmark. Letters: Saira (OFL) at wdth 125 / wght 600, tracked 0.08em, outlined. Mark = the A, {int(mark_scale_y*100)}% cap height, widened {int((widen-1)*100)}%. For inline use, replace the fills with currentColor. -->
  <g transform="scale(1 -1)">
    {body}
  </g>
</svg>
'''
    return svg, dict(width=vb_w, height=vb_h, total_w=total_w)

files = {
  "icarus-wordmark.svg":          build("lockup", "#fafafa"),
  "icarus-wordmark-violet.svg":   build("lockup", "#7c3aed"),
  "icarus-wordmark-plain.svg":    build("plain",  "#fafafa"),
  "icarus-wordmark-on-light.svg": build("lockup", "#09090b", fill="#09090b"),
  "icarus-wordmark-plain-on-light.svg": build("plain", "#09090b", fill="#09090b"),
}
for name, (svg, m) in files.items():
    open(f"{OUT}/{name}", "w").write(svg)
    print(name, m)
print("upm", upm, "cap", cap, "track", TRACK)
print({c: (l["adv"], l["bounds"]) for c, l in letters.items()})
print("mark bbox", mx0, mx1, my0, my1, "aspect", mw/mh)
