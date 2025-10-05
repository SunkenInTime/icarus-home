import { IconType } from "react-icons";
import { FaDonate, FaCoffee, FaHeart } from "react-icons/fa";

type DonationOption = {
    icon: IconType;
    title: string;
    description: string;
    url: string;
};

const donationOptions: DonationOption[] = [
    {
        icon: FaDonate,
        title: "GitHub Sponsors",
        description: "Recurring support with perks and transparency.",
        url: "https://github.com/sponsors/SunkenInTime",
    },
    {
        icon: FaCoffee,
        title: "Ko-fi",
        description: "One-time tips to fuel development.",
        url: "https://ko-fi.com/",
    },
    {
        icon: FaHeart,
        title: "OpenCollective",
        description: "Transparent community funding.",
        url: "https://opencollective.com/",
    },
];

export default donationOptions;
