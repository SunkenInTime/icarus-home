import fallbackVersionInfo, { VersionInfo } from "@/app/data/versionInfo";

type GitHubTag = {
    name: string;
    commit: {
        url: string;
    };
};

type GitHubCommit = {
    commit: {
        committer: {
            date: string;
        };
    };
};

type ParsedTag = {
    normalized: string;
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
    commitUrl: string;
};

const GITHUB_TAGS_URL =
    "https://api.github.com/repos/SunkenInTime/icarus/tags?per_page=20";

const SEMVER_TAG_PATTERN =
    /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

function parseTag(tag: GitHubTag): ParsedTag | null {
    const match = SEMVER_TAG_PATTERN.exec(tag.name);

    if (!match) {
        return null;
    }

    return {
        normalized: tag.name.replace(/^v/, ""),
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
        prerelease: match[4],
        commitUrl: tag.commit.url,
    };
}

function compareTags(a: ParsedTag, b: ParsedTag) {
    if (a.major !== b.major) {
        return b.major - a.major;
    }

    if (a.minor !== b.minor) {
        return b.minor - a.minor;
    }

    if (a.patch !== b.patch) {
        return b.patch - a.patch;
    }

    if (!a.prerelease && b.prerelease) {
        return -1;
    }

    if (a.prerelease && !b.prerelease) {
        return 1;
    }

    return (a.prerelease ?? "").localeCompare(b.prerelease ?? "", undefined, {
        numeric: true,
    });
}

function formatReleaseDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(date));
}

export async function getLatestVersionInfo(): Promise<VersionInfo> {
    try {
        const tagsResponse = await fetch(GITHUB_TAGS_URL, {
            headers: {
                Accept: "application/vnd.github+json",
                "User-Agent": "icarus-home",
            },
            next: { revalidate: 3600 },
        });

        if (!tagsResponse.ok) {
            throw new Error(`GitHub tags request failed with ${tagsResponse.status}`);
        }

        const tags = (await tagsResponse.json()) as GitHubTag[];
        const latestTag = tags
            .map(parseTag)
            .filter((tag): tag is ParsedTag => tag !== null)
            .sort(compareTags)[0];

        if (!latestTag) {
            return fallbackVersionInfo;
        }

        const commitResponse = await fetch(latestTag.commitUrl, {
            headers: {
                Accept: "application/vnd.github+json",
                "User-Agent": "icarus-home",
            },
            next: { revalidate: 3600 },
        });

        if (!commitResponse.ok) {
            throw new Error(
                `GitHub commit request failed with ${commitResponse.status}`
            );
        }

        const commit = (await commitResponse.json()) as GitHubCommit;

        return {
            ...fallbackVersionInfo,
            version: latestTag.normalized,
            released: formatReleaseDate(commit.commit.committer.date),
        };
    } catch {
        return fallbackVersionInfo;
    }
}
