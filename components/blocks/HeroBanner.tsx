"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  overlayColor?: string;
}

export interface HeroBannerProps {
  paddingTop?: string;
  paddingBottom?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImage?: string;
  overlayColor?: string;
  slides?: HeroSlide[];
  transitionEffect?: "fade" | "slide" | "zoom";
  autoplaySpeed?: number;
}

export default function HeroBanner({
  paddingTop,
  paddingBottom,
  title = "Welcome to YRRG CMS",
  subtitle,
  ctaText,
  ctaUrl,
  backgroundImage,
  overlayColor,
  slides,
  transitionEffect = "fade",
  autoplaySpeed = 6,
}: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Normalize single slide vs multi-slides
  const activeSlides: HeroSlide[] =
    slides && slides.length > 0
      ? slides
      : [
          {
            title,
            subtitle,
            ctaText,
            ctaUrl,
            backgroundImage,
            overlayColor,
          },
        ];

  // Auto-play interval
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const speedMs = (autoplaySpeed || 6) * 1000;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activeSlides.length);
    }, speedMs);
    return () => clearInterval(interval);
  }, [activeSlides.length, autoplaySpeed]);

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  // Helper to determine slide transition classes
  const getSlideClasses = (idx: number) => {
    const isActive = idx === activeIndex;
    const isPrev = idx < activeIndex;

    const baseClasses = "absolute inset-0 w-full h-full flex items-center justify-center transition-all";

    if (transitionEffect === "slide") {
      return `${baseClasses} duration-700 ease-in-out ${
        isActive
          ? "translate-x-0 opacity-100 z-10 pointer-events-auto"
          : isPrev
          ? "-translate-x-full opacity-0 z-0 pointer-events-none"
          : "translate-x-full opacity-0 z-0 pointer-events-none"
      }`;
    }

    if (transitionEffect === "zoom") {
      return `${baseClasses} duration-1000 ease-out ${
        isActive
          ? "scale-100 opacity-100 z-10 pointer-events-auto"
          : isPrev
          ? "scale-95 opacity-0 z-0 pointer-events-none"
          : "scale-105 opacity-0 z-0 pointer-events-none"
      }`;
    }

    // Default: fade
    return `${baseClasses} duration-1000 ease-in-out ${
      isActive
        ? "opacity-100 z-10 pointer-events-auto"
        : "opacity-0 z-0 pointer-events-none"
    }`;
  };

  return (
    <section
      className={`${paddingTop || "pt-12"} ${
        paddingBottom || "pb-12"
      } relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950`}
    >
      {/* Slides Container */}
      <div className="absolute inset-0 w-full h-full">
        {activeSlides.map((slide, idx) => {
          const overlay = slide.overlayColor ?? "rgba(0, 0, 0, 0.55)";
          const slideClass = getSlideClasses(idx);

          return (
            <div
              key={idx}
              className={slideClass}
              style={{
                backgroundColor: slide.backgroundColor || undefined,
              }}
            >
              {/* Background Image / Gradient Fallback */}
              {slide.backgroundImage ? (
                <Image
                  src={slide.backgroundImage}
                  alt=""
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="100vw"
                />
              ) : (
                !slide.backgroundColor && (
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-br from-slate-900 via-theme-primary to-slate-900"
                  />
                )
              )}

              {/* Overlay */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: overlay }}
              />

              {/* Content Container - only rendered when active so AOS animations run on mount */}
              {activeIndex === idx && (
                <div
                  data-aos="fade-up"
                  data-aos-duration="1000"
                  className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center"
                >
                  <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-50 to-slate-200 sm:text-6xl lg:text-7xl drop-shadow-md">
                    {slide.title}
                  </h1>

                  {slide.subtitle && (
                    <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-200/90 sm:text-xl leading-relaxed font-light drop-shadow">
                      {slide.subtitle}
                    </p>
                  )}

                  {slide.ctaText && slide.ctaUrl && (
                    <Button
                      render={<Link href={slide.ctaUrl} />}
                      className="group/btn relative px-8 py-6 text-base font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                      {slide.ctaText}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Noise texture for depth */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-20"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Slider Controls */}
      {activeSlides.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-6 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/10 bg-black/20 p-2 text-white/70 backdrop-blur-sm transition-all hover:bg-black/40 hover:text-white hover:scale-105 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-6" />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={goNext}
            className="absolute right-6 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/10 bg-black/20 p-2 text-white/70 backdrop-blur-sm transition-all hover:bg-black/40 hover:text-white hover:scale-105 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="size-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-10 z-30 flex gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Decorative bottom fade */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-25 pointer-events-none"
      />
    </section>
  );
}
