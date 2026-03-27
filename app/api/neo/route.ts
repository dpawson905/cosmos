import { NextResponse } from "next/server";
import { fetchNeoFeed } from "@/lib/nasa";
import { cachedFetch } from "@/lib/cache";
import { checkRateLimit, isValidDate } from "@/lib/api-utils";

export async function GET(request: Request) {
  const limited = checkRateLimit(request);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

    const startDate = searchParams.get("start_date") ?? today;
    const endDate = searchParams.get("end_date") ?? nextWeek;

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }

    // Enforce max 7-day range (NASA API limit)
    const diffDays = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000;
    if (diffDays < 0 || diffDays > 7) {
      return NextResponse.json({ error: "Date range must be 0-7 days." }, { status: 400 });
    }

    const cacheKey = `neo:${startDate}:${endDate}`;
    // NEO data updates infrequently — cache 15 minutes
    const data = await cachedFetch(cacheKey, 15 * 60 * 1000, () =>
      fetchNeoFeed(startDate, endDate)
    );
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch NEO data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
