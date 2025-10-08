"use client";

import { motion } from "framer-motion";
import { IconType } from "react-icons";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";

import { RING } from "@/app/constants";

type Social = "github" | "discord" | "twitter";

const SOCIALS: Record<Social, { icon: IconType; label: string }> = {
    github: { icon: FaGithub, label: "GitHub" },
    discord: { icon: FaDiscord, label: "Discord" },
    twitter: { icon: FaTwitter, label: "Twitter" },
};

const SocialButton = ({ platform, href }: { platform: Social; href: string }) => {
    const social = SOCIALS[platform];
    if (!social?.icon) return null;
    const { icon: Icon, label } = social;

    return (
        <motion.a
            href={href}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
            aria-label={label}
            style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: RING,
            }}
            whileHover={{
                scale: 1.12,
                rotate: 3,
                boxShadow: `0 0 0 2px ${RING}, 0 10px 24px rgba(123,97,255,0.18)`,
            }}
            whileTap={{ scale: 0.94, rotate: 0 }}
        >
            <Icon />
        </motion.a>
    );
};

export default SocialButton;
