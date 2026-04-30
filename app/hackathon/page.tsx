"use client";

import Head from "next/head";
import { useMemo, useState } from "react";

import { motion, useReducedMotion } from "framer-motion";
import { FaDownload, FaExclamationTriangle, FaFlask, FaVoteYea } from "react-icons/fa";

import SectionShell from "@/app/components/ui/SectionShell";
import GlassDeviceFrame from "@/app/components/ui/GlassDeviceFrame";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";

import { BG, DOT, VIGNETTE, BORDER_SOFT, RING, ACCENT, ACCENT_HOVER, TEXT_SOFT, PREVIEW_IMG } from "@/app/constants";
import { AnimationVariants } from "@/app/types/AnimationVariants";

type Platform = "windows" | "mac" | "linux";

const hackathonBuild = {
  name: "Hackbot Build",
  version: "Hackathon Experimental",
  note: "Breaking changes. Not aligned with the current beta.",
  platforms: {
    windows: {
      url: "https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UCcHinHaUnCZlhqru1GWzgRdyVwO9Sj50sM3ei",
      size: "TBD",
      label: "Download (Windows)",
    },
    mac: {
      url: "#",
      size: "TBD",
      label: "Download (Mac)",
      disabled: true,
    },
    linux: {
      url: "#",
      size: "TBD",
      label: "Download (Linux)",
      disabled: true,
    },
  } as Record<Platform, { url: string; size: string; label: string; disabled?: boolean }>,
};

export default function HackathonPage() {
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<Platform>("windows");

  const variants = useMemo<AnimationVariants>(
    () => ({
      fadeUp: {
        initial: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      },
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.4 } },
      },
      pop: {
        initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.985 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
      },
    }),
    [prefersReducedMotion]
  );

  const platform = hackathonBuild.platforms[activeTab];
  const disabled = !!platform.disabled || platform.url === "#";

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ backgroundColor: BG }}>
      <Header />
      <div
        aria-hidden
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${DOT} 1px, transparent 1px), ${VIGNETTE}`,
          backgroundSize: "16px 16px, cover",
          backgroundPosition: "center, center",
        }}
      />

      <Head>
        <title>Icarus – Hackathon Build</title>
        <meta
          name="description"
          content="Download the ultra-experimental hackathon build of Icarus (breaking changes)."
        />
      </Head>

      <main className="relative z-10">
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <motion.div initial="initial" animate="animate" variants={variants.fadeUp} className="space-y-5">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                  style={{
                    color: TEXT_SOFT,
                    border: `1px solid ${BORDER_SOFT}`,
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <FaFlask aria-hidden />
                  Hackathon build
                </span>

                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  Hackbot edition.
                  <br />
                  Very experimental Icarus.
                </h1>

                <p className="max-w-xl text-gray-300">
                  This download is for the hackathon. It has breaking changes and does not align with the current public beta.
                  Your strategies may not load correctly or may behave differently.
                </p>

                <div
                  className="rounded-lg p-4"
                  style={{
                    border: `1px solid rgba(255, 179, 71, 0.28)`,
                    background: "rgba(255, 179, 71, 0.07)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-md"
                      style={{ background: "rgba(0,0,0,0.18)", border: `1px solid rgba(255,255,255,0.10)` }}
                    >
                      <FaExclamationTriangle aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">Heads up: breaking changes</p>
                      <p className="mt-1 text-sm" style={{ color: TEXT_SOFT }}>
                        This build can break existing strategy files and workflows. Sorry, not sorry.
                        Some of these features will land in the mainline later.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <motion.a
                    href="#download"
                    className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{
                      backgroundColor: ACCENT,
                      color: "#fff",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97, y: 0 }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ACCENT_HOVER)}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
                  >
                    <FaDownload aria-hidden />
                    Download hackathon build
                  </motion.a>

                  <motion.a
                    href="#vote"
                    className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium text-white/90 focus-visible:outline-none focus-visible:ring-2"
                    style={{
                      border: `1px solid ${BORDER_SOFT}`,
                      background: "rgba(255,255,255,0.02)",
                      backdropFilter: "blur(6px)",
                      borderColor: RING,
                    }}
                    whileHover={{ y: -1, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}
                    whileTap={{ y: 0, scale: 0.98 }}
                  >
                    Vote for Hackbot
                  </motion.a>
                </div>
              </motion.div>

              <motion.div initial="initial" animate="animate" variants={variants.pop}>
                <div className="relative">
                  <div
                    aria-hidden
                    className="absolute -inset-6 rounded-[22px] blur-2xl"
                    style={{
                      background:
                        "radial-gradient(60% 60% at 70% 30%, rgba(123,97,255,0.30), rgba(123,97,255,0.05) 60%, transparent 70%)",
                    }}
                  />
                  <GlassDeviceFrame rounded="lg">
                    <img
                      src={PREVIEW_IMG}
                      alt="Icarus preview"
                      className="block w-full"
                      style={{ maxHeight: 380, objectFit: "cover" }}
                    />
                  </GlassDeviceFrame>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <SectionShell id="download" title="Download (Hackathon)">
          <p className="mt-3 text-gray-400 text-center">
            {hackathonBuild.version} • {hackathonBuild.note}
          </p>

          <div
            className="overflow-hidden rounded-lg mt-10"
            style={{
              border: `1px solid ${BORDER_SOFT}`,
              background: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div className="flex overflow-x-auto">
              {(["windows", "mac", "linux"] as Platform[]).map((p) => {
                const pInfo = hackathonBuild.platforms[p];
                const pDisabled = !!pInfo.disabled || pInfo.url === "#";
                const isActive = activeTab === p;
                return (
                  <motion.button
                    key={p}
                    onClick={() => !pDisabled && setActiveTab(p)}
                    className="flex-1 px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
                    style={{
                      color: isActive ? "#fff" : "#BDBDBD",
                      backgroundColor: isActive ? "rgba(255,255,255,0.04)" : "transparent",
                      opacity: pDisabled ? 0.6 : 1,
                      cursor: pDisabled ? "not-allowed" : "pointer",
                      borderColor: RING,
                    }}
                    whileHover={!pDisabled ? { y: -1 } : undefined}
                    whileTap={!pDisabled ? { y: 0, scale: 0.98 } : undefined}
                    aria-pressed={isActive}
                    aria-disabled={pDisabled}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                    {pDisabled ? " (Coming soon)" : ""}
                  </motion.button>
                );
              })}
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-8 md:grid-cols-2 items-center">
                <div>
                  <h3 className="text-xl font-semibold">
                    {hackathonBuild.name} for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h3>
                  <p className="mt-2 text-gray-400">{platform.size} • Experimental</p>

                  <div className="mt-6 space-y-3">
                    <motion.a
                      data-retn-click
                      data-retn-name="Hackathon download click"
                      href={disabled ? undefined : platform.url}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{
                        backgroundColor: disabled ? "rgba(255,255,255,0.10)" : ACCENT,
                        color: disabled ? "rgba(255,255,255,0.70)" : "#fff",
                        cursor: disabled ? "not-allowed" : "pointer",
                        WebkitTapHighlightColor: "transparent",
                      }}
                      whileHover={!disabled ? { scale: 1.02, y: -1 } : undefined}
                      whileTap={!disabled ? { scale: 0.97, y: 0 } : undefined}
                      onMouseOver={(e) => {
                        if (!disabled) e.currentTarget.style.backgroundColor = ACCENT_HOVER;
                      }}
                      onMouseOut={(e) => {
                        if (!disabled) e.currentTarget.style.backgroundColor = ACCENT;
                      }}
                      aria-disabled={disabled}
                      tabIndex={disabled ? -1 : 0}
                    >
                      <FaDownload aria-hidden />
                      {disabled ? "Download link coming soon" : platform.label}
                    </motion.a>
                    <p className="text-center text-xs text-gray-500">
                      Hackathon-only build • Expect breakage • By downloading, you agree to our{" "}
                      <a href="/tos" className="text-[#7B61FF] hover:underline">
                        Terms of Service
                      </a>
                      .
                    </p>
                  </div>
                </div>

                <div>
                  <GlassDeviceFrame rounded="lg">
                    <img
                      src={PREVIEW_IMG}
                      alt="Hackathon build preview"
                      className="block w-full"
                      style={{ maxHeight: 320, objectFit: "cover" }}
                    />
                  </GlassDeviceFrame>
                </div>
              </div>
            </div>
          </div>
        </SectionShell>

        <SectionShell id="vote" title="Vote for Hackbot">
          <p className="mt-3 text-gray-400 text-center">
            If you like where this is going, vote for the Hackbot track so we can justify polishing it.
          </p>

          <div
            className="mt-10 rounded-lg p-6 sm:p-8"
            style={{
              border: `1px solid ${BORDER_SOFT}`,
              background: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-semibold">Hackbot: ultra-experimental features</p>
                <p className="mt-1 text-sm" style={{ color: TEXT_SOFT }}>
                  Breaking changes now, cleaner workflow later. Some features will graduate into the mainline.
                </p>
              </div>

              <motion.a
                href={undefined}
                className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  border: `1px solid ${BORDER_SOFT}`,
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(6px)",
                  borderColor: RING,
                  color: "#fff",
                  cursor: "not-allowed",
                  opacity: 0.7,
                }}
                aria-disabled
                tabIndex={-1}
              >
                <FaVoteYea aria-hidden />
                Vote link coming soon
              </motion.a>
            </div>
          </div>
        </SectionShell>
      </main>
      <Footer />
    </div>
  );
}
