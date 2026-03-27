"use client";

import { Suspense, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Line, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { ISSPosition } from "@/lib/space";
import EarthGlobe from "./EarthGlobe";
import { useSidebar } from "./SidebarContext";

// === REALISTIC SCALE ===
// Earth radius in scene units = 5
// Real Earth radius = 6,371 km
// 1 scene unit = 1,274.2 km
// ISS at 420km altitude = 0.33 units above surface → radius 5.33
// ISS model is exaggerated ~500x so it's visible (real ISS is 109m = 0.0000855 units)
const EARTH_RADIUS = 5;
const KM_PER_UNIT = 6371 / EARTH_RADIUS; // 1,274.2 km per unit

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function issAltToRadius(altitude: number): number {
  // Exaggerated 3x so the ISS model visually clears the surface
  // Real: 420km = 0.33 units. Displayed: ~1.0 units above surface.
  return EARTH_RADIUS + (altitude / KM_PER_UNIT) * 3;
}

// Interpolate lat/lon between two positions, handling the -180/180 longitude wrap
function lerpPosition(
  from: ISSPosition,
  to: ISSPosition,
  t: number
): { lat: number; lon: number; alt: number } {
  const lat = from.latitude + (to.latitude - from.latitude) * t;

  let dLon = to.longitude - from.longitude;
  if (dLon > 180) dLon -= 360;
  if (dLon < -180) dLon += 360;
  let lon = from.longitude + dLon * t;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;

  const alt = from.altitude + (to.altitude - from.altitude) * t;
  return { lat, lon, alt };
}

function ISSModel() {
  const { scene } = useGLTF("/iss.glb");
  return <primitive object={scene.clone()} />;
}

type InterpolatedPos = { lat: number; lon: number; alt: number };

function ISSMarker({ from, to, fetchTime, interval }: {
  from: ISSPosition;
  to: ISSPosition;
  fetchTime: number;
  interval: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef<THREE.Vector3>(new THREE.Vector3());

  useFrame(() => {
    if (!groupRef.current) return;

    // t goes from 0 to 1 between fetches, then extrapolates beyond 1
    const elapsed = (Date.now() - fetchTime) / 1000;
    const t = Math.min(elapsed / (interval / 1000), 2); // cap at 2x to avoid wild extrapolation

    const { lat, lon, alt } = lerpPosition(from, to, t);
    const r = issAltToRadius(alt);
    const targetPos = latLonToVec3(lat, lon, r);

    // Smooth the 3D position — higher lerp = more responsive tracking
    currentPos.current.lerp(targetPos, 0.3);
    groupRef.current.position.copy(currentPos.current);

    // Orient tangent to Earth
    const up = currentPos.current.clone().normalize();
    const forward = new THREE.Vector3(0, 1, 0).cross(up).normalize();
    const right = up.clone().cross(forward).normalize();
    const m = new THREE.Matrix4().makeBasis(forward, up, right);
    groupRef.current.setRotationFromMatrix(m);
  });

  return (
    <group ref={groupRef}>
      <Suspense fallback={
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ffd740" emissive="#ffd740" emissiveIntensity={2} />
        </mesh>
      }>
        <group scale={0.025}>
          <ISSModel />
        </group>
      </Suspense>
      <pointLight color="#ffd740" intensity={3} distance={4} />
      <Html center distanceFactor={15}>
        <div style={{
          color: "#ffd740",
          fontSize: 10,
          fontFamily: "monospace",
          whiteSpace: "nowrap",
          textShadow: "0 0 8px rgba(255,215,64,0.5)",
          pointerEvents: "none",
          transform: "translateY(-20px)",
        }}>
          ISS
        </div>
      </Html>
    </group>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CameraTracker({ from, to, fetchTime, interval, controlsRef }: {
  from: ISSPosition;
  to: ISSPosition;
  fetchTime: number;
  interval: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(12, 5, 8));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const elapsed = (Date.now() - fetchTime) / 1000;
    const t = Math.min(elapsed / (interval / 1000), 2);
    const { lat, lon, alt } = lerpPosition(from, to, t);
    const r = issAltToRadius(alt);
    const issPos = latLonToVec3(lat, lon, r);

    const dir = issPos.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(dir, up).normalize();

    // Camera hovers behind the ISS — pulled back enough to see Earth curve + ISS
    const camTarget = issPos.clone()
      .add(dir.clone().multiplyScalar(1.5))
      .add(up.clone().multiplyScalar(0.8))
      .add(side.clone().multiplyScalar(0.5));

    targetCamPos.current.lerp(camTarget, 0.02);
    targetLookAt.current.lerp(issPos, 0.04);

    camera.position.lerp(targetCamPos.current, 0.02);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.04);
    }
  });

  return null;
}

function GroundTrack({ trail }: { trail: ISSPosition[] }) {
  const points = useMemo(() => {
    return trail.map((p) => {
      const r = issAltToRadius(p.altitude);
      return latLonToVec3(p.latitude, p.longitude, r);
    });
  }, [trail]);

  if (points.length < 2) return null;
  return <Line points={points} color="#ffd740" transparent opacity={0.4} lineWidth={2} />;
}

function GroundProjection({ position }: { position: InterpolatedPos }) {
  const r = issAltToRadius(position.alt);
  const issPos = latLonToVec3(position.lat, position.lon, r);
  const groundPos = latLonToVec3(position.lat, position.lon, EARTH_RADIUS + 0.01);

  return (
    <Line
      points={[issPos, groundPos]}
      color="#ffd740"
      transparent
      opacity={0.15}
      lineWidth={1}
      dashed
      dashSize={0.2}
      gapSize={0.1}
    />
  );
}

const POLL_INTERVAL = 3000;

export default function ISSTracker() {
  const [positions, setPositions] = useState<ISSPosition[]>([]);
  const [displayPos, setDisplayPos] = useState<InterpolatedPos | null>(null);
  const [trail, setTrail] = useState<ISSPosition[]>([]);
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState(true);
  const [fetchTime, setFetchTime] = useState(Date.now());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  const fetchPosition = useCallback(async () => {
    try {
      const res = await fetch("/api/iss");
      if (!res.ok) throw new Error("Failed");
      const data: ISSPosition = await res.json();
      setPositions((prev) => {
        const next = [...prev.slice(-1), data]; // keep last 2
        return next;
      });
      setTrail((prev) => [...prev.slice(-600), data]);
      setFetchTime(Date.now());
      setError("");
    } catch {
      setError("Failed to fetch ISS position");
    }
  }, []);

  useEffect(() => {
    fetchPosition();
    const interval = setInterval(fetchPosition, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPosition]);

  // Update display position for HUD at 10fps (not every frame)
  useEffect(() => {
    if (positions.length < 2) return;
    const [from, to] = [positions[positions.length - 2], positions[positions.length - 1]];
    const interval = setInterval(() => {
      const elapsed = (Date.now() - fetchTime) / 1000;
      const t = Math.min(elapsed / (POLL_INTERVAL / 1000), 2);
      setDisplayPos(lerpPosition(from, to, t));
    }, 100);
    return () => clearInterval(interval);
  }, [positions, fetchTime]);

  const from = positions.length >= 2 ? positions[positions.length - 2] : positions[0] ?? null;
  const to = positions[positions.length - 1] ?? null;

  const { widthPx } = useSidebar();

  return (
      <div className="overflow-hidden" style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: `${widthPx}px`, background: "radial-gradient(ellipse at center, #0a1628 0%, #000 100%)", transition: "left 0.3s ease-in-out" }}>
        <Canvas camera={{ position: [6, 2, 4], fov: 50 }}>
          <Stars radius={100} depth={50} count={2000} factor={4} fade speed={0.3} />
          <Suspense fallback={null}>
            <EarthGlobe rotationSpeed={0} />
          </Suspense>
          {from && to && (
            <>
              <ISSMarker from={from} to={to} fetchTime={fetchTime} interval={POLL_INTERVAL} />
              <GroundProjection position={displayPos ?? { lat: to.latitude, lon: to.longitude, alt: to.altitude }} />
            </>
          )}
          <GroundTrack trail={trail} />
          {tracking && from && to && (
            <CameraTracker from={from} to={to} fetchTime={fetchTime} interval={POLL_INTERVAL} controlsRef={controlsRef} />
          )}
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={5.5}
            maxDistance={20}
            autoRotate={false}
          />
        </Canvas>

        {/* HUD */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none" style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,215,64,0.9)", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", borderRadius: 6, padding: "8px 12px", border: "1px solid rgba(255,215,64,0.2)" }}>
          <div style={{ fontSize: 9, opacity: 0.5, marginBottom: 4 }}>INTERNATIONAL SPACE STATION</div>
          {displayPos ? (
            <>
              <div>LAT: <span style={{ color: "#ffd740" }}>{displayPos.lat.toFixed(4)}°</span></div>
              <div>LON: <span style={{ color: "#ffd740" }}>{displayPos.lon.toFixed(4)}°</span></div>
              <div>ALT: <span style={{ color: "#ffd740" }}>{displayPos.alt.toFixed(1)} km</span></div>
              <div>VEL: <span style={{ color: "#ffd740" }}>{(to?.velocity ?? 0).toFixed(0)} km/h</span></div>
              <div style={{ marginTop: 4, borderTop: "1px solid rgba(255,215,64,0.15)", paddingTop: 4 }}>
                <span style={{ opacity: 0.5 }}>ORBIT:</span> <span style={{ color: "#ffd740" }}>~92 min</span>
              </div>
              <div><span style={{ opacity: 0.5 }}>ORBITS/DAY:</span> <span style={{ color: "#ffd740" }}>15.5</span></div>
              <div><span style={{ opacity: 0.5 }}>TRAIL:</span> <span style={{ color: "#ffd740" }}>{trail.length} pts</span></div>
            </>
          ) : to ? (
            <>
              <div>LAT: <span style={{ color: "#ffd740" }}>{to.latitude.toFixed(4)}°</span></div>
              <div>LON: <span style={{ color: "#ffd740" }}>{to.longitude.toFixed(4)}°</span></div>
              <div>ALT: <span style={{ color: "#ffd740" }}>{to.altitude.toFixed(1)} km</span></div>
              <div>VEL: <span style={{ color: "#ffd740" }}>{to.velocity.toFixed(0)} km/h</span></div>
            </>
          ) : (
            <div style={{ opacity: 0.5 }}>ACQUIRING SIGNAL...</div>
          )}
        </div>

        {/* Track toggle */}
        <button
          className="absolute top-3 right-3 z-10"
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: tracking ? "rgba(255,215,64,0.9)" : "rgba(255,255,255,0.4)",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${tracking ? "rgba(255,215,64,0.3)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
          }}
          onClick={() => setTracking((t) => !t)}
        >
          {tracking ? "🎯 TRACKING" : "🔓 FREE LOOK"}
        </button>

        <div className="absolute bottom-3 right-3 z-10 pointer-events-none" style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,215,64,0.3)" }}>
          LIVE · PROPORTIONAL ORBIT · REAL SUN POSITION · ISS MODEL ~500x SCALE · {tracking ? "FOLLOWING ISS" : "DRAG TO ORBIT"}
        </div>

        {error && (
          <div className="absolute bottom-3 left-3 z-10" style={{ fontFamily: "monospace", fontSize: 10, color: "#ef5350" }}>
            ⚠ {error}
          </div>
        )}
      </div>
  );
}
