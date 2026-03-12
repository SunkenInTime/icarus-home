import HomePage from "@/app/components/HomePage";
import { getLatestVersionInfo } from "@/app/lib/getLatestVersionInfo";

export const revalidate = 3600;

export default async function Home() {
    const latestVersion = await getLatestVersionInfo();

    return <HomePage latestVersion={latestVersion} />;
}
