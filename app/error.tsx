"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-6">
      <span className="text-5xl">💥</span>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-base-content/60 text-center max-w-md">
        {error.message || "An unexpected error occurred."}
      </p>
      <button className="btn btn-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
