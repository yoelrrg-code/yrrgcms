import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { courses, products, courseLessons, enrollments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

interface LessonViewerProps {
  params: Promise<{ slug: string; lessonId: string }>;
}

export default async function LessonViewerPage({ params }: LessonViewerProps) {
  const { slug, lessonId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=/my-account/courses/${slug}/leccion/${lessonId}`);
  }

  // 1. Obtener producto y curso
  const [product] = await db.select().from(products).where(eq(products.slug, slug));
  if (!product) redirect("/my-account/courses");

  const [course] = await db.select().from(courses).where(eq(courses.productId, product.id));
  if (!course) redirect("/my-account/courses");

  // 2. Validar inscripción activa del usuario
  const [enrollment] = await db.select().from(enrollments).where(
    and(
      eq(enrollments.userId, session.user.id),
      eq(enrollments.courseId, course.id),
      eq(enrollments.isActive, true)
    )
  );
  if (!enrollment) redirect("/my-account/courses");

  // 3. Obtener la lección solicitada
  const [lesson] = await db.select().from(courseLessons).where(eq(courseLessons.id, lessonId));
  if (!lesson) redirect("/my-account/courses");

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <span
              className="text-xs font-bold uppercase tracking-wider block"
              style={{ color: "var(--theme-primary, #4f46e5)" }}
            >
              {product.title}
            </span>
            <h1 className="text-2xl font-black text-foreground">{lesson.title}</h1>
          </div>
          <Link 
            href={`/my-account/courses/${slug}`}
            className="px-4 py-2 text-sm font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
            style={{
              backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
              color: "var(--theme-button-text, #ffffff)",
              borderRadius: "var(--theme-button-radius, 0.75rem)",
            }}
          >
            ← Back to Course
          </Link>
        </div>

        {/* Player / Viewer depending on contentType */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden aspect-video flex items-center justify-center relative shadow-sm">
          {lesson.contentType === "VIDEO" && (
            (() => {
              if (!lesson.contentUrl) {
                return (
                  <div className="p-8 text-center space-y-2 text-slate-400">
                    <p className="text-lg font-bold text-slate-200">No Video URL Provided</p>
                    <p className="text-xs">The creator has not attached a video link for this lesson yet.</p>
                  </div>
                );
              }

              // Transform standard YouTube watch URL to embed format if needed
              let videoEmbedUrl = lesson.contentUrl;
              if (videoEmbedUrl.includes("youtube.com/watch?v=")) {
                const videoId = videoEmbedUrl.split("v=")[1]?.split("&")[0];
                if (videoId) videoEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
              } else if (videoEmbedUrl.includes("youtu.be/")) {
                const videoId = videoEmbedUrl.split("youtu.be/")[1]?.split("?")[0];
                if (videoId) videoEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
              } else if (videoEmbedUrl.includes("vimeo.com/") && !videoEmbedUrl.includes("player.vimeo.com")) {
                const videoId = videoEmbedUrl.split("vimeo.com/")[1]?.split("?")[0];
                if (videoId) videoEmbedUrl = `https://player.vimeo.com/video/${videoId}`;
              }

              const isEmbed = videoEmbedUrl.includes("youtube") || videoEmbedUrl.includes("vimeo") || videoEmbedUrl.includes("embed");

              if (isEmbed) {
                return (
                  <iframe
                    src={videoEmbedUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                );
              }

              // Direct video file (e.g. mp4)
              return (
                <video
                  src={lesson.contentUrl}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              );
            })()
          )}

          {lesson.contentType === "PDF_DOCUMENT" && (
            <div className="p-8 text-center space-y-4">
              <p className="text-lg font-semibold text-foreground">PDF Document / Learning Material</p>
              {lesson.contentUrl ? (
                <a
                  href={lesson.contentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-6 py-3 font-bold transition shadow-sm"
                  style={{
                    backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
                    color: "var(--theme-button-text, #ffffff)",
                    borderRadius: "var(--theme-button-radius, 0.75rem)",
                  }}
                >
                  Open PDF in new tab ↗
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">No document attached to this lesson.</p>
              )}
            </div>
          )}

          {lesson.contentType === "WEBINAR_LINK" && (
            <div className="p-8 text-center space-y-4">
              <p className="text-lg font-semibold text-foreground">Webinar / Live Session Link</p>
              {lesson.contentUrl ? (
                <a
                  href={lesson.contentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-6 py-3 font-bold transition shadow-sm"
                  style={{
                    backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
                    color: "var(--theme-button-text, #ffffff)",
                    borderRadius: "var(--theme-button-radius, 0.75rem)",
                  }}
                >
                  Join Live Webinar ↗
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">No link provided for this live session.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
