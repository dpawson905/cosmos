export default function AboutPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">About COSMOS</h1>

      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">What is COSMOS?</h2>
          <p className="text-base-content/70 leading-relaxed">
            COSMOS is a space exploration dashboard powered by NASA&apos;s open
            APIs. Browse the Astronomy Picture of the Day, explore Mars through
            rover cameras, view Earth from deep space via the EPIC camera, and
            track near-Earth asteroids in real time.
          </p>
        </div>
      </div>

      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">NASA Open APIs</h2>
          <p className="text-base-content/70 leading-relaxed">
            All data and imagery are provided by{" "}
            <a
              href="https://api.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary"
            >
              NASA&apos;s Open APIs
            </a>
            . This site is not affiliated with or endorsed by NASA. The APIs
            used include:
          </p>
          <ul className="list-disc list-inside text-base-content/70 space-y-1 mt-2">
            <li>
              <strong>APOD</strong> — Astronomy Picture of the Day
            </li>
            <li>
              <strong>Mars Rover Photos</strong> — Curiosity, Opportunity, Spirit
            </li>
            <li>
              <strong>EPIC</strong> — Earth Polychromatic Imaging Camera
            </li>
            <li>
              <strong>NeoWs</strong> — Near Earth Object Web Service
            </li>
          </ul>
        </div>
      </div>

      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Tech Stack</h2>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="badge badge-primary">Next.js 16</span>
            <span className="badge badge-secondary">React 19</span>
            <span className="badge badge-accent">TypeScript</span>
            <span className="badge badge-neutral">Tailwind CSS v4</span>
            <span className="badge badge-info">daisyUI 5</span>
          </div>
        </div>
      </div>

      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Themes</h2>
          <p className="text-base-content/70 leading-relaxed">
            COSMOS features four space-inspired themes. Click the 🎨
            button in the bottom-right corner to switch between:
          </p>
          <ul className="list-disc list-inside text-base-content/70 space-y-1 mt-2">
            <li>🌌 <strong>Blue Nebula</strong> — Light, cool blues &amp; greens</li>
            <li>⚡ <strong>Red Giant</strong> — Dark, warm red intensity</li>
            <li>🔥 <strong>Deep Orbit</strong> — Dark, warm orange &amp; navy</li>
            <li>🏛️ <strong>Lunar Base</strong> — Light, steel precision</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
