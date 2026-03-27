import { NextResponse } from "next/server";
import { fetchStarlink } from "@/lib/space";
import { cachedFetch } from "@/lib/cache";
import { checkRateLimit } from "@/lib/api-utils";

export async function GET(request: Request) {
  const limited = checkRateLimit(request);
  if (limited) return limited;

  try {
    // Starlink constellation data is huge (~6000 entries) and changes slowly
    // Cache for 1 hour
    const data = await cachedFetch("starlink:all", 60 * 60 * 1000, fetchStarlink);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch Starlink data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
