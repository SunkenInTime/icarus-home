"use client";
import Head from "next/head";
import {
  FaGithub,
  FaDiscord,
  FaTwitter,
  FaDownload,
  FaArrowRight,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"windows" | "mac" | "linux">("windows");

  const latestVersion = {
    platforms: {
      windows: {
        url: "https://apps.microsoft.com/detail/9PBWHHZRQFW6?hl=en-us&gl=US&ocid=pdpshare",
        size: "123 MB",
      },
      mac: {
        url: "https://example.com/mac",
        size: "123 MB",
      },
      linux: {
        url: "https://example.com/linux",
        size: "123 MB",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-red-900/20 via-transparent to-blue-900/10 blur-3xl" />

      {/* Dotted Grid Background */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(#ffffff 0.5px, transparent 0.5px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <Head>
        <title>Icarus - Valorant Strategy Planner</title>
        <meta
          name="description"
          content="Revolutionary Valorant strategy planning tool"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="relative z-10 backdrop-blur-md bg-black/20 border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* <div className="h-8 w-8 bg-red-600 rounded-lg"></div> */}
            <img width={35} height={35} src="https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UC5l0lqgyKoUQXBjdA4sgHc3Dqt8pWIzr2e0iN" />
            <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              Icarus
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#beta"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Beta
            </a>
            <a
              href="#download"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Download
            </a>
            <a
              href="#community"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Community
            </a>
          </div>
          <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
            <FaDownload />
            Download Beta
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="py-24 container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 space-y-6"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-red-900/20 border border-red-500/20 text-red-500 text-xs font-semibold">
                CURRENTLY IN BETA
              </div>
              <h1 className="text-5xl md:text-7xl font-bold">
                <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                  Icarus
                </span>
                <br />
                <span className="text-white">Valorant Strategy Planner</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-xl">
                The next evolution in Valorant strategy planning. Local-first,
                intuitive, and designed for competitive players.
              </p>
              <div className="flex gap-4 pt-4">
                <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg transition-all font-medium flex items-center gap-2 shadow-lg shadow-red-900/20">
                  Download Beta <FaArrowRight />
                </button>
                <button className="border border-white/20 hover:bg-white/5 text-white px-8 py-4 rounded-lg transition-all font-medium">
                  Learn More
                </button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1"
            >
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-xl blur opacity-30"></div>
                <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-white/10">
                  <img
                    src="https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UCCV8ubqfBotb9Ny0l3H6cY4aDWZsA8fF1ewvm"
                    className="block rounded-xl object-fit"
                    style={{ maxWidth: "100%", maxHeight: "400px" }}
                    alt="Description of the image"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-black/30 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose Icarus?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Designed from the ground up to address the shortcomings of
                existing tools
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  key={index}
                  className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-white/5 hover:border-red-500/20 transition-all group"
                >
                  <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-600/30 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-red-500 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        {/* Comparison Section */}
        <section className="py-24 container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Switch from Other Tools?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See how Icarus compares to existing solutions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-6 text-left">Feature</th>
                  <th className="py-4 px-6 text-center border-2 border-red-500/50 rounded-t-lg">
                    Icarus
                  </th>
                  <th className="py-4 px-6 text-center">Competitors</th>
                </tr>
              </thead>
              <tbody>
                {comparisonItems.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-4 px-6 text-gray-300">{item.feature}</td>
                    <td className="py-4 px-6 text-center border-x-2 border-red-500/50">
                      <span
                        className={item.icarus ? "text-green-500" : "text-red-500"}
                      >
                        {item.icarus ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={
                          item.competitors ? "text-green-500" : "text-red-500"
                        }
                      >
                        {item.competitors ? "✓" : "✗"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Add a bottom border to complete the rounded outline */}
              <tfoot>
                <tr>
                  <td></td>
                  <td className="border-b-2 border-x-2 border-red-500/50 rounded-b-lg"></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>


        {/* Beta Info Section */}
        <section id="beta" className="py-24 bg-black/30 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-xl blur opacity-20"></div>
                  <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-white/10">
                    <div className="relative w-full bg-gray-800 flex items-center justify-center">
                      <img
                        src="https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UCCV8ubqfBotb9Ny0l3H6cY4aDWZsA8fF1ewvm"
                        className="block rounded-xl object-fit"
                        style={{ maxWidth: "100%", maxHeight: "400px" }}
                        alt="Description of the image"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex-1 space-y-6"
              >
                <div className="inline-block px-3 py-1 rounded-full bg-red-900/20 border border-red-500/20 text-red-500 text-xs font-semibold">
                  ROADMAP
                </div>
                <h2 className="text-4xl font-bold">Currently in Beta</h2>
                <p className="text-gray-400">
                  Icarus is approaching its 1.0 release, with new features
                  being added regularly. Join our growing community of testers
                  and help shape the future of Valorant strategy planning.
                </p>

                <div className="space-y-4 pt-4">
                  <h3 className="text-xl font-bold text-red-500">
                    Coming Soon
                  </h3>
                  <ul className="space-y-3">
                    {comingSoonFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-red-500 text-sm">✓</span>
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className="py-24 container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Get Started Today</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Download the beta version and join the revolution in Valorant
              strategy planning
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
              <div className="flex border-b border-white/10">
                {["windows", "mac", "linux"].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setActiveTab(platform as "windows" | "mac" | "linux")}
                    className={`flex-1 py-4 text-center transition-colors ${activeTab === platform
                      ? "bg-red-600/20 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    disabled={platform === "mac" || platform === "linux"}
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    {platform === "mac" || platform === "linux" ? " (Coming Soon)" : ""}
                  </button>
                ))}
              </div>

              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4">
                      Download for{" "}
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Version 1.0.2 Beta • Released April 4, 2025
                    </p>
                    <a
                      href={
                        // latestVersion.platforms[activeTab as "windows" | "mac" | "linux"].url

                        latestVersion.platforms[activeTab as "windows" | "mac" | "linux"].url
                      }
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                    >
                      <FaDownload /> Download Now
                    </a>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                      By downloading, you agree to our Terms of Service
                    </p>
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-lg h-[200px] flex items-center justify-center">
                    <img
                      src="https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UCCV8ubqfBotb9Ny0l3H6cY4aDWZsA8fF1ewvm"
                      className="block rounded-xl object-fit"
                      style={{ maxWidth: "100%", maxHeight: "400px" }}
                      alt="Description of the image"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section id="community" className="py-24 bg-black/30 backdrop-blur-sm">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4">Join the Community</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-12">
              Connect with other users, share strategies, and contribute to the
              development of Icarus
            </p>

            <div className="flex flex-wrap gap-6 justify-center">
              {communityLinks.map((link, index) => (
                <motion.a
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  key={index}
                  href={link.url}
                  className="bg-gradient-to-b from-gray-800 to-gray-900 hover:from-red-900/30 hover:to-red-900/10 p-6 rounded-xl border border-white/5 hover:border-red-500/20 transition-all group w-64"
                >
                  <div className="w-12 h-12 mx-auto bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                    {link.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-red-500 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{link.description}</p>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-red-600 rounded-lg"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                Icarus
              </span>
            </div>

            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-600/20 flex items-center justify-center transition-colors"
              >
                <FaGithub />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-600/20 flex items-center justify-center transition-colors"
              >
                <FaDiscord />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-600/20 flex items-center justify-center transition-colors"
              >
                <FaTwitter />
              </a>
            </div>
          </div>

          <div className="border-t border-white/5 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© 2024 Icarus. All rights reserved. Created by Dara.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Data
const features = [
  {
    icon: (
      <svg
        className="w-6 h-6 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>
    ),
    title: "Local-First Approach",
    description:
      "Your strategies belong to you. All data is stored locally - no subscriptions, no lost work, complete privacy.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    title: "Intuitive Interface",
    description:
      "Designed for both beginners and pros with a clean, modern UI that puts functionality first and adapts to your workflow.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
    title: "Open Source",
    description:
      "Built by the community, for the community. Contribute, suggest features, or just peek under the hood to see how it works.",
  },
];

const comparisonItems = [
  { feature: "Local Storage", icarus: true, competitors: false },
  { feature: "No Subscription Required", icarus: true, competitors: false },
  { feature: "Offline Access", icarus: true, competitors: false },
  { feature: "Live collaboration", icarus: false, competitors: true },
  { feature: "Open Source", icarus: true, competitors: false },
  { feature: "Custom Line-ups", icarus: false, competitors: true },
  { feature: "Strategy Sharing", icarus: true, competitors: true },
];

const comingSoonFeatures = [
  "Online functionality (Premium feature)",
  "Advanced team collaboration tools",
  "More agent-specific utilities",
  "Custom map annotations",
  "Multi-page support",
];

const communityLinks = [
  {
    icon: <FaGithub className="text-2xl text-red-500" />,
    title: "GitHub",
    description: "Contribute to the project, report issues, or suggest new features",
    url: "https://github.com/SunkenInTime/icarus",
  },
  {
    icon: <FaDiscord className="text-2xl text-red-500" />,
    title: "Discord",
    description: "Join our community to discuss strategies and get help",
    url: "https://discord.gg/PN2uKwCqYB",
  },
  // {
  //   icon: <FaTwitter className="text-2xl text-red-500" />,
  //   title: "Twitter",
  //   description: "Follow us for updates, tips, and announcements",
  //   url: "#",
  // },
];
