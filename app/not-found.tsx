import Link from "next/link";

const RECOVERY_LINKS = [
  ["Icarus Strats home", "/"],
  ["Agent instructions", "/llms.txt"],
  ["XML sitemap", "/sitemap.xml"],
  ["Open-source repository", "https://github.com/SunkenInTime/icarus"],
] as const;

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 text-white"
      style={{ background: "#09090b" }}
    >
      <article className="w-full max-w-xl">
        <p
          className="font-mono text-xs uppercase tracking-[0.2em]"
          style={{ color: "#a78bfa" }}
        >
          HTTP 404
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Page not found.
        </h1>
        <p className="mt-5 max-w-lg leading-7" style={{ color: "#a1a1aa" }}>
          No Icarus Strats page exists at this path. Try the product guide or
          use a machine-readable index to find the right page.
        </p>
        <ul className="mt-8 space-y-3">
          {RECOVERY_LINKS.map(([label, href]) => (
            <li key={href}>
              <Link
                href={href}
                className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-violet-300"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </article>
    </main>
  );
}
