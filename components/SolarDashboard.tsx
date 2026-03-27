"use client";

import { useState, useEffect, useMemo } from "react";
import type { SolarFlare, CMEEvent, GeoStorm } from "@/lib/space";

function SolarSun({ intensity }: { intensity: number }) {
  const glowSize = 120 + intensity * 40;
  const pulseSpeed = 3 - intensity * 0.5;

  return (
    <div className="relative flex items-center justify-center" style={{ height: 280 }}>
      {/* Outer corona */}
      <div
        className="absolute rounded-full"
        style={{
          width: glowSize * 2,
          height: glowSize * 2,
          background: `radial-gradient(circle, rgba(255,167,38,${0.05 + intensity * 0.05}) 0%, rgba(255,87,34,${0.02 + intensity * 0.02}) 40%, transparent 70%)`,
          animation: `pulse ${pulseSpeed}s ease-in-out infinite`,
        }}
      />
      {/* Inner corona */}
      <div
        className="absolute rounded-full"
        style={{
          width: glowSize * 1.3,
          height: glowSize * 1.3,
          background: `radial-gradient(circle, rgba(255,193,7,${0.15 + intensity * 0.1}) 0%, rgba(255,152,0,${0.05 + intensity * 0.05}) 50%, transparent 70%)`,
          animation: `pulse ${pulseSpeed * 0.7}s ease-in-out infinite reverse`,
        }}
      />
      {/* Sun body */}
      <div
        className="relative rounded-full"
        style={{
          width: 100,
          height: 100,
          background: "radial-gradient(circle at 35% 35%, #fff59d, #ffb300, #ff8f00, #e65100)",
          boxShadow: `0 0 30px rgba(255,167,38,0.6), 0 0 60px rgba(255,87,34,${0.3 + intensity * 0.2}), 0 0 100px rgba(255,61,0,${0.1 + intensity * 0.15})`,
        }}
      />
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:0.85} }
      `}</style>
    </div>
  );
}

function SeverityGauge({ kpIndex }: { kpIndex: number }) {
  const level = Math.min(kpIndex, 9);
  const percentage = (level / 9) * 100;
  const color =
    level <= 3 ? "#00e676" : level <= 5 ? "#ffd740" : level <= 7 ? "#ff9100" : "#ef5350";
  const label =
    level <= 3 ? "Quiet" : level <= 5 ? "Active" : level <= 7 ? "Storm" : "Severe Storm";

  return (
    <div className="card bg-base-200 p-4">
      <div className="text-xs font-mono text-base-content/50 mb-2">GEOMAGNETIC ACTIVITY</div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="w-full h-3 bg-base-300 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${percentage}%`, background: `linear-gradient(90deg, #00e676, ${color})` }}
            />
          </div>
          <div className="flex justify-between text-xs text-base-content/30 mt-1 font-mono">
            <span>Kp 0</span>
            <span>Kp 9</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold font-mono" style={{ color }}>
            Kp {level}
          </div>
          <div className="text-xs" style={{ color }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

function FlareClassBadge({ classType }: { classType: string }) {
  const letter = classType.charAt(0);
  const color = letter === "X" ? "badge-error" : letter === "M" ? "badge-warning" : "badge-info";
  return <span className={`badge ${color} badge-sm font-mono`}>{classType}</span>;
}

type SolarEvent = {
  id: string;
  type: "flare" | "cme" | "storm";
  time: string;
  label: string;
  detail: string;
  classType?: string;
  kpIndex?: number;
};

export default function SolarDashboard() {
  const [flares, setFlares] = useState<SolarFlare[]>([]);
  const [cmes, setCmes] = useState<CMEEvent[]>([]);
  const [storms, setStorms] = useState<GeoStorm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/solar");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setFlares(data.flares ?? []);
        setCmes(data.cmes ?? []);
        setStorms(data.storms ?? []);
      } catch {
        setError("Failed to load solar weather data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const timeline = useMemo((): SolarEvent[] => {
    const events: SolarEvent[] = [];
    flares.forEach((f) =>
      events.push({ id: f.flrID, type: "flare", time: f.peakTime, label: `Solar Flare ${f.classType}`, detail: `Source: ${f.sourceLocation || "Unknown"}`, classType: f.classType })
    );
    cmes.forEach((c) =>
      events.push({ id: c.activityID, type: "cme", time: c.startTime, label: "Coronal Mass Ejection", detail: c.cmeAnalyses?.[0] ? `Speed: ${c.cmeAnalyses[0].speed} km/s` : c.note?.slice(0, 80) || "" })
    );
    storms.forEach((s) => {
      const maxKp = Math.max(...(s.allKpIndex?.map((k) => k.kpIndex) ?? [0]));
      events.push({ id: s.gstID, type: "storm", time: s.startTime, label: `Geomagnetic Storm (Kp ${maxKp})`, detail: `Peak Kp: ${maxKp}`, kpIndex: maxKp });
    });
    return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [flares, cmes, storms]);

  const sunIntensity = useMemo(() => {
    const recentFlares = flares.filter(
      (f) => Date.now() - new Date(f.peakTime).getTime() < 7 * 86400000
    );
    if (recentFlares.some((f) => f.classType.startsWith("X"))) return 1;
    if (recentFlares.some((f) => f.classType.startsWith("M"))) return 0.7;
    if (recentFlares.length > 0) return 0.4;
    return 0.1;
  }, [flares]);

  const latestKp = useMemo(() => {
    if (storms.length === 0) return 0;
    const latest = storms.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )[0];
    return Math.max(...(latest.allKpIndex?.map((k) => k.kpIndex) ?? [0]));
  }, [storms]);

  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(timeline.length / perPage);
  const paginatedTimeline = timeline.slice((page - 1) * perPage, page * perPage);

  if (loading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary" /></div>;
  if (error) return <div className="alert alert-warning"><span>{error}</span></div>;

  return (
    <div className="space-y-4">
      {/* Sun visualization */}
      <div className="card bg-base-200 overflow-hidden" style={{ background: "radial-gradient(ellipse at center, #1a0a00 0%, #000 100%)" }}>
        <SolarSun intensity={sunIntensity} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card bg-base-200 p-4 text-center">
          <div className="text-xs font-mono text-base-content/50">FLARES (30d)</div>
          <div className="text-2xl font-bold text-warning">{flares.length}</div>
        </div>
        <div className="card bg-base-200 p-4 text-center">
          <div className="text-xs font-mono text-base-content/50">CMEs (30d)</div>
          <div className="text-2xl font-bold text-secondary">{cmes.length}</div>
        </div>
        <div className="card bg-base-200 p-4 text-center">
          <div className="text-xs font-mono text-base-content/50">GEO STORMS (30d)</div>
          <div className="text-2xl font-bold text-info">{storms.length}</div>
        </div>
      </div>

      <SeverityGauge kpIndex={latestKp} />

      {/* Event Timeline */}
      <h3 className="font-bold text-lg">Recent Space Weather Events</h3>
      {timeline.length === 0 ? (
        <div className="text-center py-8 text-base-content/50">
          <p className="text-3xl mb-2">☀️</p>
          <p>No significant solar events in the last 30 days. Space weather is quiet.</p>
        </div>
      ) : (
        <>
          <div className="relative pl-8 border-l-2 border-base-300 space-y-3">
            {paginatedTimeline.map((event) => (
              <div key={event.id} className="relative card bg-base-200">
                <div className={`absolute -left-[25px] top-4 w-4 h-4 rounded-full border-2 ${
                  event.type === "flare" ? "bg-warning border-warning" :
                  event.type === "cme" ? "bg-secondary border-secondary" :
                  "bg-info border-info"
                }`} />
                <div className="card-body p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{event.label}</span>
                    {event.classType && <FlareClassBadge classType={event.classType} />}
                    <span className="badge badge-ghost badge-sm">
                      {event.type === "flare" ? "☀️ Flare" : event.type === "cme" ? "💥 CME" : "🌀 Storm"}
                    </span>
                  </div>
                  <p className="text-xs text-base-content/50">
                    {new Date(event.time).toLocaleString()} · {event.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span className="text-sm text-base-content/50">
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-sm btn-outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
