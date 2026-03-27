import SolarDashboard from "@/components/SolarDashboard";

export default function SolarPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-3xl font-bold">Solar Weather</h1>
      <p className="text-base-content/60">
        Solar flares, coronal mass ejections, and geomagnetic storm tracking from NASA DONKI.
      </p>
      <SolarDashboard />
    </div>
  );
}
