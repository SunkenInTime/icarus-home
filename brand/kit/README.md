# Icarus brand kit

Everything needed to make Icarus posts, carousels, and reels that look like the app and the website. Assembled 2026-09-25 from the two sources the product actually ships from: the app's theme file and the homepage's token file. Nothing here is invented; where the app and the site differ, both are stated.

Open `brand-sheet/brand-sheet.html` in a browser for the one-page visual version of this document.

## What Icarus is

Icarus is a free, open-source Valorant strategy board. Players, IGLs, and coaches draw plans on maps, place agents and abilities, and keep a library of their tactical work on their own machine.

How the homepage says it:

- Headline: **The free VALORANT strategy board.**
- Under it: **Map out executes and share strats your team can follow. Works offline, with no account or paid tier.**
- The three claims: **Fast** (native desktop, 60fps canvas), **Free** (MIT-licensed, no accounts, no premium tier), **Yours** (local-first, your playbook lives on your machine).
- Section heads: "Agents at your side. Not under your canvas.", "Yours, even offline.", "Built in the open, steered by players."
- The download section: "Touch the sun." After the download: "Your wings. Your machine. Fly."
- Footer: "MIT, all the way down".

The feel is a tactical workbench: dark, dense, map-first. Polish comes from order, not ornament. The map and the tactical objects on it are the hero; everything else is hardware around the bench.

## Logo

`logo/mark/` is the logomark alone: the flame-wing. `logo/wordmark/` is the ICARUS lockup, where the mark stands in for the A.

| file | when to use it |
| --- | --- |
| `icarus-mark.svg` (white) | Default mark on dark backgrounds. Profile pictures, watermarks, corners of slides. |
| `icarus-mark-violet.svg` | Hero moments only: a cover slide, a launch post. Not a watermark. |
| `icarus-mark-on-light.svg` | The same mark in near-black, for the rare light background. |
| `icarus-app-icon.svg` | The mark on its black rounded tile, exactly as the app icon ships. Use when the logo must look like an app icon. |
| `icarus-wordmark.svg` | Primary lockup, white, for dark surfaces. |
| `icarus-wordmark-violet.svg` | Lockup with the violet mark; hero and splash moments only. |
| `icarus-wordmark-plain.svg` | Plain caps with a real A. The site uses this one at 28px above "Touch the sun." Use it whenever the lockup would be under about 14px tall. |
| `*-on-light.svg` | Near-black versions of both for light surfaces. |

PNG exports of every file are in the `png/` folders (mark at 512, 1024, 2048px tall; wordmark at 1200, 2400, 4800px wide), transparent except the app icon tile.

Rules:

- The mark is white on dark by default. Violet is reserved for one hero moment per piece.
- Keep clear space around the lockup equal to the height of the mark. Nothing touches it.
- Do not recolor the mark outside white, violet `#7c3aed`, or near-black `#09090b`. No gradients on it, no outlines, no drop shadows.
- Do not set the word "Icarus" in another font next to the mark. Use the lockup files.
- The wordmark is the only capitals in the brand, apart from VALORANT written the way Riot writes it. Nothing else is uppercased or letter-spaced.
- The older rounded-sans "Icarus" logotype on the site's share image (`og-image.png`) is retired.

## Color

Full list with roles in `colors/icarus-colors.txt` and `colors/icarus-colors.json`. Grays are Tailwind Zinc, violets are Tailwind Violet.

The rule that matters most: **violet is the one command color.** In the app it marks the current action, selection, focus, and primary buttons, and nothing else. In a post that means one violet element per slide. Hover never changes a color and never adds a gradient.

| role | hex |
| --- | --- |
| Background, every page and the canvas | `#09090b` |
| Card, panel, dialog | `#18181b` |
| Border, raised chip | `#27272a` |
| Text and the white logo | `#fafafa` |
| Muted: body copy on the site, secondary text in the app | `#a1a1aa` |
| Dim: small labels, version lines, footers | `#71717a` |
| Violet: fills, buttons, the violet mark | `#7c3aed` |
| Deep violet: selection, dark end of the halftone | `#4c1d95` |
| Lavender: icon tint in site chips, bright end of the halftone | `#c4b5fd` |

Ally green `#3a7e5d`, enemy red `#772727`, favorite amber `#ff9800`, and the map's ember browns carry game meaning inside the app. Never decoration. The five pen colors (white, red, blue, yellow, green) are in the JSON too, for mocking up the board.

## Type

All five faces are free and open (SIL Open Font License). Files and licenses are in `fonts/`; they are also on Google Fonts under the same names.

| face | job | how the product sets it |
| --- | --- | --- |
| Saira | The wordmark, and nothing else. | Width 125, weight 600, all caps, letter-spacing 0.08em. Already outlined in the SVGs. |
| Onest | Display on the site: headline, section heads, claim titles. | Weight 700. Headline 40 to 80px, line-height 1.02, tracking −0.02em. Section heads 28 to 44px, line-height 1.08, tracking −0.015em. |
| Inter | Body and labels on the site. | Weight 500. Body 15.5px, line-height 1.7, muted `#a1a1aa`. Hero subline 16.5px, line-height 1.6. Small label above a heading: 12px, dim `#71717a`, sentence case. |
| Geist | The app's own UI text. | 400 to 600. Five roles: headline 20/500, title 16/600, body 14/400, label 12/600, micro 10/600. Use it when a post mocks up app UI. |
| Geist Mono | Share codes and links on the share page. | Weight 400, 13px. Never for labels, never uppercase. |

Restraint is the rule: one display line, then body. No hero-scale stacks of type, no capitals for emphasis.

## Buttons and surfaces

- Site primary button: flat violet `#7c3aed`, 42px tall, 8px radius, 14px weight 600, white text. No gradient, no shadow, no hover color.
- Site secondary button: transparent, 1px border at white 14%, same size. Hover brightens the border to white 30% and the fill to white 4%.
- The Discord button uses Discord's own blurple `#5865f2`, and only that button.
- App buttons are different: a primary or selected surface in the app is "raised", lit from above (fill lighter at the top, 1px white-at-14% line inside the top edge, 1px black-at-30% inside the bottom, 1px black shadow beneath). Hover stays flat there too.
- Radii: 4, 6, 8 (controls, buttons, chips), 10, 12 (panels), 16 (cards and the frames around app footage), 22 (dialogs).
- Depth is tonal: background, then card, then raised chip, with 1px `#27272a` borders. Two shadows exist: card foreground `0 4px 12px rgba(0,0,0,0.54)` and menu lift `0 8px 24px rgba(0,0,0,0.28)`. Nothing else casts one.
- App footage on the site sits in a 16px-radius frame with a 1px border at white 10%, aspect 1664 × 1080, on the plain background. Do the same in posts.

## Textures

- Site backdrop: a dot grid, 1px dots at white 6% on a 16px pitch, over `#09090b`.
- App canvas: a finer dot grid on `#09090b` with a soft radial lift to `#18181b` at the center. In the app it is a shader that reacts to the cursor: dots near the mouse brighten and swell while the rest of the field dims. The same idea as the sun, at rest.
- The sun and the torchlight are halftones. See the next section; it is the heart of the look.
- A hairline band of that halftone sits above the hero, a cold slice of the sun's field.

## The sun

The homepage ends inside the sun, under "Touch the sun." with the Download button, and that section is the reference for everything else in the brand. The same shader lights the app's update dialog, so it is not a website flourish; it is Icarus.

How it works, because the rule matters more than the picture:

- It is a lattice of round dots on a 9px cell, over the plain background.
- Every dot's **size and color follow the light together**. Radius grows with the square root of the intensity. Color climbs a ramp: deep violet `#1e0a4a`, then the brand violet `#7c3aed`, then lavender `#c4b5fd`, then near-white `#f5f3ff` at the hottest point. Opacity rises from 35% to full. So the dark sky is tiny deep-violet dots, and the center is fat, pale, nearly white dots.
- A second, cool field drifts through the first on a silver ramp `#252530` → `#7a7a8a` → `#e8e7f2`. Each dot belongs to whichever field is hotter, so the sun is violet where it burns and silver where it cools. It is never a flat grain of one purple.
- At rest every cell keeps a faint base dot, so the lattice never disappears; it only dims.
- Heat is meaningful, not decorative: scrolling toward the section warms it from 0 to 0.75, pointing at Download leans it violet for a beat, and the real download finishes it to 1. When the download completes: "Your wings. Your machine. Fly."
- The composition: a horizon fade from the background at the top, a comet at 38% opacity above, one feather drifting down, then in a dark radial pool the plain wordmark at 28px, "Touch the sun." in Onest 700 at up to 76px, the flat violet Download button, a 10px version line, and the footer links inside the sun: GitHub, Discord, "MIT, all the way down".
- The hero foreshadows it with a 340px hairline of the same field along the top edge, cold.

`brand-sheet/sun.js` is the site's DitherFire shader verbatim, and `brand-sheet/dither.js` is DitherLight, the single-source torch version. Use them, or reproduce the rule above by hand. It is never a smooth gradient, a blur, or a glow.

## Motifs

`motifs/` holds the site's six hand-drawn white line-art pieces, 1024 × 1024 PNG with transparency: comet, feather, paper plane, sun, torch, wing. The site uses them faint and off to the side, never as illustration: the sun at 17% opacity in the hero corner (36% when you reach for Download), the wing at 6% behind the community section, the paper plane at 50% next to the export copy, the comet at 38% above the sun, one feather drifting at 85%.

The rule from the page itself: the myth lives in the headlines and in the two big visuals, the flight path and the sun. Everything else, labels, body copy, feature names, talks about the product.

## Voice

Plain, short, sure of itself. We talk to a player whose idea is still hot, so no throat clearing and no hype words. Feature copy names what the thing does, in the player's words: "One code hands your five-stack the whole strat." "Fixes ship while the meta is still warm." "For when the pen isn't enough." "We stopped listing."

Do: name the map, the agent, the round. Show the board.
Don't: "revolutionary", "seamless", "game-changing", exclamation marks, emoji in headlines, capitals for emphasis.

## App screenshots

`app/` holds captures of the current app (library and editor at 3200 × 1800) for feature carousels. Never crop the UI so tightly that a control looks like it floats; the app's borders and panels are part of the look. Note that the board image in the site's hero is from an older version of the app; use these captures for anything that shows the current UI.

## Social starting points

- Carousel slides: 1080 × 1350, background `#09090b` with the 16px dot grid, white mark in a corner at 40px, one small dim label line, one Onest 700 headline, Inter body in muted. One violet element.
- App footage: in a 16px-radius frame with a 1px white-10% border, like the site.
- Reels covers: 1080 × 1920, the board fills the frame and the copy sits on a `#18181b` panel.
- Dark only. There is no light-mode brand; the on-light files exist for the odd embed on someone else's white page.
