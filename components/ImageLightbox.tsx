"use client";

import { useEffect, useCallback, useState } from "react";

type ImageLightboxProps = {
  src: string;
  fallbackSrc?: string;
  alt: string;
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ImageLightbox({
  src,
  fallbackSrc,
  alt,
  title,
  description,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setImgSrc(src);
    setLoading(true);
  }, [src]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open z-50" onClick={onClose}>
      <div
        className="modal-box max-w-5xl w-full p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          ✕
        </button>
        {loading && (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={alt}
          className={`w-full ${loading ? "hidden" : ""}`}
          onLoad={() => setLoading(false)}
          onError={() => {
            if (fallbackSrc && imgSrc !== fallbackSrc) {
              setImgSrc(fallbackSrc);
            } else {
              setLoading(false);
            }
          }}
        />
        {(title || description) && (
          <div className="p-4">
            {title && <h3 className="font-bold text-lg">{title}</h3>}
            {description && (
              <p className="text-sm text-base-content/70 mt-1">{description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
