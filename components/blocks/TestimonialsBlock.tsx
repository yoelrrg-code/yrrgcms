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
          <div className="bg-card border rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden transition-all duration-300">
            <Quote className="absolute top-6 right-6 size-16 text-primary/10 -rotate-12 pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Rating */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-5 ${
                      i < items[currentIndex].rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              {/* Quote Content */}
              <blockquote className="text-lg sm:text-xl font-medium leading-relaxed italic text-foreground">
                &quot;{items[currentIndex].content}&quot;
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-4 border-t">
                {items[currentIndex].avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={items[currentIndex].avatarUrl!}
                    alt={items[currentIndex].name}
                    className="size-12 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <UserIcon className="size-6" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-base">{items[currentIndex].name}</h4>
                  {items[currentIndex].role && (
                    <p className="text-xs text-muted-foreground">{items[currentIndex].role}</p>
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
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/40"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-full size-9" onClick={handlePrev}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full size-9" onClick={handleNext}>
                  <ChevronRight className="size-4" />
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
              className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < item.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed">&quot;{item.content}&quot;</p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t">
                {item.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.avatarUrl} alt={item.name} className="size-10 rounded-full object-cover border" />
                ) : (
                  <div className="size-10 rounded-full bg-muted border flex items-center justify-center text-muted-foreground">
                    <UserIcon className="size-5" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                  {item.role && <p className="text-xs text-muted-foreground">{item.role}</p>}
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
