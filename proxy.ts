import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  canonicalAgentPath,
  hasAgentContent,
  markdownSiblingPath,
} from "@/app/lib/agentContent";
import {
  appendVaryAccept,
  preferredContentType,
} from "@/app/lib/contentNegotiation";

function isDocumentRequest(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }

  const pathname = request.nextUrl.pathname;
  if (pathname.endsWith(".md")) {
    return true;
  }

  const lastSegment = pathname.split("/").at(-1) ?? "";
  return !lastSegment.includes(".");
}

function agentLinks(pathname: string) {
  const links = [`</llms.txt>; rel="describedby"`];

  if (hasAgentContent(pathname)) {
    links.unshift(
      `<${markdownSiblingPath(pathname)}>; rel="alternate"; type="text/markdown"`,
    );
  }

  return links.join(", ");
}

function markdownRewrite(request: NextRequest) {
  const url = request.nextUrl.clone();
  const canonicalPath = canonicalAgentPath(url.pathname);
  url.pathname = `/api/agent-markdown${canonicalPath === "/" ? "" : canonicalPath}`;

  const response = NextResponse.rewrite(url);
  appendVaryAccept(response.headers);
  response.headers.set("Link", agentLinks(canonicalPath));
  return response;
}

export function proxy(request: NextRequest) {
  if (!isDocumentRequest(request)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.endsWith(".md")) {
    return markdownRewrite(request);
  }

  const acceptHeader = request.headers.get("accept");
  const preferred = preferredContentType(acceptHeader);

  if (preferred === "text/markdown") {
    return markdownRewrite(request);
  }

  if (preferred === null && acceptHeader) {
    return new Response(
      "Not Acceptable\n\nAvailable: text/html, text/markdown\n",
      {
        status: 406,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          Link: agentLinks(request.nextUrl.pathname),
          Vary: "Accept, Accept-Encoding",
        },
      },
    );
  }

  const response = NextResponse.next();
  appendVaryAccept(response.headers);
  response.headers.set("Link", agentLinks(request.nextUrl.pathname));
  return response;
}

export const config = {
  matcher: ["/((?!api/|_next/|_vercel/).*)"],
};
