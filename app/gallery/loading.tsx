export default function GalleryLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="skeleton h-8 w-32" />
      <div className="skeleton h-4 w-64" />
      <div className="skeleton h-10 w-full max-w-sm" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  );
}
