# COSMOS - Space Exploration Dashboard

A real-time space exploration dashboard powered by NASA, SpaceX, and other space APIs. Features 3D globe visualizations, live ISS tracking, Starlink constellation mapping, solar weather monitoring, and more.

## Features

- **Home** - NASA Astronomy Picture of the Day (APOD) hero with daily space imagery
- **Gallery** - 3D perspective carousel browsing 140,000+ NASA images (Mars, Earth, Deep Space, ISS)
- **Near Earth Objects** - Interactive 3D asteroid tracker with real orbital data, sortable hazard table
- **ISS Live Tracker** - Real-time 3D ISS tracking with NASA's official ISS model, smooth interpolation, proportional orbit
- **Starlink Constellation** - 3,000+ Starlink satellites plotted on a 3D globe from real orbital data
- **SpaceX Launches** - Live launch timeline with countdown timers from Launch Library 2
- **Solar Weather** - Solar flare timeline, CME events, geomagnetic storm tracking with animated sun

### Visual Features

- 4 Star Wars-inspired themes (Jedi Order, Sith Empire, Rebel Alliance, Galactic Empire) via FAB speed dial
- Real sun position calculated from UTC time (accurate day/night terminator)
- NASA Blue Marble 4K Earth texture on all 3D globes
- Fresnel atmosphere rim glow shader
- Responsive sidebar (collapsible on desktop, drawer on mobile)

## Tech Stack

- **Next.js 16** (App Router, Server Components, Route Handlers)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** + **daisyUI 5**
- **React Three Fiber** + **drei** (3D visualizations)
- **Three.js** (WebGL)

## APIs Used

| API | Auth | Used For |
|-----|------|----------|
| [NASA APOD](https://api.nasa.gov/) | API Key | Astronomy Picture of the Day |
| [NASA Image Library](https://images.nasa.gov/) | None | Image gallery search |
| [NASA NeoWs](https://api.nasa.gov/) | API Key | Near-Earth asteroid data |
| [NASA DONKI](https://api.nasa.gov/) | API Key | Solar flares, CMEs, geomagnetic storms |
| [Where The ISS At](https://wheretheiss.at/) | None | Real-time ISS position |
| [Launch Library 2](https://thespacedevs.com/) | None | Rocket launch data |
| [SpaceX API](https://github.com/r-spacex/SpaceX-API) | None | Starlink satellite orbital data |

## Quick Start (Docker)

Pull and run the pre-built image from GitHub Container Registry:

```bash
docker run -d \
  -p 3000:3000 \
  -e NASA_API_KEY=your_key_here \
  --name cosmos \
  ghcr.io/dpawson905/cosmos:latest
```

Then open http://localhost:3000

### Docker Compose

```yaml
services:
  cosmos:
    image: ghcr.io/dpawson905/cosmos:latest
    ports:
      - "3000:3000"
    environment:
      - NASA_API_KEY=your_key_here
    restart: unless-stopped
```

### Portainer

1. Go to **Stacks** > **Add Stack**
2. Paste the docker-compose above
3. Set `NASA_API_KEY` in the environment variables
4. Deploy

## Development

```bash
# Install dependencies
npm install

# Create .env file
echo 'NASA_API_KEY="your_key_here"' > .env

# Run dev server
npm run dev
```

Get a free NASA API key at https://api.nasa.gov/

## Building from Source

```bash
# Build Docker image
docker build --build-arg NASA_API_KEY=your_key -t cosmos .

# Run
docker run -d -p 3000:3000 -e NASA_API_KEY=your_key cosmos
```

## Security

- NASA API key is **server-side only** (never exposed to client)
- All API routes have **in-memory caching** (multiple users share one upstream call)
- **Rate limiting** per IP on all routes (60 req/min default)
- **Input validation** on all query parameters (dates, pagination, mode params)
- Image domains restricted to specific hostnames (no wildcards)

## GitHub Actions

Pushing to `main` automatically builds and publishes a Docker image to `ghcr.io/dpawson905/cosmos:latest`. Set `NASA_API_KEY` as a repository secret.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NASA_API_KEY` | Yes | Free API key from https://api.nasa.gov/ |

## License

MIT
