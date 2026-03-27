import { NextResponse } from "next/server";
import { fetchLaunches } from "@/lib/space";
import { cachedFetch } from "@/lib/cache";
import { checkRateLimit, clamp } from "@/lib/api-utils";

export async function GET(request: Request) {
  const limited = checkRateLimit(request, 30); // 30 req/min (LL2 is strict)
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("mode") ?? "previous";
    const mode = raw === "upcoming" ? "upcoming" : "previous"; // Allowlist
    const limit = clamp(Number(searchParams.get("limit") ?? 30), 1, 100);

    const cacheKey = `launches:${mode}:${limit}`;
    // Launch data changes slowly — cache 5 minutes
    const data = await cachedFetch(cacheKey, 5 * 60 * 1000, () =>
      fetchLaunches(mode, limit)
    );
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch launches";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
