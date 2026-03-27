# COSMOS Expansion — 4 New Space Features

## Overview

Adding four new pages to COSMOS, each powered by free public APIs (no additional API keys needed beyond the existing NASA key). All features follow the existing Star Wars faction theme system and sidebar navigation pattern.

## New Pages

### 1. ISS Live Tracker (`/iss`)

**API**: `https://api.wheretheiss.at/v1/satellites/25544` (no auth, free)

**Visual**: 3D globe using React Three Fiber (already installed) showing the ISS position in real-time.

**Components**:
- `components/ISSTracker.tsx` — Client component, main 3D scene
  - Earth sphere with a simple color gradient (blue/green, no texture file needed)
  - ISS represented as a glowing dot with a label
  - Ground track: trail of the last ~90 minutes of positions (one full orbit)
  - Polls API every 5 seconds, animates position smoothly between updates
  - OrbitControls for camera drag/zoom
  - Starfield background (reuse Stars from drei)

**HUD Overlay**:
- Latitude / Longitude
- Altitude (km)
- Velocity (km/h)
- Daylight status (sun/shadow icon)
- Timestamp of last update

**Data Flow**:
- Route handler `app/api/iss/route.ts` proxies to wheretheiss.at
- Client component polls `/api/iss` every 5 seconds
- Position history stored in client state (last ~200 points for trail)

**File Structure**:
```
app/iss/page.tsx
app/api/iss/route.ts
components/ISSTracker.tsx
```

---

### 2. SpaceX Launches (`/launches`)

**API**: `https://api.spacexdata.com/v4/launches` (no auth, free)

**Visual**: Vertical timeline with mission patches, stats dashboard at top.

**Components**:
- `components/LaunchTimeline.tsx` — Client component
  - Fetches all launches from `/api/launches`
  - Vertical timeline with alternating left/right cards
  - Each card: mission patch image (from `links.patch.small`), name, date, rocket name, success/fail badge
  - Upcoming launches: highlighted border, countdown timer showing days/hours until launch
  - Click to expand: payload info, launchpad, webcast YouTube link, crew names
  - Filter tabs: All / Upcoming / Successful / Failed
  - Infinite scroll or pagination

- `components/LaunchStats.tsx` — Stats bar at top
  - Total launches count
  - Success rate percentage
  - Next upcoming launch with countdown

**Data Flow**:
- Route handler `app/api/launches/route.ts` fetches from SpaceX API
- Can query `/v4/launches` for all, `/v4/launches/upcoming` for future
- Rocket names resolved via `links` in response or separate `/v4/rockets` call

**File Structure**:
```
app/launches/page.tsx
app/api/launches/route.ts
components/LaunchTimeline.tsx
components/LaunchStats.tsx
```

---

### 3. Starlink Constellation Map (`/starlink`)

**API**: `https://api.spacexdata.com/v4/starlink` (no auth, free)

**Visual**: 3D globe with thousands of satellite dots plotted from real orbital data.

**Components**:
- `components/StarlinkMap.tsx` — Client component, 3D scene
  - Earth sphere (same style as ISS tracker)
  - Each Starlink satellite as a small point/particle
  - Use Three.js InstancedMesh or Points for performance (thousands of objects)
  - Satellites positioned from `latitude`/`longitude`/`height_km` fields in API response
  - Color-coded: active satellites in one color, decaying/deorbited in another
  - Slow auto-rotation, OrbitControls for interaction
  - Starfield background

**HUD Overlay**:
- Total satellites
- Active count
- Average altitude

**Performance Note**: The SpaceX API returns ~6000+ Starlink entries. Use Three.js Points geometry (a single draw call) rather than individual meshes. Only plot satellites that have valid position data.

**Data Flow**:
- Route handler `app/api/starlink/route.ts` fetches from SpaceX API
- Large response cached in route handler (revalidate every hour)
- Client fetches once on mount

**File Structure**:
```
app/starlink/page.tsx
app/api/starlink/route.ts
components/StarlinkMap.tsx
```

---

### 4. Solar Weather Dashboard (`/solar`)

**API**: `https://api.nasa.gov/DONKI/FLR`, `https://api.nasa.gov/DONKI/CME`, `https://api.nasa.gov/DONKI/GST` (uses existing NASA_API_KEY)

**Visual**: Animated sun with solar event timeline and severity gauges.

**Components**:
- `components/SolarSun.tsx` — Animated sun visualization (CSS/SVG)
  - Pulsing corona effect using CSS animations and radial gradients
  - Animated "prominences" (wavy tendrils) around the edge
  - Glow intensity changes based on recent flare activity
  - If a recent X-class flare occurred, sun pulses more intensely

- `components/SolarTimeline.tsx` — Client component
  - Fetches solar flares, CMEs, and geomagnetic storms from last 30 days
  - Horizontal scrollable timeline
  - Events as markers: flares (orange/red), CMEs (purple), storms (blue)
  - Click event for detail panel: class, time, source location, linked events
  - Flare class badges: C (yellow), M (orange), X (red/pulsing)

- `components/SpaceWeatherGauge.tsx` — Current conditions
  - Severity meter (like a speedometer gauge)
  - Based on most recent geomagnetic storm Kp index
  - Green (quiet) → Yellow (minor) → Orange (moderate) → Red (severe)
  - Label: "Space Weather: Quiet/Active/Storm"

**Data Flow**:
- Route handler `app/api/solar/route.ts` fetches all three DONKI endpoints
- Combines flares + CMEs + storms into unified timeline
- Uses existing NASA_API_KEY from .env
- Default date range: last 30 days

**File Structure**:
```
app/solar/page.tsx
app/api/solar/route.ts
components/SolarSun.tsx
components/SolarTimeline.tsx
components/SpaceWeatherGauge.tsx
```

---

## Navigation Update

Add 4 new items to both `Sidebar.tsx` and `BottomTabs.tsx`:

| Route | Label | Icon |
|-------|-------|------|
| `/iss` | ISS Live | 🛰️ |
| `/launches` | Launches | 🚀 |
| `/starlink` | Starlink | 🌐 |
| `/solar` | Solar | ☀️ |

## API Helpers Update

Add to `lib/nasa.ts` (or create `lib/space.ts` for non-NASA APIs):
- `fetchISSPosition()` — wheretheiss.at
- `fetchLaunches(type?)` — SpaceX launches
- `fetchStarlink()` — SpaceX Starlink
- `fetchSolarFlares(startDate, endDate)` — NASA DONKI FLR
- `fetchCMEs(startDate, endDate)` — NASA DONKI CME
- `fetchGeoStorms(startDate, endDate)` — NASA DONKI GST

Non-NASA helpers go in `lib/space.ts` to keep concerns separated.

## Implementation Order

1. **Navigation update** — Add all 4 sidebar/tab entries + placeholder pages
2. **ISS Tracker** — Reuses Three.js patterns from NEO map
3. **Starlink Map** — Similar 3D globe, different data
4. **SpaceX Launches** — Standard data + timeline UI
5. **Solar Weather** — Most complex visuals (animated sun)

## No New Dependencies

Everything needed is already installed: React Three Fiber, drei, Three.js. The solar sun animation uses pure CSS/SVG.
