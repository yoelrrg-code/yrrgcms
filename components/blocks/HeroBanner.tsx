"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

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

    if (transitionEffect === "slide") {
      return `absolute inset-0 w-full h-full min-h-[600px] flex items-center justify-center transition-transform duration-500 ease-in-out ${
        isActive
          ? "translate-x-0 opacity-100 z-10 pointer-events-auto"
          : isPrev
          ? "-translate-x-full opacity-0 z-0 pointer-events-none"
          : "translate-x-full opacity-0 z-0 pointer-events-none"
      }`;
    }

    // Default: simple opacity fade
    return `absolute inset-0 w-full h-full flex items-center justify-center transition-opacity duration-500 ease-in-out ${
      isActive
        ? "opacity-100 z-10 pointer-events-auto"
        : "opacity-0 z-0 pointer-events-none"
    }`;
  };

  return (
    <section
      className={`relative w-full overflow-hidden bg-slate-950`}
    >
      {/* Outer Hero Frame with constrained height */}
      <div className="relative flex h-[80vh] min-h-[600px] w-full items-center justify-center overflow-hidden">
        {/* Slides Container */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
        {activeSlides.map((slide, idx) => {
          const overlay = slide.overlayColor ?? "rgba(0, 0, 0, 0.55)";
          const slideClass = getSlideClasses(idx);
          const isActive = idx === activeIndex;

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
                  priority={idx === 0}
                  className="object-cover object-center w-full h-full"
                  style={{ objectFit: "cover", objectPosition: "center" }}
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

              {/* Content Container - active slide */}
              {isActive && (
                <div
                  key={activeIndex}
                  className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center flex flex-col items-center justify-center space-y-6"
                >
                  {/* Subtle Badge Tag */}
                  <Reveal animation="fade-up" delay={0}>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-md shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Featured Highlight</span>
                    </div>
                  </Reveal>

                  {/* Title */}
                  <Reveal animation="fade-up" delay={150}>
                    <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-lg">
                      {slide.title}
                    </h1>
                  </Reveal>

                  {/* Subtitle */}
                  {slide.subtitle && (
                    <Reveal animation="fade-up" delay={300}>
                      <p className="max-w-2xl text-base text-slate-200/90 sm:text-xl leading-relaxed font-normal drop-shadow">
                        {slide.subtitle}
                      </p>
                    </Reveal>
                  )}

                  {/* CTA Button */}
                  {slide.ctaText && slide.ctaUrl && (
                    <Reveal animation="fade-up" delay={450}>
                      <div className="pt-4">
                        <Button
                          render={<Link href={slide.ctaUrl} />}
                          style={{
                            backgroundColor: "var(--theme-button-bg, var(--primary))",
                            color: "var(--theme-button-text, #ffffff)",
                            borderRadius: "var(--theme-button-radius, 9999px)",
                            padding: "var(--theme-button-padding, 0.875rem 2rem)",
                          }}
                          className="group/btn relative inline-flex items-center gap-2 text-base font-semibold shadow-lg border-0"
                        >
                          <span>{slide.ctaText}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
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
                      </div>
                    </Reveal>
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
            className="absolute left-6 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-3 text-white/80 backdrop-blur-md shadow-md"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-6" />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={goNext}
            className="absolute right-6 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-3 text-white/80 backdrop-blur-md shadow-md"
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
                className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                  activeIndex === idx
                    ? "w-10 bg-[var(--theme-primary,var(--primary))] shadow-md shadow-white/30"
                    : "w-2.5 bg-slate-500 dark:bg-slate-700 hover:bg-slate-400"
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
      </div>
    </section>
  );
}
