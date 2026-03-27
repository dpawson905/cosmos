// ===== ISS Types =====
export type ISSPosition = {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  timestamp: number;
};

// ===== Launch Types (Launch Library 2) =====
export type Launch = {
  id: string;
  name: string;
  net: string;
  status: { id: number; name: string; abbrev: string };
  rocket: { configuration: { name: string; full_name: string } };
  pad: { name: string; location: { name: string } };
  mission: { name: string; description: string; type: string } | null;
  image: { thumbnail_url: string; image_url: string } | null;
  webcast_live: boolean;
  vidURLs: Array<{ url: string; title: string }> | null;
};

// ===== Starlink Types =====
export type StarlinkSat = {
  id: string;
  version: string | null;
  launch: string | null;
  longitude: number | null;
  latitude: number | null;
  height_km: number | null;
  velocity_kms: number | null;
  spaceTrack: {
    OBJECT_NAME: string;
    DECAY_DATE: string | null;
  } | null;
};

// ===== Solar Weather Types =====
export type SolarFlare = {
  flrID: string;
  classType: string;
  beginTime: string;
  peakTime: string;
  endTime: string;
  sourceLocation: string;
  activeRegionNum: number | null;
  linkedEvents: Array<{ activityID: string }> | null;
  link: string;
};

export type CMEEvent = {
  activityID: string;
  startTime: string;
  sourceLocation: string;
  note: string;
  cmeAnalyses: Array<{
    speed: number;
    type: string;
    latitude: number;
    longitude: number;
    halfAngle: number;
  }> | null;
  link: string;
};

export type GeoStorm = {
  gstID: string;
  startTime: string;
  allKpIndex: Array<{ observedTime: string; kpIndex: number; source: string }>;
  linkedEvents: Array<{ activityID: string }> | null;
  link: string;
};

// ===== API Functions =====

export async function fetchISSPosition(): Promise<ISSPosition> {
  const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
  if (!res.ok) throw new Error(`ISS API error: ${res.status}`);
  return res.json();
}

const LL2_BASE = "https://ll.thespacedevs.com/2.3.0";

export async function fetchLaunches(
  mode: "previous" | "upcoming" = "previous",
  limit: number = 50
): Promise<{ results: Launch[]; count: number }> {
  const res = await fetch(`${LL2_BASE}/launches/${mode}/?limit=${limit}&ordering=${mode === "upcoming" ? "net" : "-net"}`);
  if (!res.ok) throw new Error(`Launch Library error: ${res.status}`);
  return res.json();
}

export async function fetchStarlink(): Promise<StarlinkSat[]> {
  const res = await fetch("https://api.spacexdata.com/v4/starlink");
  if (!res.ok) throw new Error(`SpaceX Starlink API error: ${res.status}`);
  return res.json();
}

const NASA_API_KEY = process.env.NASA_API_KEY!;

export async function fetchSolarFlares(
  startDate: string,
  endDate: string
): Promise<SolarFlare[]> {
  const params = new URLSearchParams({
    startDate,
    endDate,
    api_key: NASA_API_KEY,
  });
  const res = await fetch(`https://api.nasa.gov/DONKI/FLR?${params}`);
  if (!res.ok) throw new Error(`DONKI FLR error: ${res.status}`);
  return res.json();
}

export async function fetchCMEs(
  startDate: string,
  endDate: string
): Promise<CMEEvent[]> {
  const params = new URLSearchParams({
    startDate,
    endDate,
    api_key: NASA_API_KEY,
  });
  const res = await fetch(`https://api.nasa.gov/DONKI/CME?${params}`);
  if (!res.ok) throw new Error(`DONKI CME error: ${res.status}`);
  return res.json();
}

export async function fetchGeoStorms(
  startDate: string,
  endDate: string
): Promise<GeoStorm[]> {
  const params = new URLSearchParams({
    startDate,
    endDate,
    api_key: NASA_API_KEY,
  });
  const res = await fetch(`https://api.nasa.gov/DONKI/GST?${params}`);
  if (!res.ok) throw new Error(`DONKI GST error: ${res.status}`);
  return res.json();
}
