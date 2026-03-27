# COSMOS — NASA Space-Themed Website

## Overview

A space-themed website built on NASA's open APIs, featuring Star Wars-inspired faction themes, a collapsible sidebar navigation, and rich visual content from space imagery to asteroid tracking. Built with Next.js 16.2.1, Tailwind CSS v4, daisyUI 5, React 19, and TypeScript.

## Tech Stack

- **Framework**: Next.js 16.2.1 (App Router)
- **Styling**: Tailwind CSS v4 + daisyUI 5
- **Language**: TypeScript (strict mode)
- **React**: 19.2.4
- **APIs**: NASA Open APIs (APOD, Mars Rover Photos, EPIC, NeoWs)
- **API Key**: Stored in `.env` as `NASA_API_KEY` (server-side only, never exposed to client)

## Architecture

### Data Flow

```
NASA API <-- Route Handlers (app/api/) <-- Server Components (initial load)
                                        <-- Client Components (interactive fetching)
```

### Server Side (Secure)

- **Route Handlers** at `app/api/apod/route.ts`, `app/api/mars/route.ts`, `app/api/epic/route.ts`, `app/api/neo/route.ts`
- Each handler reads `process.env.NASA_API_KEY`, calls the NASA API, and returns JSON
- Server Components fetch from these internal routes for initial page loads

### Client Side (Interactive)

- Client components fetch from the internal `/api/*` routes (not directly from NASA)
- Used for: theme switcher FAB, gallery filters, NEO date picker, sortable table, sidebar active state
- Theme state persisted in `localStorage`

## Themes

Four custom daisyUI themes defined via `@plugin "daisyui/theme"` blocks in `globals.css`. All use OKLch color space. Switched via `data-theme` attribute on `<html>`.

### Jedi Order (Light Theme)

- **color-scheme**: light
- **Primary**: Blue lightsaber (#4fc3f7 equivalent in OKLch)
- **Secondary**: Green lightsaber (#00e676)
- **Accent**: Gold (#ffd740)
- **Base**: Soft blue-white (#e8f0fe → white)
- **Vibe**: Calm, luminous, heroic

### Sith Empire (Dark Theme)

- **color-scheme**: dark
- **Primary**: Red lightsaber (#ef5350)
- **Secondary**: Deep orange (#ff7043)
- **Accent**: Gold (#ffd740)
- **Base**: Black-red void (#0a0408)
- **Vibe**: Menacing glow, raw power

### Rebel Alliance (Dark Theme)

- **color-scheme**: dark
- **Primary**: Warm orange (#ff8a65 — Rebel insignia color)
- **Secondary**: Blue (#4fc3f7)
- **Accent**: Gold (#ffd740)
- **Base**: Navy deep space (#0a1020)
- **Vibe**: Scrappy, warm, hopeful against darkness

### Galactic Empire (Light Theme)

- **color-scheme**: light
- **Primary**: Steel blue-gray (#607d8b)
- **Secondary**: Green console (#00e676)
- **Accent**: Cool gray (#90a4ae)
- **Base**: Clean gray-steel (#f0f0f0 → white)
- **Vibe**: Cold efficiency, utilitarian precision

### Default Theme

- **Jedi Order** (light) set as `--default`
- **Rebel Alliance** (dark) set as `--prefersdark` (applied when system prefers dark mode)
- FAB selection overrides both CSS defaults via `localStorage`

## Theme Switcher (FAB Speed Dial)

A floating action button in the bottom-right corner of every page.

### Behavior

1. **Collapsed state**: 🎨 gradient FAB button (56px circle), bottom-right fixed position
2. **Click to expand**: Button rotates, icon changes to ✕. Four faction options fan upward with staggered animation
3. **Each option**: Circular icon button with faction color glow + text label to the left
4. **Backdrop**: Semi-transparent overlay dims the page behind the speed dial
5. **Selection**: Clicking a faction sets `data-theme` on `<html>` and saves to `localStorage`
6. **Close**: Click ✕ or click outside the speed dial
7. **Persistence**: On mount, reads `localStorage` for saved theme; falls back to CSS defaults

### Faction Icons

- Jedi Order: ⚔️ (blue glow)
- Sith Empire: ⚡ (red glow)
- Rebel Alliance: 🔥 (orange glow)
- Galactic Empire: 🏛️ (gray border)

## Layout

### Sidebar Navigation

Full sidebar with icons + text labels, always visible on desktop.

- **Width**: ~200px
- **Logo**: "✦ COSMOS" at top in primary color
- **Nav items**: Icon + label, active item highlighted with primary color background + border
- **Mobile**: Collapses to a bottom tab bar with icons only
- **Breakpoint**: `lg` (1024px) — below this, switch to bottom tabs

### Page Structure

```
<html data-theme="...">
  <body>
    <div class="flex h-screen">
      <aside> <!-- Sidebar, hidden on mobile --> </aside>
      <main class="flex-1 overflow-y-auto">
        <!-- Page content -->
      </main>
      <nav> <!-- Bottom tab bar, visible only on mobile --> </nav>
      <ThemeFAB /> <!-- Fixed position, always visible -->
    </div>
  </body>
</html>
```

## Pages

### Home Page (`app/page.tsx`)

- **APOD Hero**: Full-width image from NASA APOD API with title overlay, date, and explanation text below
- **Quick Stats Row**: Three stat cards showing:
  - Number of NEOs this week (from NeoWs)
  - Mars Rover photo count for latest sol
  - Latest EPIC Earth image date
- **Section Links**: Cards linking to Gallery, NEOs, and About pages
- **Data**: Server Component fetches APOD + summary stats on initial load

### Gallery Page (`app/gallery/page.tsx`)

- **Tab Filter**: Two tabs — "Mars Rover" and "EPIC Earth"
- **Mars Rover Tab**:
  - Rover selector (Curiosity, Opportunity, Spirit)
  - Camera filter dropdown
  - Sol (Martian day) number input or Earth date picker
  - Responsive image grid (CSS grid, auto-fill columns)
  - Click image → lightbox modal with full-size image + metadata
  - Pagination (NASA API returns 25 per page)
- **EPIC Earth Tab**:
  - Date picker for available dates
  - Grid of Earth images for selected date
  - Each image shows enhanced color version
  - Click → lightbox with image + caption
- **Data**: Server Component for initial load, Client Component for filter changes

### Near Earth Objects Page (`app/neo/page.tsx`)

- **Date Range Picker**: Start/end date inputs, default to current week
- **Summary Stats**: Total count, closest approach, largest object
- **Sortable Table**: Columns:
  - Name (linked to NASA JPL page)
  - Estimated diameter (min-max in meters)
  - Relative velocity (km/h)
  - Miss distance (in lunar distances for intuition)
  - Hazard level badge (potentially hazardous = red `badge-error`, safe = green `badge-success`)
- **Data**: Server Component for initial week, Client Component for date range changes

### About Page (`app/about/page.tsx`)

- **Site Description**: What COSMOS is and its purpose
- **NASA API Credits**: Required attribution with links to api.nasa.gov
- **Tech Stack**: Brief mention of Next.js, daisyUI, Tailwind
- **Static page**: No API calls needed

## File Structure

```
app/
  layout.tsx              # Root layout with sidebar + theme provider
  page.tsx                # Home page (APOD hero + stats)
  globals.css             # Tailwind imports + 4 daisyUI theme definitions
  gallery/
    page.tsx              # Gallery page
  neo/
    page.tsx              # Near Earth Objects page
  about/
    page.tsx              # About page
  api/
    apod/route.ts         # APOD endpoint proxy
    mars/route.ts         # Mars Rover Photos proxy
    epic/route.ts         # EPIC Earth imagery proxy
    neo/route.ts          # NeoWs proxy
components/
  Sidebar.tsx             # Sidebar navigation (server component wrapper + client active state)
  BottomTabs.tsx          # Mobile bottom tab bar
  ThemeFAB.tsx            # Floating action button theme switcher
  ImageLightbox.tsx       # Modal lightbox for gallery images
  MarsGallery.tsx         # Client component for Mars Rover filtering
  EpicGallery.tsx         # Client component for EPIC Earth images
  NeoTable.tsx            # Client component for NEO sortable table + date picker
  StatCard.tsx            # Reusable stat card component
lib/
  nasa.ts                 # NASA API helper functions (server-side)
  themes.ts               # Theme constants and types
```

## API Route Details

### `/api/apod` (GET)

- Proxies to `https://api.nasa.gov/planetary/apod`
- Query params: `date` (optional, defaults to today)
- Returns: `{ title, explanation, url, hdurl, date, media_type }`

### `/api/mars` (GET)

- Proxies to `https://api.nasa.gov/mars-photos/api/v1/rovers/{rover}/photos`
- Query params: `rover` (curiosity|opportunity|spirit), `sol` or `earth_date`, `camera` (optional), `page`
- Returns: `{ photos: [{ img_src, earth_date, camera, rover }] }`

### `/api/epic` (GET)

- Proxies to `https://api.nasa.gov/EPIC/api/natural/date/{date}`
- Query params: `date` (YYYY-MM-DD)
- Returns: array of `{ identifier, caption, image, date }` with constructed image URLs

### `/api/neo` (GET)

- Proxies to `https://api.nasa.gov/neo/rest/v1/feed`
- Query params: `start_date`, `end_date` (max 7 day range)
- Returns: `{ element_count, near_earth_objects: { [date]: [...] } }`

## Component Details

### ThemeFAB (Client Component)

- Uses `useState` for open/closed state
- Reads/writes `localStorage` key `cosmos-theme`
- Sets `document.documentElement.dataset.theme` on change
- Staggered animation on open using CSS transitions with incremental `transition-delay`
- Backdrop click handler to close
- Four faction buttons with glowing border in faction color

### ImageLightbox (Client Component)

- DaisyUI `modal` component
- Shows full-size image, title, date, description
- Close on backdrop click or ✕ button
- Keyboard: Escape to close

### MarsGallery (Client Component)

- Rover selector (daisyUI `select`)
- Camera filter (daisyUI `select`)
- Sol input (daisyUI `input`) or Earth date picker
- Fetches from `/api/mars` on filter change
- Renders responsive grid of images
- Click → opens ImageLightbox

### NeoTable (Client Component)

- Date range inputs (daisyUI `input` type="date")
- Fetches from `/api/neo` on date change
- Sortable column headers (click to sort)
- DaisyUI `table` with `badge` components for hazard levels
- Summary stats row above table

## Error Handling

- API route handlers return appropriate HTTP status codes on NASA API failures
- Client components show daisyUI `alert` components on fetch errors
- Loading states use daisyUI `skeleton` components
- If APOD returns a video (media_type: "video"), embed as iframe instead of image

## Responsive Design

- **Desktop (lg+)**: Full sidebar + main content area
- **Tablet (md)**: Sidebar collapses, bottom tabs appear
- **Mobile (sm)**: Bottom tab bar, single column layouts, smaller image grids
- Gallery grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- NEO table: Horizontally scrollable on mobile

## Performance Considerations

- NASA APOD images can be large — use Next.js `<Image>` component with proper sizing
- Mars Rover API returns 25 photos per page — implement pagination
- NEO feed limited to 7-day range by NASA — enforce in UI
- Consider caching API responses with Next.js route handler `revalidate` options
