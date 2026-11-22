export const siteConfig = {
  name: "Icarus Strats",
  alternateName: "Icarus",
  url: "https://icarusstrats.com",
  title: "Icarus Strats - Free Open-Source VALORANT Strategy Planner",
  description:
    "Free, open-source VALORANT strategy planner. Draw strats, save lineups, review replays, and plan live with your team. Local-first, cloud optional.",
  keywords: [
    "Icarus",
    "Icarus Strats",
    "VALORANT strategy planner",
    "Valorant strategy planner",
    "Valoplant alternative",
    "free Valoplant alternative",
    "Valorant strat tool",
    "Valorant strategy board",
    "Valorant lineup planner",
    "Valorant map planner",
    "Valorant callout map",
    "Valorant map drawing tool",
    "Valorant team strategy creator",
    "Valorant lineups notes",
    "free Valorant strategy tool",
    "open source Valorant planner",
    "local-first strategy planner",
    "Valorant live strategy planning with team",
    "Valorant replay viewer",
    "Valorant lineup app",
  ],
  ogImage: {
    url: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "The Icarus strategy board with an Ascent default drawn on the map",
  },
  author: {
    name: "Dara Adedeji",
    url: "https://x.com/daradoescode",
  },
  social: {
    x: "https://x.com/icarusstrats",
    creatorX: "https://x.com/daradoescode",
    github: "https://github.com/SunkenInTime/icarus",
    discord: "https://discord.gg/PN2uKwCqYB",
  },
  repository: "https://github.com/SunkenInTime/icarus",
  license: "https://github.com/SunkenInTime/icarus/blob/main/LICENSE",
} as const;

export const sameAs = [
  siteConfig.social.github,
  siteConfig.social.x,
  siteConfig.social.creatorX,
  siteConfig.social.discord,
] as const;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}
