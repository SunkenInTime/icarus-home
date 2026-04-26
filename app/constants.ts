// Tokens mirror the in-app "Tactical Violet" theme so the marketing site
// feels like a continuation of the product, not a separate brand.

// Surfaces (zinc family, matches lib/const/settings.dart tacticalVioletTheme)
export const BG = "#09090b";          // background (almost-black)
export const SURFACE = "#0d0d10";     // page-level lift
export const CARD = "#111114";        // card surface
export const CARD_RAISED = "#161619"; // hovered / focused card
export const BORDER_HARD = "#27272a"; // matches in-app border
export const BORDER_SOFT = "rgba(255,255,255,0.07)";
export const BORDER_LINE = "rgba(255,255,255,0.045)"; // for inset hairlines

// Accent (Violet-700, identical to the app's primary)
export const ACCENT = "#7c3aed";
export const ACCENT_HOVER = "#6d28d9";
export const ACCENT_DEEP = "#4c1d95"; // selection
export const ACCENT_GLOW = "rgba(124, 58, 237, 0.35)";
export const RING = "rgba(124, 58, 237, 0.55)";

// Foreground / text
export const TEXT = "#fafafa";
export const TEXT_SOFT = "#d4d4d8";   // zinc-300
export const TEXT_MUTED = "#a1a1aa";  // zinc-400
export const TEXT_DIM = "#71717a";    // zinc-500

// Atmosphere
export const DOT = "rgba(255,255,255,0.06)";
export const VIGNETTE =
  "radial-gradient(900px 480px at 50% -10%, rgba(124,58,237,0.18), transparent 70%), radial-gradient(700px 400px at 100% 100%, rgba(124,58,237,0.08), transparent 70%)";

// Glass surfaces
export const GLASS_BG =
  "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))";

// Hero / preview imagery
export const PREVIEW_IMG = "/board-preview.png";

// Status (kept for any callouts)
export const STATUS_OK = "#34d399";
export const STATUS_BAD = "#f87171";
