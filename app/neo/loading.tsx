export default function NeoLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-4 w-80" />
      <div className="flex gap-3">
        <div className="skeleton h-10 w-36" />
        <div className="skeleton h-10 w-36" />
      </div>
      <div className="skeleton h-24 w-full" />
      <div className="skeleton h-64 w-full" />
    </div>
  );
}
