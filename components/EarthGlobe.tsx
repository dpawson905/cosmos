"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

/**
 * Calculate the real sun direction based on current UTC time.
 * Returns a unit vector pointing from Earth toward the Sun.
 *
 * The subsolar point (where sun is directly overhead):
 *   Longitude = (12.0 - UTC_hours) * 15°
 *   Latitude  = solar declination (~23.44° * sin(2π * (dayOfYear - 81) / 365))
 */
function getRealSunDirection(): THREE.Vector3 {
  const now = new Date();
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

  // Day of year
  const start = new Date(now.getUTCFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);

  // Solar declination (approximate)
  const declination = 23.44 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));

  // Subsolar point
  const subsolarLat = declination;
  const subsolarLon = (12.0 - utcHours) * 15;

  // Convert to 3D direction vector (same coordinate system as our lat/lon→vec3)
  const phi = (90 - subsolarLat) * (Math.PI / 180);
  const theta = (subsolarLon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  ).normalize();
}

function Sun({ radius: earthRadius = 5 }: { radius?: number }) {
  const coronaRef = useRef<THREE.Mesh>(null);
  // Real sun is 109x Earth's diameter. We show it much smaller for aesthetics
  // but place it in the correct direction.
  const sunSize = earthRadius * 1.2;
  const [sunDir, setSunDir] = useState(() => new THREE.Vector3(1, 0.3, -0.5).normalize());
  useEffect(() => { setSunDir(getRealSunDirection()); }, []);
  const sunPos = sunDir.clone().multiplyScalar(earthRadius * 10);

  useFrame((state) => {
    if (coronaRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
      coronaRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[sunPos.x, sunPos.y, sunPos.z]}>
      <mesh>
        <sphereGeometry args={[sunSize, 32, 32]} />
        <meshBasicMaterial color="#fff5e0" />
      </mesh>
      <mesh ref={coronaRef} scale={1.6}>
        <sphereGeometry args={[sunSize, 32, 32]} />
        <meshBasicMaterial color="#ffb300" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <mesh scale={3}>
        <sphereGeometry args={[sunSize, 16, 16]} />
        <meshBasicMaterial color="#ff8f00" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function TexturedEarth({ radius, rotationSpeed }: { radius: number; rotationSpeed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture("/earth-map.jpg");

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * rotationSpeed;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={0.65} metalness={0.05} />
    </mesh>
  );
}

export default function EarthGlobe({
  radius = 5,
  rotationSpeed = 0.02,
  showSun = true,
}: {
  radius?: number;
  rotationSpeed?: number;
  showSun?: boolean;
}) {
  const [sunDir, setSunDir] = useState(() => new THREE.Vector3(1, 0.3, -0.5).normalize());
  useEffect(() => { setSunDir(getRealSunDirection()); }, []);
  const sunLightPos = sunDir.clone().multiplyScalar(radius * 8);

  return (
    <group>
      {showSun && <Sun radius={radius} />}

      {/* Key light from real sun direction */}
      <directionalLight
        color="#fff5e0"
        intensity={2.5}
        position={[sunLightPos.x, sunLightPos.y, sunLightPos.z]}
      />

      {/* Fill light from opposite side so dark side is visible */}
      <directionalLight
        color="#4a6a9a"
        intensity={0.8}
        position={[-sunLightPos.x, -sunLightPos.y, -sunLightPos.z]}
      />

      {/* Ambient so nothing is pure black */}
      <ambientLight intensity={0.3} color="#2a3a5a" />

      {/* Earth — useTexture suspends until loaded */}
      <TexturedEarth radius={radius} rotationSpeed={rotationSpeed} />

      {/* Atmosphere rim (Fresnel glow) */}
      <mesh scale={1.015}>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          uniforms={{ glowColor: { value: new THREE.Color("#4fc3f7") } }}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 glowColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
              vec3 viewDir = normalize(-vPosition);
              float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
              rim = pow(rim, 3.0);
              gl_FragColor = vec4(glowColor, rim * 0.4);
            }
          `}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Outer atmosphere halo */}
      <mesh scale={1.06}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color="#4fc3f7" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
