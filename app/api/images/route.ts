import { NextResponse } from "next/server";
import { searchNasaImages } from "@/lib/nasa";
import { cachedFetch } from "@/lib/cache";
import { checkRateLimit, clamp } from "@/lib/api-utils";

export async function GET(request: Request) {
  const limited = checkRateLimit(request);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "space";
    const page = clamp(Number(searchParams.get("page") ?? 1), 1, 200);
    const pageSize = clamp(Number(searchParams.get("page_size") ?? 24), 1, 50);

    const cacheKey = `images:${query}:${page}:${pageSize}`;
    // Image search results don't change often — cache 5 minutes
    const data = await cachedFetch(cacheKey, 5 * 60 * 1000, () =>
      searchNasaImages(query, page, "image", pageSize)
    );
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to search NASA images";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
