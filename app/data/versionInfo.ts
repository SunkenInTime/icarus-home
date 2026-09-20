export type PlatformInfo = {
    url: string;
    size: string;
    preferredLabel?: string;
    preferredReason?: string;
    secondaryUrl?: string;
    secondaryLabel?: string;
};

export type VersionInfo = {
    version: string;
    released: string;
    platforms: {
        windows: PlatformInfo;
        mac: PlatformInfo;
        linux: PlatformInfo;
    };
};

const versionInfo: VersionInfo = {
    version: "4.6.2",
    released: "September 20, 2026",
    platforms: {
        windows: {
            url: "https://github.com/SunkenInTime/icarus/releases/latest/download/icarus-setup.exe",
            size: "115 MB",
            preferredLabel: "Installer",
            preferredReason: "Preferred for faster updates than the Microsoft Store.",
            secondaryUrl:
                "https://apps.microsoft.com/detail/9PBWHHZRQFW6?hl=en-us&gl=US&ocid=pdpshare",
            secondaryLabel: "Microsoft Store",
        },
        mac: { url: "https://example.com/mac", size: "123 MB" },
        linux: { url: "https://example.com/linux", size: "123 MB" },
    },
};

export default versionInfo;
