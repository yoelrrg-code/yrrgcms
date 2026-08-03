import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { products, courses, courseModules, courseLessons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { tiptapToHtml } from "@/lib/tiptap-render";

interface CourseDetailProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailProps) {
  const { slug } = await params;

  const [product] = await db.select().from(products).where(eq(products.slug, slug));

  if (!product || product.status !== "PUBLISHED") {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Course or Product Not Found</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">The requested product does not exist or was removed.</p>
        <Link href="/courses" className="mt-6 inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const [course] = await db.select().from(courses).where(eq(courses.productId, product.id));

  const modulesWithLessons: Array<{
    id: string;
    title: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      contentType: string;
      duration: string | null;
      isFreePreview: boolean;
      order: number;
    }>;
  }> = [];

  if (course) {
    const rawModules = await db.select().from(courseModules).where(eq(courseModules.courseId, course.id)).orderBy(courseModules.order);

    for (const mod of rawModules) {
      const lessons = await db.select().from(courseLessons).where(eq(courseLessons.moduleId, mod.id)).orderBy(courseLessons.order);
      modulesWithLessons.push({
        ...mod,
        lessons,
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm" data-aos="fade-up">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full inline-block"
              style={{
                backgroundColor: "var(--theme-primary, #4f46e5)",
                color: "#ffffff",
              }}
            >
              {product.type === "VIRTUAL_COURSE"
                ? "Virtual Course"
                : product.type === "DIGITAL_DOWNLOAD"
                ? "Digital Download"
                : product.type === "PHYSICAL"
                ? "Physical Product"
                : String(product.type).replace(/_/g, " ")}
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-4">{product.title}</h1>
            
            {product.description ? (
              <div
                className="mt-6 text-slate-700 dark:text-slate-200 leading-relaxed prose dark:prose-invert max-w-none [&_p]:mb-4 [&_strong]:font-black [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_b]:font-black [&_b]:text-slate-900 dark:[&_b]:text-white [&_em]:italic [&_i]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-2xl [&_h1]:font-extrabold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-4 [&_blockquote]:italic"
                dangerouslySetInnerHTML={{ __html: tiptapToHtml(product.description) }}
              />
            ) : (
              <p className="text-slate-500 italic mt-4">No description provided.</p>
            )}
          </div>

          {/* Curriculum */}
          {course && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm" data-aos="fade-up" data-aos-delay="150">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Course Curriculum</h2>

              {modulesWithLessons.length === 0 ? (
                <p className="text-slate-500 italic">No modules available at this time.</p>
              ) : (
                <div className="space-y-6">
                  {modulesWithLessons.map((mod, idx) => (
                    <div key={mod.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden" data-aos="fade-up" data-aos-delay={idx * 100}>
                      <div className="bg-slate-100/70 dark:bg-slate-800/50 px-6 py-4 font-bold text-slate-900 dark:text-white">
                        Module {idx + 1}: {mod.title}
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {mod.lessons.map((les) => (
                          <div key={les.id} className="px-6 py-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">
                                {les.contentType}
                              </span>
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{les.title}</span>
                            </div>
                            {les.isFreePreview && (
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                                Free Preview
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Purchase Card */}
        <div className="lg:col-span-1" data-aos="fade-left">
          <div className="sticky top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.title} className="w-full h-48 object-cover rounded-2xl" />
            )}

            <div>
              <span className="text-sm text-slate-500">Total Price</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ${product.price.toLocaleString()}{" "}
                <span className="text-sm font-semibold text-slate-500">{product.currency}</span>
              </div>
            </div>

            <Link
              href={`/checkout/${product.id}`}
              className="w-full block text-center py-4 font-bold transition shadow-lg"
              style={{
                backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
                color: "var(--theme-button-text, #ffffff)",
                borderRadius: "var(--theme-button-radius, 1rem)",
              }}
            >
              Enroll Now
            </Link>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-500 space-y-2">
              <p>✔ Immediate access after payment verification</p>
              <p>✔ Direct Bank Transfer payment</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
