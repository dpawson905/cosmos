"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { NasaImageItem } from "@/lib/nasa";
import ImageLightbox from "./ImageLightbox";

type NasaImageGalleryProps = {
  defaultQuery: string;
  placeholder?: string;
};

function Carousel({
  images,
  onSelect,
}: {
  images: NasaImageItem[];
  onSelect: (img: NasaImageItem) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = images.length;
  const visibleCount = Math.min(total, 11);
  const halfVisible = Math.floor(visibleCount / 2);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % total) + total) % total);
    },
    [total]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        goTo(activeIndex + (e.deltaX > 0 ? 1 : -1));
      } else {
        goTo(activeIndex + (e.deltaY > 0 ? 1 : -1));
      }
    },
    [activeIndex, goTo]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartIndex.current = activeIndex;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX.current;
    const sensitivity = 80;
    const indexDelta = Math.round(-dx / sensitivity);
    goTo(dragStartIndex.current + indexDelta);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(activeIndex - 1);
      if (e.key === "ArrowRight") goTo(activeIndex + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, goTo]);

  const getItemStyle = (offset: number) => {
    const absOffset = Math.abs(offset);
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const spacing = isMobile ? 140 : 220;
    const z = -absOffset * (isMobile ? 40 : 60);
    const x = offset * spacing;
    const rotateY = -offset * 25;
    const scale = Math.max(0.5, 1 - absOffset * 0.12);
    const opacity = Math.max(0.15, 1 - absOffset * 0.18);
    const blur = absOffset > 2 ? (absOffset - 2) * 1.5 : 0;

    return {
      transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      filter: blur > 0 ? `blur(${blur}px)` : "none",
      zIndex: 100 - absOffset,
      transition: isDragging ? "none" : "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    };
  };

  return (
    <div className="relative select-none" style={{ height: "min(420px, 55vh)" }}>
      {/* Carousel viewport */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ perspective: 1200, perspectiveOrigin: "50% 40%" }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Reflection gradient at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 z-50 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, var(--color-base-100, #000) 0%, transparent 100%)",
          }}
        />

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {Array.from({ length: visibleCount }, (_, i) => {
            const offset = i - halfVisible;
            const imageIndex =
              ((activeIndex + offset) % total + total) % total;
            const img = images[imageIndex];
            if (!img) return null;
            const isCenter = offset === 0;

            return (
              <div
                key={`${imageIndex}-${img.nasa_id}`}
                className="absolute"
                style={{
                  ...getItemStyle(offset),
                  width: typeof window !== "undefined" && window.innerWidth < 640 ? 200 : 280,
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className={`
                    relative rounded-lg overflow-hidden
                    ${isCenter ? "ring-2 ring-primary shadow-2xl" : ""}
                  `}
                  style={{
                    boxShadow: isCenter
                      ? "0 0 40px rgba(79,195,247,0.2), 0 20px 60px rgba(0,0,0,0.5)"
                      : "0 10px 30px rgba(0,0,0,0.4)",
                  }}
                >
                  <button
                    className="block w-full"
                    onClick={() => isCenter && onSelect(img)}
                    tabIndex={isCenter ? 0 : -1}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.thumb}
                      alt={img.title}
                      className="w-full aspect-4/3 object-cover"
                      loading="lazy"
                      draggable={false}
                    />

                    {/* HUD overlay on active card */}
                    {isCenter && (
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                        <p className="text-white font-bold text-sm line-clamp-2 drop-shadow-lg">
                          {img.title}
                        </p>
                        <p className="text-white/50 text-xs mt-1 font-mono">
                          {new Date(img.date_created).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs text-primary/80 font-mono tracking-wider">
                            CLICK TO EXPAND
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        className="btn btn-circle btn-ghost btn-sm absolute left-2 top-1/2 -translate-y-1/2 z-50 text-lg opacity-50 hover:opacity-100"
        onClick={() => goTo(activeIndex - 1)}
        aria-label="Previous image"
      >
        ‹
      </button>
      <button
        className="btn btn-circle btn-ghost btn-sm absolute right-2 top-1/2 -translate-y-1/2 z-50 text-lg opacity-50 hover:opacity-100"
        onClick={() => goTo(activeIndex + 1)}
        aria-label="Next image"
      >
        ›
      </button>

      {/* Progress indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 font-mono text-xs text-base-content/40">
        <span>{activeIndex + 1} / {total}</span>
        <span className="text-base-content/20">·</span>
        <span>← → DRAG · SCROLL · KEYS</span>
      </div>
    </div>
  );
}

export default function NasaImageGallery({
  defaultQuery,
  placeholder = "Search NASA images...",
}: NasaImageGalleryProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [searchInput, setSearchInput] = useState(defaultQuery);
  const [page, setPage] = useState(1);
  const [images, setImages] = useState<NasaImageItem[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<NasaImageItem | null>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        q: query,
        page: String(page),
        page_size: "24",
      });
      const res = await fetch(`/api/images?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setImages(data.items ?? []);
      setTotalHits(data.total_hits ?? 0);
    } catch {
      setError("Failed to load images. Please try again.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setQuery(searchInput.trim());
      setPage(1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          className="input input-bordered input-sm flex-1 max-w-md"
          placeholder={placeholder}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Search
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="alert alert-warning">
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Carousel */}
      {!loading && images.length > 0 && (
        <>
          <p className="text-sm text-base-content/50">
            {totalHits.toLocaleString()} results for &ldquo;{query}&rdquo; · Page{" "}
            {page}
          </p>
          <Carousel images={images} onSelect={(img) => setLightbox(img)} />

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <button
              className="btn btn-sm btn-outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous Page
            </button>
            <button
              className="btn btn-sm btn-outline"
              disabled={images.length < 24}
              onClick={() => setPage((p) => p + 1)}
            >
              Next Page
            </button>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && images.length === 0 && (
        <div className="text-center py-12 text-base-content/50">
          <p className="text-4xl mb-2">🔭</p>
          <p>No images found. Try a different search term.</p>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <ImageLightbox
          src={lightbox.href}
          fallbackSrc={lightbox.thumb}
          alt={lightbox.title}
          title={lightbox.title}
          description={lightbox.description?.slice(0, 300)}
          isOpen={!!lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
