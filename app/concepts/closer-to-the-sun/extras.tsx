"use client";

import type { IconType } from "react-icons";
import {
    FaFolderOpen,
    FaHashtag,
    FaKeyboard,
    FaLayerGroup,
    FaPlus,
    FaRegClone,
    FaShapes,
    FaSyncAlt,
} from "react-icons/fa";

import { palette, shadow } from "../_shared/tokens";

/** The extras inventory and its chip face, shared by whichever visual serves the "and the rest" section. */

export type Extra = { tag: string; detail: string; icon: IconType };

export const EXTRAS: Extra[] = [
    { tag: "custom folders", detail: "Recolor and organize them your way.", icon: FaFolderOpen },
    { tag: "keybinds", detail: "For everything you do twice.", icon: FaKeyboard },
    { tag: "multiple lineups", detail: "Per agent, per map, per mood.", icon: FaLayerGroup },
    { tag: "custom shapes", detail: "For when the pen isn't enough.", icon: FaShapes },
    { tag: "the pages bar", detail: "One strategy, many pages — every sequence gets its own beat.", icon: FaRegClone },
    { tag: "share codes", detail: "One code hands your five-stack the whole strat.", icon: FaHashtag },
    { tag: "auto-updates", detail: "Fixes ship while the meta is still warm.", icon: FaSyncAlt },
    { tag: "and more", detail: "We stopped listing.", icon: FaPlus },
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
        <ul className="sr-only">
            {EXTRAS.map((extra) => (
                <li key={extra.tag}>
                    {extra.tag} — {extra.detail}
                </li>
            ))}
        </ul>
    );
}
