# ASCII Renderer Slice

- Source bundle: `scaped-code.jsx`
- Full prettified bundle: `scratch/scaped-code.pretty.jsx`
- Extracted renderer slice: `scratch/scaped-code.ascii-renderer.jsx`

## Likely pipeline anchors

- Direction and normalization: `_x`, `ru`, `iu`
- Brightness/contrast and clamps: `U`, `Mx`
- Ordered dither helpers: `bp`, `Rx`
- Dot/polygon drawing: `Fm`, `Ax`
- Charset/style selection: `Dx`
- Edge/detail detection: `Ux`
- Color mapping: `Px`, `Bx`, `qm`
- Glow/post treatment: `zx`
- Glyph selection: `Gx`
- Overlay effects: `Vx`

## Notes

This is still production-transpiled code, but the slice is readable enough to trace the render path manually.
