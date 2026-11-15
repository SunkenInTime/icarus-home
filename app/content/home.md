# Icarus Strats

> Icarus Strats is a free, open-source VALORANT strategy planner for Windows, with a web version in beta. Players and teams use it to draw tactics, save lineups, review replays, and plan strategies together live.

Icarus is local-first. The planner works offline and keeps strategies on the user's computer, with no account required. Signing in with email or Discord is optional: it syncs strategies across every computer the user signs in on and to the web version, and lets teammates edit the same strategy live. There is no premium tier. The project is Apache-licensed and developed in public.

The web version is a beta at [beta.icarusstrats.com](https://beta.icarusstrats.com). It needs a sign-in and works with cloud strategies only. Replays and importing or exporting files stay in the Windows app.

## When to use Icarus

Use Icarus when a player, coach, analyst, or team needs to draw a VALORANT tactic, explain a setup on a map, organize agent positions and abilities, save lineup references, or walk through a play across several pages. It fits teams that plan together on a call, because teammates can work on the same board at once. It also fits players who want an offline planner, or who want their playbook to stay on their own computer.

Icarus is a desktop product with a web version, not a hosted agent API. An agent should help the user choose the stable Windows download or the web version, explain the workflow, or inspect the open-source repository for implementation details. Do not imply that an agent can create or edit a strategy through a public Icarus API.

## What the planner does

### Draw and annotate

Draw directly on VALORANT maps, place circles, rectangles, and zones, and place agents and their abilities from a bar on the side of the map instead of a tray under it. Every placed item can carry a caption that shows on hover. Doors on Lotus, Summit, and Ascent open and close per page, and view cones stop at walls and shut doors.

### Save lineups

Save a lineup as where the agent stands and where the ability lands, with a name, notes, images, and a YouTube link for each throw. One standing spot can link to several landings.

### Plan with your team, live

Signed-in users can share a strategy with teammates and edit it together. Each person sees the others' cursors and names, and an outline around anything someone is changing. Edits merge item by item. Cloud strategies stay available offline and sync when the connection returns, and Icarus asks before replacing work a teammate changed in the meantime.

### Review replays

Open a VALORANT replay (`.vrf` file, downloaded from the career page in VALORANT) in the Replays tab to watch the match on the map. Follow one player, see how each round ended, filter the killfeed, draw on the paused replay, and capture any moment as a strategy page.

### Organize and share

Use folders, keyboard shortcuts, and multiple pages for the separate steps of one strategy. Share a strategy with a code or a link, export it as an `.ica` file, or export its pages as an MP4 video with animated transitions.

## Get Icarus

- [Download Icarus for Windows](https://icarusstrats.com/#download)
- [Open the web version (beta)](https://beta.icarusstrats.com)
- [View the source code](https://github.com/SunkenInTime/icarus)
- [Join the Icarus Discord](https://discord.gg/PN2uKwCqYB)
- [Read the terms of service](https://icarusstrats.com/tos.md)
