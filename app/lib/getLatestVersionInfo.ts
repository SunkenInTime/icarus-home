import fallbackVersionInfo, { VersionInfo } from "@/app/data/versionInfo";

type GitHubTag = {
    name: string;
};

type GitHubRepository = {
    pushed_at: string;
};

type ParsedTag = {
    normalized: string;
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
};

const GITHUB_REPO_URL =
    "https://api.github.com/repos/SunkenInTime/icarus";

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

async function fetchGitHubJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "icarus-home",
        },
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        throw new Error(`GitHub request failed with ${response.status}`);
    }

    return (await response.json()) as T;
}

async function getLatestVersion(): Promise<string | null> {
    try {
        const tags = await fetchGitHubJson<GitHubTag[]>(GITHUB_TAGS_URL);
        const latestTag = tags
            .map(parseTag)
            .filter((tag): tag is ParsedTag => tag !== null)
            .sort(compareTags)[0];

        return latestTag?.normalized ?? null;
    } catch {
        return null;
    }
}

async function getLastUpdateDate(): Promise<string | null> {
    try {
        const repository = await fetchGitHubJson<GitHubRepository>(GITHUB_REPO_URL);

        return formatReleaseDate(repository.pushed_at);
    } catch {
        return null;
    }
}

export async function getLatestVersionInfo(): Promise<VersionInfo> {
    const [version, released] = await Promise.all([
        getLatestVersion(),
        getLastUpdateDate(),
    ]);

    return {
        ...fallbackVersionInfo,
        version: version ?? fallbackVersionInfo.version,
        released: released ?? fallbackVersionInfo.released,
    };
}
