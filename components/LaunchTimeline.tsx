"use client";

import { useState, useEffect } from "react";
import type { Launch } from "@/lib/space";

function Countdown({ dateUtc }: { dateUtc: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const target = new Date(dateUtc).getTime();
  const diff = target - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <span className="font-mono text-xs text-warning">
      T-{days}d {hours}h {mins}m {secs}s
    </span>
  );
}

function statusColor(abbrev: string): string {
  switch (abbrev) {
    case "Success": return "badge-success";
    case "Failure": return "badge-error";
    case "Go": case "TBD": case "TBC": return "badge-warning";
    case "In Flight": return "badge-info";
    default: return "badge-ghost";
  }
}

function dotColor(abbrev: string): string {
  switch (abbrev) {
    case "Success": return "bg-success border-success";
    case "Failure": return "bg-error border-error";
    case "Go": case "TBD": case "TBC": return "bg-warning border-warning";
    default: return "bg-base-300 border-base-content/20";
  }
}

type Tab = "upcoming" | "previous";

export default function LaunchTimeline() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    setLoading(true);
    setError("");
    setPage(1);
    (async () => {
      try {
        const res = await fetch(`/api/launches?mode=${tab}&limit=30`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setLaunches(data.results ?? []);
      } catch {
        setError("Failed to load launch data");
      } finally {
        setLoading(false);
      }
    })();
  }, [tab]);

  const nextLaunch = tab === "upcoming" ? launches[0] : null;

  return (
    <div className="space-y-4">
      {/* Next launch countdown */}
      {nextLaunch && (
        <div className="card bg-base-200 p-4">
          <div className="text-xs font-mono text-base-content/50 mb-1">NEXT LAUNCH</div>
          <div className="flex items-center gap-3 flex-wrap">
            {nextLaunch.image?.thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={nextLaunch.image.thumbnail_url} alt="" className="w-12 h-12 rounded object-cover" />
            )}
            <div>
              <div className="font-bold">{nextLaunch.name}</div>
              <div className="text-sm text-base-content/60">{nextLaunch.rocket.configuration.name} · {nextLaunch.pad.location.name}</div>
            </div>
            <div className="ml-auto">
              <Countdown dateUtc={nextLaunch.net} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-bordered">
        <button role="tab" className={`tab ${tab === "upcoming" ? "tab-active" : ""}`} onClick={() => setTab("upcoming")}>
          🚀 Upcoming
        </button>
        <button role="tab" className={`tab ${tab === "previous" ? "tab-active" : ""}`} onClick={() => setTab("previous")}>
          📋 Recent
        </button>
      </div>

      {error && <div className="alert alert-warning"><span>{error}</span></div>}

      {loading && (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Timeline */}
      {!loading && launches.length > 0 && (
        <>
        <div className="relative pl-8 border-l-2 border-base-300 space-y-4">
          {launches.slice((page - 1) * perPage, page * perPage).map((launch) => (
            <div key={launch.id} className={`relative card bg-base-200 ${tab === "upcoming" ? "border border-warning/20" : ""}`}>
              <div className={`absolute -left-[25px] top-4 w-4 h-4 rounded-full border-2 ${dotColor(launch.status.name)}`} />

              <div className="card-body p-4 flex-row gap-4 items-start">
                {launch.image?.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={launch.image.thumbnail_url}
                    alt={launch.name}
                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm">{launch.name}</h3>
                    <span className={`badge ${statusColor(launch.status.name)} badge-sm`}>
                      {launch.status.name}
                    </span>
                  </div>
                  <p className="text-xs text-base-content/50 mt-1">
                    {new Date(launch.net).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {tab === "upcoming" && <> · <Countdown dateUtc={launch.net} /></>}
                  </p>
                  <p className="text-xs text-base-content/60 mt-1">
                    {launch.rocket.configuration.name} · {launch.pad.name}
                  </p>
                  {launch.mission?.description && (
                    <p className="text-sm text-base-content/60 mt-2 line-clamp-2">{launch.mission.description}</p>
                  )}
                  {launch.vidURLs && launch.vidURLs.length > 0 && (
                    <a href={launch.vidURLs[0].url} target="_blank" rel="noopener noreferrer" className="link link-primary text-xs mt-2 inline-block">
                      Watch Stream →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {Math.ceil(launches.length / perPage) > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span className="text-sm text-base-content/50">
              Page {page} of {Math.ceil(launches.length / perPage)}
            </span>
            <button className="btn btn-sm btn-outline" disabled={page >= Math.ceil(launches.length / perPage)} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
        </>
      )}

      {!loading && launches.length === 0 && (
        <div className="text-center py-12 text-base-content/50">
          <p className="text-4xl mb-2">🚀</p>
          <p>No launches found.</p>
        </div>
      )}
    </div>
  );
}
