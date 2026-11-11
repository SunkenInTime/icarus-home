import { IconType } from "react-icons";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";

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
        <a
            href={href}
            className="icarus-button icarus-button-outline icarus-button-icon-sm"
            aria-label={label}
        >
            <Icon />
        </a>
    );
};

export default SocialButton;
