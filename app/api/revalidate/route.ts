import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { resetMemoryCache, CACHE_TAGS } from "@/lib/data-provider";

function isAuthorized(request: NextRequest): boolean {
  const secret =
    process.env.REVALIDATION_SECRET ||
    (globalThis as any)?.env?.REVALIDATION_SECRET ||
    (globalThis as any)?.REVALIDATION_SECRET;

  // In production, require a secret token
  const authHeader = request.headers.get("x-revalidate-secret") || "";
  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const querySecret = request.nextUrl.searchParams.get("secret") || "";

  const providedToken = authHeader || bearerToken || querySecret;

  if (secret) {
    return providedToken === secret;
  }

  // If no secret configured in non-production, allow access for testing
  const isDev = process.env.NODE_ENV !== "production";
  return isDev;
}

async function handleRevalidation(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing revalidation secret token" },
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  let tagsToRevalidate: string[] = [];
  let pathsToRevalidate: string[] = [];

  // 1. Read query parameters
  const queryTag = searchParams.get("tag");
  const queryTags = searchParams.get("tags");
  const queryPath = searchParams.get("path");
  const queryPaths = searchParams.get("paths");
  const code = searchParams.get("code");

  if (queryTag) tagsToRevalidate.push(queryTag);
  if (queryTags) tagsToRevalidate.push(...queryTags.split(",").map((t) => t.trim()));
  if (queryPath) pathsToRevalidate.push(queryPath);
  if (queryPaths) pathsToRevalidate.push(...queryPaths.split(",").map((p) => p.trim()));
  if (code) tagsToRevalidate.push(CACHE_TAGS.stock(code));

  // 2. Read JSON body if POST request
  if (request.method === "POST") {
    try {
      const body = await request.json().catch(() => null);
      if (body && typeof body === "object") {
        if (typeof body.tag === "string") tagsToRevalidate.push(body.tag);
        if (Array.isArray(body.tags)) tagsToRevalidate.push(...body.tags);
        if (typeof body.path === "string") pathsToRevalidate.push(body.path);
        if (Array.isArray(body.paths)) pathsToRevalidate.push(...body.paths);
        if (typeof body.code === "string") tagsToRevalidate.push(CACHE_TAGS.stock(body.code));
      }
    } catch {
      // Ignore JSON parsing errors
    }
  }

  // Deduplicate
  tagsToRevalidate = Array.from(new Set(tagsToRevalidate.filter(Boolean)));
  pathsToRevalidate = Array.from(new Set(pathsToRevalidate.filter(Boolean)));

  // Default to invalidating all market stocks and meta if nothing specified
  if (tagsToRevalidate.length === 0 && pathsToRevalidate.length === 0) {
    tagsToRevalidate = [CACHE_TAGS.STOCKS, CACHE_TAGS.SCREENER, CACHE_TAGS.META];
  }

  // Execute tag revalidations
  const revalidatedTags: string[] = [];
  for (const tag of tagsToRevalidate) {
    try {
      revalidateTag(tag);
      resetMemoryCache(tag);
      revalidatedTags.push(tag);
    } catch (err: any) {
      console.error(`[revalidate] Failed to revalidate tag '${tag}':`, err);
    }
  }

  // Execute path revalidations
  const revalidatedPaths: string[] = [];
  for (const path of pathsToRevalidate) {
    try {
      revalidatePath(path);
      revalidatedPaths.push(path);
    } catch (err: any) {
      console.error(`[revalidate] Failed to revalidate path '${path}':`, err);
    }
  }

  return NextResponse.json({
    revalidated: true,
    revalidatedTags,
    revalidatedPaths,
    timestamp: new Date().toISOString(),
  });
}

export async function GET(request: NextRequest) {
  return handleRevalidation(request);
}

export async function POST(request: NextRequest) {
  return handleRevalidation(request);
}
