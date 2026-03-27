"use client";

import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { StarlinkSat } from "@/lib/space";
import EarthGlobe from "./EarthGlobe";
import { useSidebar } from "./SidebarContext";

function SatelliteCloud({ satellites }: { satellites: StarlinkSat[] }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const valid = satellites.filter(
      (s) => s.latitude != null && s.longitude != null && s.height_km != null
    );
    const pos = new Float32Array(valid.length * 3);
    const col = new Float32Array(valid.length * 3);

    const activeColor = new THREE.Color("#00e676");
    const decayColor = new THREE.Color("#ef5350");

    valid.forEach((sat, i) => {
      const lat = sat.latitude!;
      const lon = sat.longitude!;
      const alt = sat.height_km!;
      const radius = 5 + (alt / 6371) * 15;
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      pos[i * 3] = -radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.cos(phi);
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const isDecayed = sat.spaceTrack?.DECAY_DATE != null;
      const c = isDecayed ? decayColor : activeColor;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    });

    return { positions: pos, colors: col };
  }, [satellites]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.01;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}

export default function StarlinkMap() {
  const [satellites, setSatellites] = useState<StarlinkSat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/starlink");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setSatellites(data);
      } catch {
        setError("Failed to load Starlink data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeCount = satellites.filter(
    (s) => s.latitude != null && s.spaceTrack?.DECAY_DATE == null
  ).length;
  const totalWithPosition = satellites.filter((s) => s.latitude != null).length;

  const { widthPx } = useSidebar();

  return (
      <div className="overflow-hidden" style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: `${widthPx}px`, background: "radial-gradient(ellipse at center, #0a1628 0%, #000 100%)", transition: "left 0.3s ease-in-out" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <Canvas camera={{ position: [12, 5, 8], fov: 50 }}>
            {/* Lighting provided by EarthGlobe's sun */}
            <Stars radius={100} depth={50} count={1500} factor={3} fade speed={0.2} />
            <Suspense fallback={null}>
              <EarthGlobe />
            </Suspense>
            <SatelliteCloud satellites={satellites} />
            <OrbitControls enablePan={false} minDistance={7} maxDistance={30} autoRotate autoRotateSpeed={0.3} />
          </Canvas>
        )}

        {/* HUD */}
        <div style={{ position: "absolute", top: 12, left: 12, fontFamily: "monospace", fontSize: 11, color: "rgba(0,230,118,0.9)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", borderRadius: 6, padding: "8px 12px", border: "1px solid rgba(0,230,118,0.2)", pointerEvents: "none" }}>
          <div style={{ fontSize: 9, opacity: 0.5, marginBottom: 4 }}>STARLINK CONSTELLATION</div>
          <div>TOTAL: <span style={{ color: "#00e676" }}>{satellites.length.toLocaleString()}</span></div>
          <div>ACTIVE: <span style={{ color: "#00e676" }}>{activeCount.toLocaleString()}</span></div>
          <div>TRACKED: <span style={{ color: "#00e676" }}>{totalWithPosition.toLocaleString()}</span></div>
        </div>

        <div style={{ position: "absolute", bottom: 12, right: 12, fontFamily: "monospace", fontSize: 9, color: "rgba(0,230,118,0.3)", pointerEvents: "none" }}>
          DRAG TO ORBIT · SCROLL TO ZOOM
        </div>

        <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 12, fontFamily: "monospace", fontSize: 10, pointerEvents: "none" }}>
          <span style={{ color: "#00e676" }}>● Active</span>
          <span style={{ color: "#ef5350" }}>● Decayed</span>
        </div>

        {error && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "#ef5350", fontFamily: "monospace" }}>
            ⚠ {error}
          </div>
        )}
      </div>
  );
}
