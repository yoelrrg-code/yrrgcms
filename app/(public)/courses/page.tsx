import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { extractPlainTextFromRichText, truncateTextToWords } from "@/lib/utils/richtext";

export const revalidate = 60;

export default async function CatalogPage() {
  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.status, "PUBLISHED"))
    .orderBy(desc(products.createdAt));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full inline-block"
            style={{
              backgroundColor: "var(--theme-primary, #4f46e5)",
              color: "#ffffff",
            }}
          >
            Online Catalog
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ color: "var(--theme-text, inherit)" }}>
            Courses & Digital Products
          </h1>
          <p className="text-lg opacity-80" style={{ color: "var(--theme-p-color, var(--theme-text, inherit))" }}>
            Explore our educational programs and digital resources designed to empower your skills.
          </p>
        </div>

        {/* Catalog Grid */}
        {allProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center max-w-md mx-auto shadow-sm">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-400 mb-4 opacity-40" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No products available</h3>
            <p className="text-sm text-slate-500 mt-1">Check back soon for new courses and materials.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProducts.map((prod) => {
              const plainDescription = extractPlainTextFromRichText(prod.description);
              const formatType = (typeStr: string) => {
                switch (typeStr) {
                  case "VIRTUAL_COURSE":
                    return "Virtual Course";
                  case "DIGITAL_DOWNLOAD":
                    return "Digital Download";
                  case "PHYSICAL":
                    return "Physical Product";
                  default:
                    return typeStr.replace(/_/g, " ");
                }
              };

              return (
                <div
                  key={prod.id}
                  className="group card-hover-effect bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {prod.imageUrl ? (
                      <div className="w-full h-52 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                        <img src={prod.imageUrl} alt={prod.title} className="img-zoom-effect w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                      </div>
                    ) : (
                      <div className="w-full h-52 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-medium">
                        No image
                      </div>
                    )}
                    <div className="p-6 space-y-3">
                      <span
                        className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                        style={{
                          backgroundColor: "var(--theme-primary, #4f46e5)",
                          color: "#ffffff",
                        }}
                      >
                        {formatType(prod.type)}
                      </span>
                      <h3 className="text-xl font-bold leading-snug group-hover:text-[var(--theme-primary,#4f46e5)] transition-colors duration-300" style={{ color: "var(--theme-text, inherit)" }}>
                        {prod.title}
                      </h3>
                      <p className="text-sm leading-relaxed opacity-80" style={{ color: "var(--theme-p-color, var(--theme-text, inherit))" }}>
                        {plainDescription ? truncateTextToWords(plainDescription, 50) : "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-4">
                    <div>
                      <span className="text-xs text-slate-400 block">Price</span>
                      <span className="text-2xl font-extrabold" style={{ color: "var(--theme-text, inherit)" }}>
                        ${prod.price.toLocaleString()}{" "}
                        <span className="text-xs font-semibold text-slate-500">{prod.currency}</span>
                      </span>
                    </div>

                    <Link
                      href={`/courses/${prod.slug}`}
                      className="group/btn btn-hover-effect inline-flex items-center gap-1.5 px-5 py-2.5 font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-xl"
                      style={{
                        backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
                        color: "var(--theme-button-text, #ffffff)",
                        borderRadius: "var(--theme-button-radius, 0.75rem)",
                      }}
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
