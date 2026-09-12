import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { CACHE_TAGS } from "@/lib/data-provider";

// Helper to get secret from environment
async function getRevalidationSecret(): Promise<string | undefined> {
  // 1. Cloudflare Workers native env in workerd
  try {
    const workers = await import("cloudflare:workers");
    if (workers?.env?.REVALIDATE_SECRET) {
      return workers.env.REVALIDATE_SECRET;
    }
  } catch {
    // Ignore if not running in workerd
  }

  // 2. process.env fallback
  if (typeof process !== "undefined" && process.env.REVALIDATE_SECRET) {
    return process.env.REVALIDATE_SECRET;
  }

  return undefined;
}

async function handleRevalidation(req: NextRequest) {
  const serverSecret = await getRevalidationSecret();

  // Extract secret from Authorization header, query parameter, or JSON body
  const authHeader = req.headers.get("authorization");
  const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
  const querySecret = req.nextUrl.searchParams.get("secret");

  let bodySecret: string | null = null;
  let requestedTag: string | null = req.nextUrl.searchParams.get("tag");
  let requestedPath: string | null = req.nextUrl.searchParams.get("path");

  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (body && typeof body === "object") {
        if (body.secret) bodySecret = String(body.secret);
        if (body.tag) requestedTag = String(body.tag);
        if (body.path) requestedPath = String(body.path);
      }
    } catch {
      // Body may be empty or not JSON
    }
  }

  const providedSecret = bearerSecret || querySecret || bodySecret;

  // Validate secret if configured
  if (serverSecret && (!providedSecret || providedSecret !== serverSecret)) {
    return NextResponse.json({ error: "Invalid or missing revalidation secret" }, { status: 401 });
  }

  const revalidatedTags: string[] = [];

  const triggerRevalidateTag = (tag: string) => {
    (revalidateTag as (t: string, p?: any) => void)(tag);
  };

  if (requestedTag && requestedTag !== "all") {
    triggerRevalidateTag(requestedTag);
    revalidatedTags.push(requestedTag);
  } else {
    // Default: revalidate all primary dataset tags
    triggerRevalidateTag(CACHE_TAGS.STOCKS);
    triggerRevalidateTag(CACHE_TAGS.SCREENER);
    triggerRevalidateTag(CACHE_TAGS.META);
    revalidatedTags.push(CACHE_TAGS.STOCKS, CACHE_TAGS.SCREENER, CACHE_TAGS.META);
  }

  if (requestedPath) {
    revalidatePath(requestedPath);
  } else {
    revalidatePath("/", "layout");
  }

  return NextResponse.json({
    revalidated: true,
    tags: revalidatedTags,
    path: requestedPath || "/",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    return await handleRevalidation(req);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Revalidation failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    return await handleRevalidation(req);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Revalidation failed" },
      { status: 500 }
    );
  }
}
