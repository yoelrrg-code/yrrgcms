"use client";

import { useState, useEffect } from "react";
import { Testimonial } from "@/lib/db/schema";
import { getTestimonials } from "@/lib/actions/testimonials";
import { Star, Quote, ChevronLeft, ChevronRight, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestimonialsBlockProps {
  title?: string;
  subtitle?: string;
  layout?: "slider" | "grid";
  onlyFeatured?: boolean;
  limit?: number;
  paddingTop?: string;
  paddingBottom?: string;
  testimonialsList?: Testimonial[];
}

export function TestimonialsBlock({
  title = "What Our Clients Say",
  subtitle = "Real feedback from our satisfied customers and partners.",
  layout = "slider",
  onlyFeatured = false,
  limit = 6,
  paddingTop = "pt-12",
  paddingBottom = "pb-12",
  testimonialsList,
}: TestimonialsBlockProps) {
  const [items, setItems] = useState<Testimonial[]>(testimonialsList || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!testimonialsList);

  useEffect(() => {
    if (!testimonialsList) {
      getTestimonials().then((data) => {
        let filtered = data;
        if (onlyFeatured) {
          filtered = filtered.filter((t) => t.isFeatured);
        }
        if (limit > 0) {
          filtered = filtered.slice(0, limit);
        }
        setItems(filtered);
        setLoading(false);
      });
    }
  }, [testimonialsList, onlyFeatured, limit]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, items.length - 1) : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= items.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <section className={`${paddingTop} ${paddingBottom} px-4 max-w-6xl mx-auto text-center text-muted-foreground`}>
        <p className="animate-pulse text-sm font-medium">Loading testimonials...</p>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={`${paddingTop} ${paddingBottom} px-4 max-w-6xl mx-auto space-y-10`}>
      {/* HEADER SECTION */}
      {(title || subtitle) && (
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          {title && <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>}
          {subtitle && <p className="text-muted-foreground text-sm sm:text-base">{subtitle}</p>}
        </div>
      )}

      {/* RENDER LAYOUT: SLIDER VS GRID */}
      {layout === "slider" ? (
        <div className="relative max-w-4xl mx-auto">
          {/* SLIDER CARD */}
          <div
            key={currentIndex}
            className="card-hover-effect bg-[var(--theme-card-bg,rgba(255,255,255,0.85))] dark:bg-slate-900/90 backdrop-blur-md border border-[var(--theme-card-border,rgba(226,232,240,0.8))] dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-right-6 duration-500 ease-out"
          >
            <Quote className="absolute top-6 right-6 size-24 text-[var(--theme-primary,var(--primary))] opacity-10 -rotate-12 pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Rating */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-5 ${
                      i < items[currentIndex].rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-200 dark:fill-slate-800 text-slate-300 dark:text-slate-700"
                    }`}
                  />
                ))}
              </div>

              {/* Quote Content */}
              <blockquote className="text-xl sm:text-2xl font-semibold leading-relaxed italic text-[var(--theme-h3-color,currentColor)] dark:text-white">
                &quot;{items[currentIndex].content}&quot;
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-[var(--theme-card-border,rgba(226,232,240,0.6))] dark:border-slate-800">
                {items[currentIndex].avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={items[currentIndex].avatarUrl!}
                    alt={items[currentIndex].name}
                    className="size-14 rounded-full object-cover ring-2 ring-[var(--theme-primary,var(--primary))]"
                  />
                ) : (
                  <div className="size-14 rounded-full bg-indigo-500/10 ring-2 ring-indigo-500/20 flex items-center justify-center text-[var(--theme-primary,var(--primary))]">
                    <UserIcon className="size-7" />
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-base text-[var(--theme-h3-color,currentColor)] dark:text-white">{items[currentIndex].name}</h4>
                  {items[currentIndex].role && (
                    <p className="text-xs font-medium text-[var(--theme-p-color,#64748b)] dark:text-slate-400">{items[currentIndex].role}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SLIDER CONTROLS */}
          {items.length > 1 && (
            <div className="flex items-center justify-between mt-6 px-2">
              <div className="flex items-center gap-2">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "w-8 bg-[var(--theme-primary,var(--primary))]" : "w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="btn-hover-effect rounded-full size-10 border-slate-300 dark:border-slate-700 shadow-sm hover:scale-110 active:scale-95 hover:shadow-md transition-all duration-300" onClick={handlePrev}>
                  <ChevronLeft className="size-5" />
                </Button>
                <Button variant="outline" size="icon" className="btn-hover-effect rounded-full size-10 border-slate-300 dark:border-slate-700 shadow-sm hover:scale-110 active:scale-95 hover:shadow-md transition-all duration-300" onClick={handleNext}>
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* GRID LAYOUT */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="card-hover-effect bg-[var(--theme-card-bg,rgba(255,255,255,0.85))] dark:bg-slate-900/80 backdrop-blur-md border border-[var(--theme-card-border,rgba(226,232,240,0.8))] dark:border-slate-800 rounded-3xl p-7 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < item.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 dark:fill-slate-800 text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-[var(--theme-p-color,#475569)] dark:text-slate-300 italic leading-relaxed">&quot;{item.content}&quot;</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[var(--theme-card-border,rgba(226,232,240,0.6))] dark:border-slate-800">
                {item.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.avatarUrl} alt={item.name} className="size-10 rounded-full object-cover ring-2 ring-[var(--theme-primary,var(--primary))]" />
                ) : (
                  <div className="size-10 rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/20 flex items-center justify-center text-[var(--theme-primary,var(--primary))]">
                    <UserIcon className="size-5" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-[var(--theme-h3-color,currentColor)] dark:text-white">{item.name}</h4>
                  {item.role && <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TestimonialsBlock;
