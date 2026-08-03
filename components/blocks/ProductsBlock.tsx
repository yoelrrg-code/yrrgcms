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
            <div key={prod.id} className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition hover:shadow-md">
              {prod.imageUrl ? (
                <img src={prod.imageUrl} alt={prod.title} className="w-full md:w-48 h-36 object-cover rounded-xl" />
              ) : (
                <div className="w-full md:w-48 h-36 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                  Sin imagen
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full mb-2">
                  {prod.type}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{prod.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{prod.description}</p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-3 min-w-[140px]">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ${(prod.price / 100).toFixed(2)} <span className="text-xs text-slate-500">{prod.currency}</span>
                </span>
                <Link
                  href={`/cursos/${prod.slug}`}
                  className="w-full text-center px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                >
                  Ver más
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
            <div key={prod.id} className={`${layout === "slider" ? "min-w-[300px] max-w-[340px]" : ""} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition`}>
              {prod.imageUrl ? (
                <img src={prod.imageUrl} alt={prod.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  Sin Imagen
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full">
                    {prod.type}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3 line-clamp-1">{prod.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{prod.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    ${prod.price.toLocaleString()}
                  </span>
                  <Link
                    href={`/cursos/${prod.slug}`}
                    className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
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
