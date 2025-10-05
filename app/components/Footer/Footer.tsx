import SocialButton from "@/app/components/ui/SocialButton";
import { BORDER_SOFT } from "@/app/constants";

const Footer = () => {
    console.log(SocialButton);

    return (
        <footer
            className="relative z-10 backdrop-blur"
            style={{
                borderTop: `1px solid ${BORDER_SOFT}`,
                background: "rgba(255,255,255,0.03)",
            }}
        >
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="flex items-center gap-2">
                        <img width={24} height={24} src="https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UC5l0lqgyKoUQXBjdA4sgHc3Dqt8pWIzr2e0iN" alt="Icarus logo small" />
                        <span className="text-base font-semibold">Icarus</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <SocialButton platform="github" href="https://github.com/SunkenInTime/icarus" />
                        <SocialButton platform="discord" href="https://discord.gg/PN2uKwCqYB" />
                        <SocialButton platform="twitter" href="#" />
                    </div>
                </div>
                <p className="mt-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} Icarus. All rights reserved. Created by Dara.</p>
            </div>
        </footer>
    );
};

export default Footer;
