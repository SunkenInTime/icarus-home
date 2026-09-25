# Icarus · design context for Pen

Drop this file (and `brand-sheet.png` next to it) into the Pen agent's context, then ask for the artboard you want: a brand sheet, an Instagram carousel template, a reel cover. Everything below is the product's real design system, taken from the app's theme file and the homepage's token file.

## The product

Icarus is a free, open-source Valorant strategy board. Players, IGLs, and coaches draw plans on maps, place agents and abilities, and keep a library of their tactical work on their own machine.

Homepage headline: "The free VALORANT strategy board." Subline: "Map out executes and share strats your team can follow. Works offline, with no account or paid tier." Claims: Fast, Free, Yours. Section heads: "Agents at your side. Not under your canvas.", "Yours, even offline.", "Built in the open, steered by players." Download section: "Touch the sun."

Feel: a tactical workbench. Dark, dense, map-first. Polish comes from order, not ornament. The map and the tactical objects on it are the hero; the UI is hardware around the bench.

## Palette (Tailwind Zinc + Violet)

- Background `#09090b`. Every artboard starts here. Dark only, no light mode.
- Card / panel `#18181b`. Border and raised chip `#27272a`. Field edge `#3f3f46`.
- Text `#fafafa`. Muted (body on the site) `#a1a1aa`. Dim (small labels) `#71717a`.
- Violet `#7c3aed` for fills and buttons. Deep violet `#4c1d95` for selection and the dark end of the halftone. Lavender `#c4b5fd` for icon tints and the bright end of the halftone.
- Rule: violet is the one command color. One violet element per slide, on the thing the eye should land on. Hover never changes a color and never adds a gradient.
- Ally green `#3a7e5d`, enemy red `#772727`, favorite amber `#ff9800`, destructive `#ef4444`, and the map's ember browns carry game meaning only. Never decoration.

## Type

- Saira, width 125, weight 600, all caps, tracking 0.08em: the wordmark only (use the SVG lockup files rather than retyping).
- Onest 700: headlines and section heads. Headline 40–80px, line-height 1.02, tracking −0.02em. Section heads 28–44px, line-height 1.08, tracking −0.015em.
- Inter 500: body 15.5px / 1.7 in muted `#a1a1aa`; the small label above a heading is 12px, dim `#71717a`, sentence case.
- Geist 400–600: the app's own UI text; use it when mocking up app UI.
- Geist Mono 400: share codes and links only.
- Nothing is set in capitals or letter-spaced except the wordmark and the word VALORANT. One display line, then body.

## Logo

- Mark: the flame-wing, white by default, violet for one hero moment, near-black on the rare light surface. Never outlined, shadowed, gradient-filled, or rotated.
- Wordmark: ICARUS in Saira caps with the mark standing in for the A. Use the plain-A version under about 14px tall; the site uses it at 28px above "Touch the sun."
- Clear space around the lockup: the height of the mark on every side.
- In a corner of a slide the white mark sits at about 40px tall on a 1080-wide artboard.

## Buttons and surfaces

- Site primary button: flat violet, 42px tall, 8px radius, 14px weight 600, white text. No gradient, no shadow, no hover color.
- Site secondary button: transparent, 1px border at white 14%.
- App buttons are "raised": fill lighter at the top, a 1px white-at-14% line inside the top edge, 1px black-at-30% inside the bottom, 1px black shadow beneath. Hover is flat.
- Radii: 4, 6, 8 (controls, buttons, chips), 10, 12 (panels), 16 (cards, frames around app footage), 22 (dialogs).
- Depth is tonal, with 1px `#27272a` borders. Shadows: card foreground `0 4px 12px rgba(0,0,0,0.54)`, menu lift `0 8px 24px rgba(0,0,0,0.28)`.
- App footage sits in a 16px-radius frame with a 1px border at white 10%, on the plain background.

## Textures and motifs

- Backdrop: a dot grid, 1px dots at white 6% on a 16px pitch, over `#09090b`.
- Light is a halftone: a lattice of round dots on a 9px cell where each dot's size and color both follow the light. Radius grows with the square root of intensity; color climbs `#1e0a4a` → `#7c3aed` → `#c4b5fd` → `#f5f3ff`; a second cool field on a silver ramp `#252530` → `#7a7a8a` → `#e8e7f2` drifts through it, so the sun is violet where it burns and silver where it cools. Never one flat purple grain, never a smooth gradient or blur.
- The reference composition is the homepage's last section: inside the sun, a dark radial pool holding the plain wordmark at 28px, "Touch the sun." in Onest 700 at up to 76px, the flat violet Download button, a 10px version line, and the footer links. A comet above at 38%, one feather drifting. This is peak Icarus; make the cover slide and the closing slide feel like it.
- Motifs: six hand-drawn white line-art pieces (comet, feather, paper plane, sun, torch, wing), used faint and off to the side at 6–50% opacity, never as illustration. The myth lives in headlines and the two big visuals; everything else talks about the product.

## Voice

Plain, short, sure of itself. Name the map, the agent, the round. Show the board. Sample lines from the site: "One code hands your five-stack the whole strat." "Fixes ship while the meta is still warm." "For when the pen isn't enough." No "revolutionary", "seamless", "game-changing", no exclamation marks, no emoji in headlines, no capitals for emphasis.

## Artboards we want first

1. Brand sheet, 1600 wide: logo, palette, type, surfaces, motifs, voice.
2. Instagram carousel template, 1080 × 1350: cover slide, feature slide with a board screenshot in the site's 16px frame, closing slide with the lockup and icarusstrats.com.
3. Reel cover, 1080 × 1920: the board fills the frame, copy on a `#18181b` panel at the bottom.
