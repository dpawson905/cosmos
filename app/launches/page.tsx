import LaunchTimeline from "@/components/LaunchTimeline";

export default function LaunchesPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-3xl font-bold">SpaceX Launches</h1>
      <p className="text-base-content/60">
        Complete launch history and upcoming missions from SpaceX.
      </p>
      <LaunchTimeline />
    </div>
  );
}
