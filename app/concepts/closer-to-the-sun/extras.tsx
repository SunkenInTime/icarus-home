"use client";

import type { IconType } from "react-icons";
import {
    FaFilm,
    FaFolderOpen,
    FaHashtag,
    FaLayerGroup,
    FaRegClone,
    FaShapes,
    FaUsers,
    FaVideo,
} from "react-icons/fa";

import { palette, shadow } from "../_shared/tokens";

/** The extras inventory and its chip face, shared by whichever visual serves the "and the rest" section. */

export type Extra = { tag: string; detail: string; icon: IconType };

export const EXTRAS: Extra[] = [
    { tag: "folders", detail: "Sort your playbook by map, comp, or side, and color-code it your way.", icon: FaFolderOpen },
    { tag: "live planning", detail: "Edit the same board together with live cursors and instant sync.", icon: FaUsers },
    { tag: "lineups", detail: "Pin where you stand and where util lands, with clips, screenshots, and notes.", icon: FaLayerGroup },
    { tag: "shapes & zones", detail: "Mark site control and clear areas with circles, boxes, and floor zones.", icon: FaShapes },
    { tag: "multi-page strats", detail: "Step through the default, execute, and post-plant on separate pages.", icon: FaRegClone },
    { tag: "share links", detail: "Send a link or code to your five-stack. Anyone can view it in the browser.", icon: FaHashtag },
    { tag: "2d replays", detail: "Watch .vrf replays on the map and capture any round moment as a page.", icon: FaFilm },
    { tag: "mp4 export", detail: "Export multi-page strats as animated videos ready for team Discord.", icon: FaVideo },
];

export function ChipFace({ extra }: { extra: Extra }) {
    const Icon = extra.icon;
    return (
        <span
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2"
            style={{
                background: palette.card,
                borderColor: palette.border,
                boxShadow: shadow.cardForeground,
            }}
            title={extra.detail}
        >
            <Icon size={11} color={palette.lavender} aria-hidden />
            <span className="callsign" style={{ color: palette.fg, fontSize: 10 }}>
                {extra.tag}
            </span>
        </span>
    );
}

export function ExtrasInventory() {
    return (
        <div className="sr-only">
            <h2>More Icarus features</h2>
            <ul>
                {EXTRAS.map((extra) => (
                    <li key={extra.tag}>
                        <h3>{extra.tag}</h3>
                        <p>{extra.detail}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
