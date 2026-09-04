# Icarus wordmark

Decided 2026-09-03. All caps, Saira at width 125 / weight 600, tracked 0.08em, letters outlined.
The mark stands in for the A at 112% of cap height, widened 12% to sit with the wide letters.

| file | use |
| --- | --- |
| `icarus-wordmark.svg` | primary lockup, white, for dark surfaces |
| `icarus-wordmark-violet.svg` | lockup with violet mark; hero and splash moments only |
| `icarus-wordmark-plain.svg` | plain caps with a real A; use below ~14px (title bar, tooltips) |
| `icarus-wordmark-on-light.svg`, `icarus-wordmark-plain-on-light.svg` | same, near-black for light surfaces |
| `preview.html` | open in a browser to see all variants and a size ladder |

Fills are baked in so the files work in `<img>`. For inline SVG, swap the fills to `currentColor`.

## Regenerate

```
python3 -m venv .venv && .venv/bin/pip install fonttools
curl -L -o Saira.ttf "https://github.com/google/fonts/raw/main/ofl/saira/Saira%5Bwdth%2Cwght%5D.ttf"
.venv/bin/python build-wordmark.py Saira.ttf
```

Tuning knobs are the `build(...)` arguments in `build-wordmark.py`: `mark_scale_y` (mark height as a
multiple of cap height), `widen` (horizontal stretch), and `TRACK` (letter-spacing in font units).

Saira is licensed under the SIL Open Font License; outlining glyphs for a logotype is permitted.
