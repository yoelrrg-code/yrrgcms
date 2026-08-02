"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

export interface GalleryImage {
  url: string;
  alt: string;
}

export interface ImageGalleryProps {
  paddingTop?: string;
  paddingBottom?: string;
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
}

export default function ImageGallery({
  paddingTop,
  paddingBottom,
  images,
  columns = 3,
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i + 1) % images.length
    );
  }, [images.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length
    );
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  const colClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 4
      ? "grid-cols-2 sm:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3";

  const lightboxContent =
    lightboxIndex !== null ? (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Image lightbox"
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 p-4 sm:p-8 backdrop-blur-md animate-in fade-in duration-300"
        onClick={closeLightbox}
      >
        {/* Main image container */}
        <div
          className="relative flex flex-col items-center justify-center max-h-[85vh] max-w-6xl w-full h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].alt || `Image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Caption */}
          {images[lightboxIndex].alt && (
            <p className="mt-3 text-center text-sm font-medium text-slate-200 bg-black/60 px-4 py-1.5 rounded-full max-w-lg backdrop-blur-sm">
              {images[lightboxIndex].alt}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={closeLightbox}
          className="absolute right-6 top-6 z-[100000] rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Close lightbox"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Prev / Next buttons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-[100000] rounded-full bg-white/10 p-3.5 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-[100000] rounded-full bg-white/10 p-3.5 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Next image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100000] rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md tracking-wider">
          {lightboxIndex + 1} / {images.length}
        </div>
      </div>
    ) : null;

  return (
    <>
      <section className={`${paddingTop || "pt-12"} ${paddingBottom || "pb-12"} py-16 px-6`}>
        <div className="mx-auto max-w-6xl">
          <div className={`grid gap-4 ${colClass}`}>
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                data-aos="zoom-in"
                data-aos-delay={(idx % columns) * 100}
                className="group relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2"
                aria-label={`Open image: ${img.alt || `Image ${idx + 1}`}`}
              >
                <div className="relative aspect-square">
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes={
                      columns === 4
                        ? "(max-width: 640px) 50vw, 25vw"
                        : columns === 2
                        ? "50vw"
                        : "(max-width: 640px) 50vw, 33vw"
                    }
                  />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox rendered via React Portal at document.body level */}
      {mounted && lightboxContent ? createPortal(lightboxContent, document.body) : null}
    </>
  );
}
