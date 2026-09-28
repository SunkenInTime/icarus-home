import fallbackVersionInfo, { VersionInfo } from "@/app/data/versionInfo";

// The release GitHub marks Latest is the one the Download button's
// releases/latest link serves, so its tag and date describe that installer.
const GITHUB_LATEST_RELEASE_URL =
    "https://api.github.com/repos/SunkenInTime/icarus/releases/latest";

// Desktop release tags look like desktop-stable-v4.6.3+103.
const RELEASE_TAG_PATTERN = /^(?:desktop-stable-)?v?(\d+\.\d+\.\d+)(?:\+\d+)?$/;

type GitHubRelease = {
    tag_name: string;
    published_at: string;
};

function formatReleaseDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

async function getLatestRelease(): Promise<GitHubRelease | null> {
    try {
        const response = await fetch(GITHUB_LATEST_RELEASE_URL, {
            headers: {
                Accept: "application/vnd.github+json",
                "User-Agent": "icarus-home",
            },
            next: { revalidate: 3600 },
        });
        if (!response.ok) {
            return null;
        }
        return (await response.json()) as GitHubRelease;
    } catch {
        return null;
    }
}

export async function getLatestVersionInfo(): Promise<VersionInfo> {
    const release = await getLatestRelease();
    const version = RELEASE_TAG_PATTERN.exec(release?.tag_name ?? "")?.[1];
    // A missing or malformed date would throw while formatting, or show 1970.
    const publishedAt = new Date(release?.published_at ?? "");
    if (!version || Number.isNaN(publishedAt.getTime())) {
        return fallbackVersionInfo;
    }

    return {
        ...fallbackVersionInfo,
        version,
        released: formatReleaseDate(publishedAt),
    };
}
