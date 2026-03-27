import NeoTable from "@/components/NeoTable";

export default function NeoPage() {
  return (
    <div className="p-4 pt-14 lg:pt-4 md:p-6 space-y-4">
      <h1 className="text-3xl font-bold">Near Earth Objects</h1>
      <p className="text-base-content/60">
        Track asteroids and near-Earth objects. Data from NASA&apos;s NeoWs API.
      </p>
      <NeoTable />
    </div>
  );
}
