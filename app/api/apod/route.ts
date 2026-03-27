import { NextResponse } from "next/server";
import { fetchApod } from "@/lib/nasa";
import { cachedFetch } from "@/lib/cache";
import { checkRateLimit, isValidDate } from "@/lib/api-utils";

export async function GET(request: Request) {
  const limited = checkRateLimit(request);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? undefined;

    if (date && !isValidDate(date)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }

    const cacheKey = `apod:${date ?? "today"}`;
    // APOD changes daily — cache for 10 minutes
    const data = await cachedFetch(cacheKey, 10 * 60 * 1000, () => fetchApod(date));
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch APOD";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
