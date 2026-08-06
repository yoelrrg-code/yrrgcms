import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

interface ProductsBlockProps {
  title?: string;
  subtitle?: string;
  layout?: "grid" | "slider" | "rows";
  limit?: number;
  typeFilter?: string;
  paddingTop?: string;
  paddingBottom?: string;
}

export async function ProductsBlock({
  title = "Nuestros Productos y Cursos",
  subtitle = "Explora nuestro catálogo exclusivo",
  layout = "grid",
  limit = 6,
  typeFilter = "ALL",
  paddingTop = "pt-12",
  paddingBottom = "pb-12",
}: ProductsBlockProps) {
  let query = db.select().from(products).where(eq(products.status, "PUBLISHED")).orderBy(desc(products.createdAt)).limit(limit);

  const items = await query;

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={`max-w-7xl mx-auto px-4 ${paddingTop} ${paddingBottom}`}>
      {title && (
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          {subtitle && <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{subtitle}</p>}
        </div>
      )}

      {/* ROWS LAYOUT */}
      {layout === "rows" && (
        <div className="space-y-6">
          {items.map((prod) => (
            <div
              key={prod.id}
              className="group card-hover-effect flex flex-col md:flex-row items-center gap-6 p-6 bg-[var(--theme-card-bg,rgba(255,255,255,0.85))] dark:bg-slate-900/80 backdrop-blur-md border border-[var(--theme-card-border,rgba(226,232,240,0.8))] dark:border-slate-800 rounded-3xl shadow-sm"
            >
              {prod.imageUrl ? (
                <div className="w-full md:w-56 h-40 overflow-hidden rounded-2xl relative bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img src={prod.imageUrl} alt={prod.title} className="img-zoom-effect w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                </div>
              ) : (
                <div className="w-full md:w-56 h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 font-medium shrink-0">
                  Sin imagen
                </div>
              )}
              <div className="flex-1 text-center md:text-left space-y-2">
                <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 bg-indigo-500/10 text-[var(--theme-primary,var(--primary))] border border-indigo-500/20 rounded-full">
                  {prod.type}
                </span>
                <h3 className="text-xl font-bold text-[var(--theme-h3-color,currentColor)] dark:text-white group-hover:text-[var(--theme-primary,var(--primary))] transition-colors duration-300">{prod.title}</h3>
                <p className="text-sm text-[var(--theme-p-color,#64748b)] dark:text-slate-400 line-clamp-2">{prod.description}</p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-3 min-w-[150px]">
                <span className="text-2xl font-black tracking-tight text-[var(--theme-h3-color,currentColor)] dark:text-white">
                  ${(prod.price / 100).toFixed(2)} <span className="text-xs font-normal text-slate-500">{prod.currency}</span>
                </span>
                <Link
                  href={`/cursos/${prod.slug}`}
                  style={{
                    backgroundColor: "var(--theme-button-bg, var(--theme-primary, var(--primary)))",
                    color: "var(--theme-button-text, #ffffff)",
                    borderRadius: "var(--theme-button-radius, 0.75rem)",
                  }}
                  className="btn-hover-effect w-full text-center px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Ver detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GRID / SLIDER LAYOUT */}
      {(layout === "grid" || layout === "slider") && (
        <div className={layout === "slider" ? "flex gap-6 overflow-x-auto pb-4 scrollbar-thin" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"}>
          {items.map((prod) => (
            <div
              key={prod.id}
              className={`${layout === "slider" ? "min-w-[300px] max-w-[340px]" : ""} group card-hover-effect bg-[var(--theme-card-bg,rgba(255,255,255,0.85))] dark:bg-slate-900/80 backdrop-blur-md border border-[var(--theme-card-border,rgba(226,232,240,0.8))] dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col`}
            >
              {prod.imageUrl ? (
                <div className="w-full h-52 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                  <img src={prod.imageUrl} alt={prod.title} className="img-zoom-effect w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                </div>
              ) : (
                <div className="w-full h-52 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-medium">
                  Sin Imagen
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-indigo-500/10 text-[var(--theme-primary,var(--primary))] border border-indigo-500/20 rounded-full inline-block">
                    {prod.type}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--theme-h3-color,currentColor)] dark:text-white mt-3 line-clamp-1 group-hover:text-[var(--theme-primary,var(--primary))] transition-colors duration-300">{prod.title}</h3>
                  <p className="text-sm text-[var(--theme-p-color,#64748b)] dark:text-slate-400 mt-2 line-clamp-2">{prod.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-[var(--theme-card-border,rgba(226,232,240,0.6))] dark:border-slate-800 pt-4">
                  <span className="text-xl font-black tracking-tight text-[var(--theme-h3-color,currentColor)] dark:text-white">
                    ${prod.price.toLocaleString()}
                  </span>
                  <Link
                    href={`/cursos/${prod.slug}`}
                    style={{
                      backgroundColor: "var(--theme-button-bg, var(--theme-primary, var(--primary)))",
                      color: "var(--theme-button-text, #ffffff)",
                      borderRadius: "var(--theme-button-radius, 0.75rem)",
                    }}
                    className="btn-hover-effect px-5 py-2.5 text-xs font-semibold shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
