"use client";

import { useEffect } from "react";

/**
 * Suppresses the THREE.Clock deprecation warning from Three.js v0.183+.
 * This is an upstream issue in @react-three/fiber that uses Clock internally.
 * R3F hasn't migrated to Timer yet — this will be fixed in a future R3F release.
 * Remove this component when @react-three/fiber updates to use THREE.Timer.
 */
export default function SuppressThreeWarnings() {
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("THREE.Clock") &&
        args[0].includes("deprecated")
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
