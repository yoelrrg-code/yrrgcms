"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Service } from "@/lib/db/schema";
import { getServices } from "@/lib/actions/services";
import { BookingModal } from "./BookingModal";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

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
      <div className="text-center max-w-2xl mx-auto space-y-3" data-aos="fade-up">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--theme-h2-color, currentColor)" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-[var(--theme-p-color,var(--muted-foreground,currentColor))] text-sm leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {layout === "grid" ? (
        /* GRID LAYOUT */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicesList.map((service, index) => {
            const pricing = (service.pricingOptions as ServicePricingOptions | null) || {};
            const price = pricing.singleSession?.price || 0;
            const currency = pricing.singleSession?.currency || "USD";

            return (
              <div
                key={service.id}
                data-aos="fade-up"
                data-aos-delay={index * 150}
                className="bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-900 rounded-2xl border border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {service.mainImage && (
                  <div className="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <Image src={service.mainImage} alt={service.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl text-[var(--theme-h3-color,currentColor)] dark:text-white">
                      {service.title}
                    </h3>
                    <p className="text-[var(--theme-p-color,#475569)] dark:text-slate-400 text-xs line-clamp-3">
                      {service.shortDescription}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-baseline border-t border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800 pt-3">
                      <span className="text-xs text-[var(--theme-p-color,#64748b)] dark:text-slate-400">From</span>
                      <span className="text-xl font-bold text-[var(--theme-h3-color,currentColor)] dark:text-white">
                        ${price.toLocaleString()} {currency}
                      </span>
                    </div>

                    <Button
                      onClick={() => setSelectedService(service)}
                      style={{
                        backgroundColor: "var(--theme-button-bg, var(--theme-primary, var(--primary, #059669)))",
                        color: "var(--theme-button-text, var(--primary-foreground, #ffffff))",
                      }}
                      className="w-full font-bold rounded-xl py-5 shadow-sm hover:opacity-90 transition-all"
                    >
                      <Calendar className="mr-2 size-4" /> Book Session
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ALTERNATING ROWS (Z-PATTERN) */
        <div className="space-y-16">
          {servicesList.map((service, index) => {
            const isEven = index % 2 === 0;
            const pricing = (service.pricingOptions as ServicePricingOptions | null) || {};
            const price = pricing.singleSession?.price || 0;
            const currency = pricing.singleSession?.currency || "USD";

            return (
              <div
                key={service.id}
                data-aos={isEven ? "fade-right" : "fade-left"}
                data-aos-delay={100}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-[var(--theme-card-bg,#f8fafc)] dark:bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800 ${
                  !isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* SERVICE IMAGE */}
                <div className="relative w-full md:w-1/2 h-64 md:h-80 rounded-2xl overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0 shadow-sm">
                  {service.mainImage ? (
                    <Image
                      src={service.mainImage}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 font-medium">No Image Available</div>
                  )}
                </div>

                {/* SERVICE DESCRIPTION & BOOK BUTTON */}
                <div className="w-full md:w-1/2 space-y-4">
                  <span
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--theme-primary, currentColor) 10%, transparent)",
                      color: "var(--theme-primary, currentColor)",
                    }}
                    className="text-xs font-semibold px-3 py-1 rounded-full inline-block"
                  >
                    {service.durationMinutes} minutes per session
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-[var(--theme-h3-color,currentColor)] dark:text-white">
                    {service.title}
                  </h3>
                  <p className="text-[var(--theme-p-color,#475569)] dark:text-slate-300 text-sm leading-relaxed">
                    {service.shortDescription}
                  </p>

                  <div className="pt-2 flex items-center gap-6">
                    <div>
                      <span className="text-xs text-[var(--theme-p-color,#64748b)] dark:text-slate-400 block">Base price</span>
                      <span className="text-2xl font-black text-[var(--theme-h3-color,currentColor)] dark:text-white">
                        ${price.toLocaleString()} {currency}
                      </span>
                    </div>

                    <Button
                      onClick={() => setSelectedService(service)}
                      style={{
                        backgroundColor: "var(--theme-button-bg, var(--theme-primary, var(--primary, #059669)))",
                        color: "var(--theme-button-text, var(--primary-foreground, #ffffff))",
                      }}
                      className="font-bold rounded-xl px-8 py-6 text-base shadow-md hover:shadow-lg hover:opacity-90 transition-all"
                    >
                      <Calendar className="mr-2 size-5" /> Book Now
                    </Button>
                  </div>
                </div>
              </div>
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
