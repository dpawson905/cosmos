import { NextResponse } from "next/server";
import { fetchSolarFlares, fetchCMEs, fetchGeoStorms } from "@/lib/space";
import { cachedFetch } from "@/lib/cache";
import { checkRateLimit, isValidDate } from "@/lib/api-utils";

export async function GET(request: Request) {
  const limited = checkRateLimit(request);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const endDate = searchParams.get("end_date") ?? new Date().toISOString().split("T")[0];
    const startDate =
      searchParams.get("start_date") ??
      new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }

    // Enforce max 60-day range
    const diffDays = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000;
    if (diffDays < 0 || diffDays > 60) {
      return NextResponse.json({ error: "Date range must be 0-60 days." }, { status: 400 });
    }

    const cacheKey = `solar:${startDate}:${endDate}`;
    // Solar data updates infrequently — cache 15 minutes
    const data = await cachedFetch(cacheKey, 15 * 60 * 1000, async () => {
      const [flares, cmes, storms] = await Promise.all([
        fetchSolarFlares(startDate, endDate),
        fetchCMEs(startDate, endDate),
        fetchGeoStorms(startDate, endDate),
      ]);
      return { flares, cmes, storms };
    });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch solar data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
