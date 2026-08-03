import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ShoppingBag, ArrowRight } from "lucide-react";

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
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full">
            Online Catalog
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-5xl">
            Courses & Digital Products
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
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
            {allProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-medium">
                      No image
                    </div>
                  )}
                  <div className="p-6 space-y-3">
                    <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full">
                      {prod.type === "VIRTUAL_COURSE" ? "Virtual Course" : prod.type}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">{prod.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {prod.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-4">
                  <div>
                    <span className="text-xs text-slate-400 block">Price</span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      ${prod.price.toLocaleString()} <span className="text-xs font-semibold text-slate-500">{prod.currency}</span>
                    </span>
                  </div>

                  <Link
                    href={`/courses/${prod.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
