import { NextResponse } from "next/server";
import { fetchISSPosition } from "@/lib/space";
import { cachedFetch } from "@/lib/cache";
import { checkRateLimit } from "@/lib/api-utils";

export async function GET(request: Request) {
  // ISS is polled frequently — stricter rate limit
  const limited = checkRateLimit(request, 120); // 120 req/min
  if (limited) return limited;

  try {
    // Cache for 2 seconds — all concurrent users share one upstream call
    // With 3s client polling, upstream sees at most 1 req per 2s regardless of user count
    const data = await cachedFetch("iss:position", 2000, fetchISSPosition);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch ISS position";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
