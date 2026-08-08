"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Service } from "@/lib/db/schema";
import { getServices } from "@/lib/actions/services";
import { BookingModal } from "./BookingModal";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

interface ServicePricingOptions {
  singleSession?: {
    durationMinutes?: number;
    price?: number;
    currency?: string;
  };
  packs?: unknown[];
  subscriptions?: unknown[];
}

interface ServicesBlockProps {
  paddingTop?: string;
  paddingBottom?: string;
  layout?: "grid" | "rows";
  title?: string;
  subtitle?: string;
}

export function ServicesBlock({
  paddingTop,
  paddingBottom,
  layout = "rows",
  title = "Our Services & Plans",
  subtitle = "Choose your preferred service and easily book your sessions.",
}: ServicesBlockProps) {
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    getServices().then((res) => {
      setServicesList(res.filter((s) => s.status === "active"));
    });
  }, []);

  return (
    <section className={`${paddingTop || "pt-12"} ${paddingBottom || "pb-12"} py-16 px-4 md:px-8 max-w-7xl mx-auto space-y-12`}>
      <Reveal animation="fade-down" className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--theme-h2-color, currentColor)" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-[var(--theme-p-color,var(--muted-foreground,currentColor))] text-sm leading-relaxed">
            {subtitle}
          </p>
        )}
      </Reveal>

      {layout === "grid" ? (
        /* GRID LAYOUT */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicesList.map((service, index) => {
            const pricing = (service.pricingOptions as ServicePricingOptions | null) || {};
            const price = pricing.singleSession?.price || 0;
            const currency = pricing.singleSession?.currency || "USD";

            const delays: (100 | 150 | 200 | 300 | 400 | 500)[] = [100, 200, 300];
            return (
              <Reveal key={service.id} animation="fade-up" delay={index * 120}>
                <div className="group card-hover-effect relative bg-[var(--theme-card-bg,rgba(255,255,255,0.85))] dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-[var(--theme-card-border,rgba(226,232,240,0.8))] dark:border-slate-800/80 overflow-hidden shadow-sm flex flex-col h-full">
                  {service.mainImage && (
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={service.mainImage}
                      alt={service.title}
                      fill
                      className="img-zoom-effect object-cover transition-transform duration-700 ease-out group-hover:scale-100"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {service.durationMinutes && (
                      <span className="absolute top-4 left-4 z-10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10">
                        {service.durationMinutes} min
                      </span>
                    )}
                  </div>
                )}
                <div className="p-7 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-bold text-xl text-[var(--theme-h3-color,currentColor)] dark:text-white group-hover:text-[var(--theme-primary,var(--primary))] transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-[var(--theme-p-color,#475569)] dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                      {service.shortDescription}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[var(--theme-card-border,rgba(226,232,240,0.6))] dark:border-slate-800">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-medium text-[var(--theme-p-color,#64748b)] dark:text-slate-400">
                        Starting from
                      </span>
                      <span className="text-2xl font-black tracking-tight text-[var(--theme-h3-color,currentColor)] dark:text-white">
                        ${price.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{currency}</span>
                      </span>
                    </div>

                    <Button
                      onClick={() => setSelectedService(service)}
                      style={{
                        backgroundColor: "var(--theme-button-bg, var(--theme-primary, var(--primary)))",
                        color: "var(--theme-button-text, #ffffff)",
                        borderRadius: "var(--theme-button-radius, 1rem)",
                      }}
                      className="btn-hover-effect w-full font-bold py-6 text-sm shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <Calendar className="mr-2 size-4" /> Book Session
                    </Button>
                  </div>
                </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      ) : (
        /* ALTERNATING ROWS (Z-PATTERN) */
        <div className="space-y-12">
          {servicesList.map((service, index) => {
            const isEven = index % 2 === 0;
            const pricing = (service.pricingOptions as ServicePricingOptions | null) || {};
            const price = pricing.singleSession?.price || 0;
            const currency = pricing.singleSession?.currency || "USD";

            return (
              <Reveal key={service.id} animation={isEven ? "fade-right" : "fade-left"} delay={index * 150}>
                <div className={`group card-hover-effect flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-[var(--theme-card-bg,rgba(255,255,255,0.85))] dark:bg-slate-900/80 backdrop-blur-md p-7 md:p-10 rounded-3xl border border-[var(--theme-card-border,rgba(226,232,240,0.8))] dark:border-slate-800 shadow-sm ${
                  !isEven ? "md:flex-row-reverse" : ""
                }`}>
                {/* SERVICE IMAGE */}
                <div className="relative w-full md:w-1/2 h-72 md:h-96 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 shadow-md">
                  {service.mainImage ? (
                    <Image
                      src={service.mainImage}
                      alt={service.title}
                      fill
                      className="img-zoom-effect object-cover transition-transform duration-700 ease-out group-hover:scale-100"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">No Image Available</div>
                  )}
                  {service.durationMinutes && (
                    <span className="absolute top-4 left-4 z-10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10">
                      {service.durationMinutes} min
                    </span>
                  )}
                </div>

                {/* SERVICE DESCRIPTION & BOOK BUTTON */}
                <div className="w-full md:w-1/2 space-y-6">
                  <span
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--theme-primary, #4f46e5) 12%, transparent)",
                      color: "var(--theme-primary, #4f46e5)",
                    }}
                    className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block"
                  >
                    Active Service
                  </span>

                  <h3 className="text-3xl font-extrabold tracking-tight text-[var(--theme-h3-color,currentColor)] dark:text-white group-hover:text-[var(--theme-primary,var(--primary))] transition-colors duration-300">
                    {service.title}
                  </h3>

                  <p className="text-[var(--theme-p-color,#475569)] dark:text-slate-300 text-base leading-relaxed">
                    {service.shortDescription}
                  </p>

                  <div className="flex items-center gap-6 pt-2">
                    <div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Single Session</span>
                      <span className="text-3xl font-black text-[var(--theme-h3-color,currentColor)] dark:text-white">
                        ${price.toLocaleString()} <span className="text-xs font-normal text-slate-500">{currency}</span>
                      </span>
                    </div>

                    <Button
                      onClick={() => setSelectedService(service)}
                      style={{
                        backgroundColor: "var(--theme-button-bg, var(--theme-primary, var(--primary)))",
                        color: "var(--theme-button-text, #ffffff)",
                        borderRadius: "var(--theme-button-radius, 1rem)",
                      }}
                      className="btn-hover-effect px-8 py-6 font-bold text-sm shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <Calendar className="mr-2 size-4" /> Book Now
                    </Button>
                  </div>
                </div>
              </div>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* MODAL DE AGENDAMIENTO */}
      {selectedService && (
        <BookingModal
          service={selectedService}
          open={!!selectedService}
          onOpenChange={(open) => !open && setSelectedService(null)}
        />
      )}
    </section>
  );
}
