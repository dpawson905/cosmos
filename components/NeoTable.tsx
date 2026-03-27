"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { NeoObject } from "@/lib/nasa";
import NeoOrbitalMap from "./NeoOrbitalMap";

type SortKey = "name" | "diameter" | "velocity" | "distance" | "hazardous" | "date";
type SortDir = "asc" | "desc";

function formatDate(offset: number): string {
  return new Date(Date.now() + offset * 86400000).toISOString().split("T")[0];
}

function flattenNeos(data: Record<string, NeoObject[]>): NeoObject[] {
  return Object.values(data).flat();
}

function getSortValue(neo: NeoObject, key: SortKey): number | string {
  const approach = neo.close_approach_data[0];
  switch (key) {
    case "name":
      return neo.name;
    case "diameter":
      return neo.estimated_diameter.meters.estimated_diameter_max;
    case "velocity":
      return parseFloat(approach?.relative_velocity.kilometers_per_hour ?? "0");
    case "distance":
      return parseFloat(approach?.miss_distance.lunar ?? "0");
    case "hazardous":
      return neo.is_potentially_hazardous_asteroid ? 1 : 0;
    case "date":
      return approach?.close_approach_date ?? "";
  }
}

export default function NeoTable() {
  const [startDate, setStartDate] = useState(formatDate(0));
  const [endDate, setEndDate] = useState(formatDate(7));
  const [neos, setNeos] = useState<NeoObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("distance");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const fetchNeos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });
      const res = await fetch(`/api/neo?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNeos(flattenNeos(data.near_earth_objects));
    } catch {
      setError("Failed to load NEO data. Ensure the date range is max 7 days.");
      setNeos([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchNeos();
  }, [fetchNeos]);

  const sorted = useMemo(() => {
    return [...neos].sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      const cmp = typeof aVal === "string" ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [neos, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const hazardousCount = neos.filter((n) => n.is_potentially_hazardous_asteroid).length;

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div className="space-y-4">
      {/* Date Range */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="form-control">
          <label className="label text-xs">Start Date</label>
          <input
            type="date"
            className="input input-bordered input-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label className="label text-xs">End Date</label>
          <input
            type="date"
            className="input input-bordered input-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Orbital Map */}
      {!loading && neos.length > 0 && <NeoOrbitalMap neos={neos} />}

      {/* Summary Stats */}
      {!loading && neos.length > 0 && (
        <div className="stats stats-vertical sm:stats-horizontal shadow bg-base-200 w-full">
          <div className="stat">
            <div className="stat-title">Total Objects</div>
            <div className="stat-value text-primary">{neos.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Potentially Hazardous</div>
            <div className="stat-value text-error">{hazardousCount}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Safe</div>
            <div className="stat-value text-success">{neos.length - hazardousCount}</div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-warning">
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Table */}
      {!loading && sorted.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className="cursor-pointer" onClick={() => handleSort("name")}>
                  Name{sortIndicator("name")}
                </th>
                <th className="cursor-pointer" onClick={() => handleSort("diameter")}>
                  Diameter (m){sortIndicator("diameter")}
                </th>
                <th className="cursor-pointer" onClick={() => handleSort("hazardous")}>
                  Hazard{sortIndicator("hazardous")}
                </th>
                <th className="cursor-pointer" onClick={() => handleSort("date")}>
                  Close Approach{sortIndicator("date")}
                </th>
                <th className="cursor-pointer" onClick={() => handleSort("distance")}>
                  Miss Distance (lunar){sortIndicator("distance")}
                </th>
                <th className="cursor-pointer" onClick={() => handleSort("velocity")}>
                  Velocity (km/h){sortIndicator("velocity")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((neo) => {
                const approach = neo.close_approach_data[0];
                const diamMin = neo.estimated_diameter.meters.estimated_diameter_min.toFixed(1);
                const diamMax = neo.estimated_diameter.meters.estimated_diameter_max.toFixed(1);
                return (
                  <tr key={neo.id} className="hover">
                    <td>
                      <a
                        href={neo.nasa_jpl_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary"
                      >
                        {neo.name}
                      </a>
                    </td>
                    <td>{diamMin} – {diamMax}</td>
                    <td>
                      {neo.is_potentially_hazardous_asteroid ? (
                        <span className="badge badge-error badge-sm">Hazardous</span>
                      ) : (
                        <span className="badge badge-success badge-sm">Safe</span>
                      )}
                    </td>
                    <td>{approach?.close_approach_date}</td>
                    <td>{parseFloat(approach?.miss_distance.lunar ?? "0").toFixed(2)}</td>
                    <td>{parseFloat(approach?.relative_velocity.kilometers_per_hour ?? "0").toFixed(0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && neos.length === 0 && (
        <div className="text-center py-12 text-base-content/50">
          <p className="text-4xl mb-2">☄️</p>
          <p>No near-Earth objects found for this date range.</p>
        </div>
      )}
    </div>
  );
}
