const NASA_API_KEY = process.env.NASA_API_KEY!;
const NASA_BASE = "https://api.nasa.gov";
const NASA_IMAGES_BASE = "https://images-api.nasa.gov";

// ===== APOD Types =====
export type ApodData = {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  date: string;
  media_type: "image" | "video";
  copyright?: string;
};

// ===== NASA Image Library Types =====
export type NasaImageItem = {
  nasa_id: string;
  title: string;
  description: string;
  date_created: string;
  keywords: string[];
  media_type: string;
  thumb: string;
  href: string;
};

export type NasaImageSearchResult = {
  items: NasaImageItem[];
  total_hits: number;
  next_page: string | null;
};

// ===== NEO Types =====
export type NeoEstimatedDiameter = {
  estimated_diameter_min: number;
  estimated_diameter_max: number;
};

export type NeoCloseApproach = {
  close_approach_date: string;
  relative_velocity: { kilometers_per_hour: string };
  miss_distance: { kilometers: string; lunar: string };
};

export type NeoObject = {
  id: string;
  name: string;
  nasa_jpl_url: string;
  estimated_diameter: { meters: NeoEstimatedDiameter; kilometers: NeoEstimatedDiameter };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: NeoCloseApproach[];
};

export type NeoFeed = {
  element_count: number;
  near_earth_objects: Record<string, NeoObject[]>;
};

// ===== API Functions =====

export async function fetchApod(date?: string): Promise<ApodData> {
  const params = new URLSearchParams({ api_key: NASA_API_KEY });
  if (date) params.set("date", date);

  const res = await fetch(`${NASA_BASE}/planetary/apod?${params}`);
  if (!res.ok) throw new Error(`APOD API error: ${res.status}`);
  return res.json();
}

export async function searchNasaImages(
  query: string,
  page: number = 1,
  mediaType: string = "image",
  pageSize: number = 24
): Promise<NasaImageSearchResult> {
  const params = new URLSearchParams({
    q: query,
    media_type: mediaType,
    page: String(page),
    page_size: String(pageSize),
  });

  const res = await fetch(`${NASA_IMAGES_BASE}/search?${params}`);
  if (!res.ok) throw new Error(`NASA Images API error: ${res.status}`);
  const data = await res.json();

  const collection = data.collection;
  const items: NasaImageItem[] = (collection.items ?? []).map(
    (item: { data: Array<{ nasa_id: string; title: string; description: string; date_created: string; keywords?: string[]; media_type: string }>; links?: Array<{ href: string }> }) => {
      const meta = item.data[0];
      const thumb = item.links?.[0]?.href ?? "";
      return {
        nasa_id: meta.nasa_id,
        title: meta.title,
        description: meta.description ?? "",
        date_created: meta.date_created,
        keywords: meta.keywords ?? [],
        media_type: meta.media_type,
        thumb,
        href: thumb.replace(/~thumb|~small/, "~orig"),
      };
    }
  );

  const nextLink = collection.links?.find(
    (l: { rel: string }) => l.rel === "next"
  );

  return {
    items,
    total_hits: collection.metadata?.total_hits ?? items.length,
    next_page: nextLink?.href ?? null,
  };
}

export async function fetchNeoFeed(
  startDate: string,
  endDate: string
): Promise<NeoFeed> {
  const params = new URLSearchParams({
    api_key: NASA_API_KEY,
    start_date: startDate,
    end_date: endDate,
  });

  const res = await fetch(`${NASA_BASE}/neo/rest/v1/feed?${params}`);
  if (!res.ok) throw new Error(`NEO API error: ${res.status}`);
  return res.json();
}
