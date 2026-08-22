import {
  markdownSiblingPath,
  readAgentContent,
} from "@/app/lib/agentContent";
import { absoluteUrl } from "@/app/seo";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

function responseHeaders(canonicalPath: string, status: number) {
  const alternatePath = markdownSiblingPath(canonicalPath);

  return {
    "Cache-Control":
      status === 404
        ? "public, max-age=0, s-maxage=300"
        : "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    "Content-Type": "text/markdown; charset=utf-8",
    Link: `<${absoluteUrl(canonicalPath)}>; rel="canonical", <${alternatePath}>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"`,
    Vary: "Accept, Accept-Encoding",
    "X-Content-Type-Options": "nosniff",
  };
}

async function markdownResponse(request: Request, context: RouteContext) {
  const { path = [] } = await context.params;
  const pathname = `/${path.join("/")}`;
  const content = await readAgentContent(pathname);

  return new Response(request.method === "HEAD" ? null : content.body, {
    status: content.status,
    headers: responseHeaders(content.canonicalPath, content.status),
  });
}

export async function GET(request: Request, context: RouteContext) {
  return markdownResponse(request, context);
}

export async function HEAD(request: Request, context: RouteContext) {
  return markdownResponse(request, context);
}
