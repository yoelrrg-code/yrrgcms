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
    redirect(`/auth/signin?callbackUrl=/my-account/courses/${slug}/leccion/${lessonId}`);
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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs text-indigo-400 font-bold uppercase">{product.title}</span>
            <h1 className="text-2xl font-black">{lesson.title}</h1>
          </div>
          <Link href="/my-account/courses" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold">
            ← Volver a Mis Cursos
          </Link>
        </div>

        {/* Reproductor / Visor según contentType */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden aspect-video flex items-center justify-center">
          {lesson.contentType === "VIDEO" && (
            <iframe
              src={lesson.contentUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

          {lesson.contentType === "PDF_DOCUMENT" && (
            <div className="p-8 text-center space-y-4">
              <p className="text-lg font-semibold">Documento / Material en PDF</p>
              <a
                href={lesson.contentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
              >
                Abrir PDF en nueva pestaña ↗
              </a>
            </div>
          )}

          {lesson.contentType === "WEBINAR_LINK" && (
            <div className="p-8 text-center space-y-4">
              <p className="text-lg font-semibold">Enlace de Conexión a Webinar / Sesión en Vivo</p>
              <a
                href={lesson.contentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                Unirme al Webinar ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
