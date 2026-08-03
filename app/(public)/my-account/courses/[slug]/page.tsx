import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { courses, products, courseModules, courseLessons, enrollments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { tiptapToHtml } from "@/lib/tiptap-render";
import { PlayCircle, FileText, Video, ExternalLink, GraduationCap, ArrowLeft } from "lucide-react";

interface CourseViewerProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CourseViewerProps) {
  const { slug } = await params;
  const [product] = await db.select().from(products).where(eq(products.slug, slug));
  if (!product) return { title: "Course Not Found" };
  return { title: `${product.title} | My Courses` };
}

export default async function CourseViewerPage({ params }: CourseViewerProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=/my-account/courses/${slug}`);
  }

  // 1. Fetch Product
  const [product] = await db.select().from(products).where(eq(products.slug, slug));
  if (!product) notFound();

  // 2. Fetch Course linked to Product
  const [course] = await db.select().from(courses).where(eq(courses.productId, product.id));
  if (!course) notFound();

  // 3. Verify Active Enrollment
  const [enrollment] = await db.select().from(enrollments).where(
    and(
      eq(enrollments.userId, session.user.id),
      eq(enrollments.courseId, course.id),
      eq(enrollments.isActive, true)
    )
  );

  if (!enrollment) {
    redirect("/my-account/courses");
  }

  // 4. Fetch Modules & Lessons
  const rawModules = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, course.id))
    .orderBy(courseModules.order);

  const modulesWithLessons = await Promise.all(
    rawModules.map(async (mod) => {
      const lessons = await db
        .select()
        .from(courseLessons)
        .where(eq(courseLessons.moduleId, mod.id))
        .orderBy(courseLessons.order);
      return {
        ...mod,
        lessons,
      };
    })
  );

  // Find first lesson for "Start Learning" shortcut
  const firstLesson = modulesWithLessons.flatMap((m) => m.lessons)[0];

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/my-account/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold transition hover:opacity-70"
          style={{ color: "var(--theme-primary, var(--theme-link, inherit))" }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Courses
        </Link>
        <span
          className="px-3 py-1 text-xs font-bold uppercase rounded-full text-white"
          style={{
            backgroundColor: "var(--theme-primary, #4f46e5)",
          }}
        >
          {course.level} Level
        </span>
      </div>

      {/* Course Hero Card */}
      <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--theme-h1-color, var(--theme-text, inherit))" }}>
              {product.title}
            </h1>
            {product.description && (
              <div
                className="text-sm line-clamp-3 prose dark:prose-invert max-w-none"
                style={{ color: "var(--theme-p-color, inherit)" }}
                dangerouslySetInnerHTML={{ __html: tiptapToHtml(product.description) }}
              />
            )}
          </div>

          {firstLesson && (
            <Link
              href={`/my-account/courses/${slug}/leccion/${firstLesson.id}`}
              className="shrink-0 px-6 py-3.5 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition shadow-md hover:opacity-70"
              style={{
                backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
                color: "var(--theme-button-text, #ffffff)",
                borderRadius: "var(--theme-button-radius, 1rem)",
              }}
            >
              <PlayCircle className="h-5 w-5" /> Continue Learning
            </Link>
          )}
        </div>
      </div>

      {/* Course Content / Modules */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: "var(--theme-h2-color, var(--theme-text, inherit))" }}>
          <GraduationCap className="h-6 w-6" style={{ color: "var(--theme-primary, #4f46e5)" }} />
          Course Lessons & Content
        </h2>

        {modulesWithLessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
            No lessons available for this course yet.
          </div>
        ) : (
          <div className="space-y-6">
            {modulesWithLessons.map((mod, modIdx) => (
              <div
                key={mod.id}
                className="bg-card border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="bg-slate-50 dark:bg-slate-900/60 px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-bold flex items-center justify-between" style={{ color: "var(--theme-h3-color, var(--theme-text, inherit))" }}>
                  <span>
                    Module {modIdx + 1}: {mod.title}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {mod.lessons.length} {mod.lessons.length === 1 ? "lesson" : "lessons"}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {mod.lessons.length === 0 ? (
                    <div className="px-6 py-4 text-xs text-slate-400 italic">
                      No lessons in this module.
                    </div>
                  ) : (
                    mod.lessons.map((les) => (
                      <Link
                        key={les.id}
                        href={`/my-account/courses/${slug}/leccion/${les.id}`}
                        className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:opacity-70 transition" style={{ color: "var(--theme-primary, inherit)" }}>
                            {les.contentType === "VIDEO" ? (
                              <Video className="h-4 w-4" />
                            ) : les.contentType === "PDF_DOCUMENT" ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <ExternalLink className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-semibold transition block group-hover:opacity-70" style={{ color: "var(--theme-text, inherit)" }}>
                              {les.title}
                            </span>
                            <span className="text-xs opacity-60 capitalize" style={{ color: "var(--theme-p-color, inherit)" }}>
                              {les.contentType.toLowerCase().replace(/_/g, " ")}
                              {les.duration && ` • ${les.duration}`}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-bold transition flex items-center gap-1 group-hover:opacity-70" style={{ color: "var(--theme-primary, var(--theme-link, inherit))" }}>
                          Open <PlayCircle className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
