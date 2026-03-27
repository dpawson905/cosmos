import { fetchApod } from "@/lib/nasa";
import StatCard from "@/components/StatCard";

export default async function Home() {
  let apod;
  try {
    apod = await fetchApod();
  } catch {
    apod = null;
  }

  return (
    <div className="p-4 pt-14 lg:pt-4 md:p-6 space-y-6">
      {/* APOD Hero */}
      {apod ? (
        <div className="card bg-base-200 overflow-hidden">
          <div className="relative w-full aspect-video bg-black">
            {apod.media_type === "video" ? (
              <iframe
                src={apod.url}
                title={apod.title}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={apod.hdurl || apod.url}
                alt={apod.title}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="card-body">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-primary text-xs uppercase tracking-wider">
                Astronomy Picture of the Day
              </span>
              <span className="text-sm text-base-content/50">{apod.date}</span>
              {apod.copyright && (
                <span className="text-sm text-base-content/50">
                  © {apod.copyright}
                </span>
              )}
            </div>
            <h1 className="card-title text-2xl md:text-3xl">{apod.title}</h1>
            <p className="text-base-content/70 leading-relaxed line-clamp-6">
              {apod.explanation}
            </p>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning">
          <span>Could not load today&apos;s Astronomy Picture of the Day.</span>
        </div>
      )}

      {/* Quick Links / Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon="🔭"
          title="140,000+ NASA Images"
          value="Browse Gallery"
          href="/gallery"
        />
        <StatCard
          icon="☄️"
          title="Asteroid Tracker"
          value="Near Earth Objects"
          href="/neo"
        />
        <StatCard
          icon="🌌"
          title="Mars, Earth, Deep Space & More"
          value="Explore"
          href="/gallery"
        />
      </div>
    </div>
  );
}
