import HomePage from "@/app/components/HomePage";
import { getLatestVersionInfo } from "@/app/lib/getLatestVersionInfo";
import { absoluteUrl, sameAs, siteConfig } from "@/app/seo";

export const revalidate = 3600;

export default async function Home() {
    const latestVersion = await getLatestVersionInfo();
    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": `${siteConfig.url}/#website`,
            name: siteConfig.name,
            alternateName: siteConfig.alternateName,
            url: siteConfig.url,
            inLanguage: "en-US",
            description: siteConfig.description,
            sameAs,
            publisher: {
                "@type": "Person",
                name: siteConfig.author.name,
                url: siteConfig.author.url,
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "@id": `${siteConfig.url}/#software`,
            name: siteConfig.name,
            alternateName: siteConfig.alternateName,
            applicationCategory: "GameApplication",
            applicationSubCategory: "VALORANT strategy planner",
            operatingSystem: "Windows",
            url: siteConfig.url,
            image: absoluteUrl(siteConfig.ogImage.url),
            screenshot: absoluteUrl("/board-preview.png"),
            description: siteConfig.description,
            softwareVersion: latestVersion.version,
            downloadUrl: latestVersion.platforms.windows.url,
            installUrl: latestVersion.platforms.windows.secondaryUrl,
            codeRepository: siteConfig.repository,
            license: siteConfig.license,
            isAccessibleForFree: true,
            offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
            },
            creator: {
                "@type": "Person",
                name: siteConfig.author.name,
                url: siteConfig.author.url,
                sameAs: [siteConfig.social.creatorX],
            },
            sameAs,
            featureList: [
                "Draw tactics and annotations on VALORANT maps",
                "Plan lineups with notes, images, and video references",
                "Review callouts, spawn barriers, ult orbs, and map landmarks",
                "Create team strategy sequences and timing notes",
                "Save, load, and organize strategies locally",
                "Share strategy codes with teammates",
                "Use a free and open-source Valoplant alternative",
            ],
        },
    ];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
                }}
            />
            <HomePage latestVersion={latestVersion} />
        </>
    );
}
