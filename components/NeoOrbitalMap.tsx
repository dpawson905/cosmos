"use client";

import { Suspense, useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Trail, Line } from "@react-three/drei";
import * as THREE from "three";
import type { NeoObject } from "@/lib/nasa";
import EarthGlobe from "./EarthGlobe";

type NeoOrbitalMapProps = {
  neos: NeoObject[];
};

function hashAngle(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return ((Math.abs(hash) % 360) * Math.PI) / 180;
}

function hashElevation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 17 + id.charCodeAt(i)) | 0;
  }
  return (((Math.abs(hash) % 100) / 100) - 0.5) * 1.2;
}

// Rotating Earth
// Earth with radius=1 for NEO scale

// Orbit ring
function OrbitRing({
  radius,
  label,
}: {
  radius: number;
  label: string;
}) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  return (
    <group>
      <Line points={points} color="#4fc3f7" transparent opacity={0.08} lineWidth={1} />
      <Html position={[radius + 0.3, 0.3, 0]} center>
        <span
          style={{
            color: "rgba(79,195,247,0.35)",
            fontSize: "10px",
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {label}
        </span>
      </Html>
    </group>
  );
}

// Individual asteroid
function Asteroid({
  neo,
  position,
  size,
  isHazardous,
  onSelect,
  isSelected,
}: {
  neo: NeoObject;
  position: [number, number, number];
  size: number;
  isHazardous: boolean;
  onSelect: (neo: NeoObject | null) => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.z += delta * 0.3;
    }
  });

  const color = isHazardous ? "#ef5350" : "#00e676";
  const emissive = isHazardous ? "#ef5350" : "#00e676";

  return (
    <group position={position}>
      <Trail
        width={hovered || isSelected ? 1.5 : 0.5}
        length={6}
        color={color}
        attenuation={(t) => t * t}
      >
        <mesh
          ref={meshRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(isSelected ? null : neo);
          }}
          scale={hovered ? 1.4 : 1}
        >
          <dodecahedronGeometry args={[size, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={hovered || isSelected ? 1.2 : 0.6}
            roughness={0.4}
          />
        </mesh>
      </Trail>
      {/* Glow */}
      <pointLight
        color={color}
        intensity={isHazardous ? 2 : 0.8}
        distance={size * 8}
      />
      {/* Pulsing ring for hazardous */}
      {isHazardous && <HazardPulse size={size} color={color} />}
    </group>
  );
}

function HazardPulse({ size, color }: { size: number; color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.4;
      ringRef.current.scale.set(scale, scale, scale);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.3 - Math.sin(state.clock.elapsedTime * 3) * 0.15;
    }
  });

  return (
    <mesh ref={ringRef}>
      <ringGeometry args={[size * 1.5, size * 2, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Camera animation when selecting an asteroid
function CameraAnimator({
  target,
}: {
  target: [number, number, number] | null;
}) {
  const { camera } = useThree();
  const targetPos = useRef<THREE.Vector3 | null>(null);

  if (target) {
    targetPos.current = new THREE.Vector3(
      target[0] + 3,
      target[1] + 2,
      target[2] + 3
    );
  }

  useFrame(() => {
    if (targetPos.current) {
      camera.position.lerp(targetPos.current, 0.02);
    }
  });

  return null;
}

// HUD overlay
function HudOverlay({
  neos,
  selected,
  onDeselect,
}: {
  neos: NeoObject[];
  selected: NeoObject | null;
  onDeselect: () => void;
}) {
  const hazardous = neos.filter((n) => n.is_potentially_hazardous_asteroid).length;

  return (
    <>
      {/* Top-left stats */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          fontFamily: "monospace",
          fontSize: 11,
          color: "rgba(79,195,247,0.8)",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
          borderRadius: 6,
          padding: "8px 12px",
          border: "1px solid rgba(79,195,247,0.2)",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: 9, opacity: 0.5, marginBottom: 4 }}>
          NEO TRACKING SYSTEM
        </div>
        <div>OBJECTS: <span style={{ color: "#4fc3f7" }}>{neos.length}</span></div>
        <div>
          HAZARDOUS:{" "}
          <span style={{ color: "#ef5350" }}>{hazardous}</span>
        </div>
      </div>

      {/* Bottom-right controls hint */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          fontFamily: "monospace",
          fontSize: 9,
          color: "rgba(79,195,247,0.4)",
          pointerEvents: "none",
        }}
      >
        DRAG TO ORBIT · SCROLL TO ZOOM · CLICK ASTEROID FOR DETAILS
      </div>

      {/* Selected asteroid detail panel */}
      {selected && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontFamily: "monospace",
            fontSize: 11,
            color: "rgba(255,255,255,0.9)",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(12px)",
            borderRadius: 8,
            padding: "12px 16px",
            border: `1px solid ${selected.is_potentially_hazardous_asteroid ? "rgba(239,83,80,0.4)" : "rgba(0,230,118,0.3)"}`,
            maxWidth: 240,
            cursor: "pointer",
          }}
          onClick={onDeselect}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: "bold",
              marginBottom: 8,
              color: selected.is_potentially_hazardous_asteroid
                ? "#ef5350"
                : "#00e676",
            }}
          >
            {selected.name}
          </div>
          <div style={{ lineHeight: 1.8 }}>
            <div>
              <span style={{ opacity: 0.5 }}>DISTANCE:</span>{" "}
              {parseFloat(
                selected.close_approach_data[0]?.miss_distance.lunar ?? "0"
              ).toFixed(1)}{" "}
              LD
            </div>
            <div>
              <span style={{ opacity: 0.5 }}>DIAMETER:</span>{" "}
              {selected.estimated_diameter.meters.estimated_diameter_min.toFixed(0)}–
              {selected.estimated_diameter.meters.estimated_diameter_max.toFixed(0)}m
            </div>
            <div>
              <span style={{ opacity: 0.5 }}>VELOCITY:</span>{" "}
              {parseFloat(
                selected.close_approach_data[0]?.relative_velocity
                  .kilometers_per_hour ?? "0"
              ).toFixed(0)}{" "}
              km/h
            </div>
            <div>
              <span style={{ opacity: 0.5 }}>APPROACH:</span>{" "}
              {selected.close_approach_data[0]?.close_approach_date}
            </div>
            {selected.is_potentially_hazardous_asteroid && (
              <div
                style={{
                  marginTop: 6,
                  color: "#ef5350",
                  fontSize: 10,
                  letterSpacing: 1,
                }}
              >
                ⚠ POTENTIALLY HAZARDOUS
              </div>
            )}
          </div>
          <div
            style={{ fontSize: 8, opacity: 0.3, marginTop: 8 }}
          >
            CLICK TO DESELECT
          </div>
        </div>
      )}
    </>
  );
}

export default function NeoOrbitalMap({ neos }: NeoOrbitalMapProps) {
  const [selected, setSelected] = useState<NeoObject | null>(null);

  const maxLunar = useMemo(() => {
    if (neos.length === 0) return 10;
    const distances = neos.map((n) =>
      parseFloat(n.close_approach_data[0]?.miss_distance.lunar ?? "0")
    );
    return Math.max(...distances, 1);
  }, [neos]);

  const scaleRadius = useCallback(
    (lunar: number) => {
      return 2 + (lunar / maxLunar) * 14;
    },
    [maxLunar]
  );

  const ringDistances = useMemo(() => {
    const step = Math.ceil(maxLunar / 4);
    const rings: number[] = [];
    for (let d = step; d <= maxLunar; d += step) {
      rings.push(d);
    }
    if (rings.length === 0) rings.push(Math.ceil(maxLunar));
    return rings;
  }, [maxLunar]);

  const asteroids = useMemo(
    () =>
      neos.map((neo) => {
        const lunar = parseFloat(
          neo.close_approach_data[0]?.miss_distance.lunar ?? "0"
        );
        const diamMax = neo.estimated_diameter.meters.estimated_diameter_max;
        const angle = hashAngle(neo.id);
        const elevation = hashElevation(neo.id);
        const r = scaleRadius(lunar);
        const dotSize = Math.max(0.08, Math.min(0.35, Math.log2(diamMax + 1) * 0.04));

        return {
          neo,
          position: [
            r * Math.cos(angle),
            elevation * r * 0.3,
            r * Math.sin(angle),
          ] as [number, number, number],
          size: dotSize,
        };
      }),
    [neos, scaleRadius]
  );

  const selectedPosition = useMemo(() => {
    if (!selected) return null;
    const a = asteroids.find((a) => a.neo.id === selected.id);
    return a?.position ?? null;
  }, [selected, asteroids]);

  if (neos.length === 0) return null;

  return (
    <div className="card bg-base-200 overflow-hidden">
      <div
        style={{
          height: "min(500px, 70vh)",
          background: "radial-gradient(ellipse at center, #0a1628 0%, #000 100%)",
          position: "relative",
        }}
      >
        <Canvas
          camera={{ position: [8, 6, 12], fov: 50 }}
          onClick={() => setSelected(null)}
        >
          {/* Lighting provided by EarthGlobe's sun */}
          {/* Old Earth light removed — sun provides lighting */}

          <Stars
            radius={100}
            depth={50}
            count={3000}
            factor={4}
            saturation={0}
            fade
            speed={0.5}
          />

          <Suspense fallback={null}>
            <EarthGlobe radius={1} rotationSpeed={0.15} />
          </Suspense>

          {/* Orbit rings */}
          {ringDistances.map((d) => (
            <OrbitRing
              key={d}
              radius={scaleRadius(d)}
              label={`${d} LD`}
            />
          ))}

          {/* Asteroids */}
          {asteroids.map(({ neo, position, size }) => (
            <Asteroid
              key={neo.id}
              neo={neo}
              position={position}
              size={size}
              isHazardous={neo.is_potentially_hazardous_asteroid}
              onSelect={setSelected}
              isSelected={selected?.id === neo.id}
            />
          ))}

          <CameraAnimator target={selectedPosition} />

          <OrbitControls
            enablePan={false}
            minDistance={4}
            maxDistance={30}
            autoRotate
            autoRotateSpeed={0.3}
          />
        </Canvas>

        <HudOverlay
          neos={neos}
          selected={selected}
          onDeselect={() => setSelected(null)}
        />
      </div>
    </div>
  );
}
