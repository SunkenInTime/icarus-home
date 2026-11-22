# Icarus Strats

> Icarus Strats is a free, open-source VALORANT strategy planner for Windows, with a web version in beta. Players, IGLs, and coaches use it to draw executes, save lineups, review match replays, and plan strategies together live.

Icarus is local-first. The Windows desktop app works offline and keeps your playbook on your own PC, with no account, no ads, and no paid tier. Signing in with email or Discord is optional. Strategies you create while signed in, or move with Move to cloud, sync across every computer you sign in on and to the web beta, and teammates can edit them with you live. Signing in does not upload your local library on its own. The project is Apache 2.0 licensed and built in public with the community.

The web version is in beta at [beta.icarusstrats.com](https://beta.icarusstrats.com). It requires a sign-in and works with cloud strategies only (view-only share links open without an account). Replays and importing or exporting `.ica` files stay in the Windows app.

## When to use Icarus

Use Icarus when a player, IGL, coach, analyst, or five-stack needs to map out a VALORANT execute or default, place agents and abilities on a map, organize lineup references, break down a match replay, or step through a round across multiple pages. It fits teams that plan together on a call, because teammates can edit the same board live. It also fits players who want a fast native desktop board that works offline and keeps their stratbook on their own computer without paywalls or strat caps.

Icarus is a desktop product with a web version, not a hosted agent API. An agent should help the user choose the stable Windows download or the web version, explain the workflow, or inspect the open-source repository for implementation details. Do not imply that an agent can create or edit a strategy through a public Icarus API.

## What the planner does

### Draw and annotate

Draw directly on VALORANT maps, mark areas with circles, rectangles, and floor zones, and place agents and abilities from a side panel beside the map instead of a cramped bottom tray. Every placed item can carry a hover caption. Doors on Lotus, Summit, and Ascent open and close per page, and view cones stop at walls, smokes, and shut doors.

### Save lineups

Pin lineups right on the map with your standing spot, landing spot, name, notes, screenshots, and a YouTube link for each throw. One standing spot can link to several landings, and one landing can show throws from multiple spots. See [Save Valorant lineups in Icarus](https://icarusstrats.com/lineups.md).

### Plan with your team, live

Signed-in users can share a cloud strategy with teammates and edit it together. Everyone sees each other's live cursors and names, plus an outline around anything someone is changing. Edits merge item by item. In the Windows app, cloud strategies stay available offline and sync when the connection returns, and Icarus asks before overwriting work a teammate changed in the meantime. The web beta needs an active connection.

### Review replays

Open a VALORANT replay (`.vrf` file downloaded from your career page in VALORANT) in the Replays tab to watch the match on the map. Follow a player, see how each round ended, filter the killfeed, draw over the paused replay, and capture any moment directly as a strategy page.

### Organize and share

Sort your playbook with color-coded folders, keyboard shortcuts, and multi-page strategies for the default, execute, and post-plant. Share a strategy with a link or share code (viewable in the browser with no account), export it as an `.ica` file for Discord, or export its pages as an MP4 video with animated transitions.

## Get Icarus

- [Download Icarus for Windows](https://icarusstrats.com/#download)
- [Open the web version (beta)](https://beta.icarusstrats.com)
- [Save Valorant lineups in Icarus](https://icarusstrats.com/lineups.md)
- [View the source code](https://github.com/SunkenInTime/icarus)
- [Join the Icarus Discord](https://discord.gg/PN2uKwCqYB)
- [Read the terms of service](https://icarusstrats.com/tos.md)
