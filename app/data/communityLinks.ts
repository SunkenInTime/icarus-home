import { IconType } from "react-icons";
import { FaGithub, FaDiscord } from "react-icons/fa";

type CommunityLink = {
    icon: IconType;
    title: string;
    description: string;
    url: string;
};

const communityLinks: CommunityLink[] = [
    {
        icon: FaGithub,
        title: "GitHub",
        description: "Contribute to the project, report issues, or suggest features.",
        url: "https://github.com/SunkenInTime/icarus",
    },
    {
        icon: FaDiscord,
        title: "Discord",
        description: "Discuss strategies and get help from the community.",
        url: "https://discord.gg/PN2uKwCqYB",
    },
];

export default communityLinks;
