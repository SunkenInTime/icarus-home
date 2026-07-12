import { CSSProperties } from "react";

/**
 * The wing, drawn the way you'd draw it on the board: a few confident
 * pen strokes, white, 3px, round caps. Leading edge sweeps up-right.
 */
export default function WingGlyph({
    size = 44,
    stroke = "#fafafa",
    strokeWidth = 3,
    className,
    style,
}: {
    size?: number;
    stroke?: string;
    strokeWidth?: number;
    className?: string;
    style?: CSSProperties;
}) {
    return (
        <svg
            viewBox="0 0 64 44"
            width={size}
            height={(size * 44) / 64}
            fill="none"
            aria-hidden
            className={className}
            style={style}
        >
            <path
                d="M4 34 C 14 14, 34 5, 61 7"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
            <path
                d="M10 35 C 21 22, 35 15, 52 14"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
            <path
                d="M17 36 C 25 28, 34 24, 43 21"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
            <path
                d="M24 37 C 29 33, 33 31, 36 29"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
        </svg>
    );
}
