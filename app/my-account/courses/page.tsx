import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { enrollments, courses, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { GraduationCap, PlayCircle } from "lucide-react";

export const metadata = {
  title: "Mis Cursos | Mi Cuenta",
};

export default async function MisCursosPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/my-account/courses");
  }

  // Fetch active enrollments for user
  const userEnrollments = await db
    .select({
      enrollmentId: enrollments.id,
      grantedAt: enrollments.grantedAt,
      courseId: courses.id,
      level: courses.level,
      productTitle: products.title,
      productSlug: products.slug,
      productDescription: products.description,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(products, eq(courses.productId, products.id))
    .where(
      and(
        eq(enrollments.userId, session.user.id),
        eq(enrollments.isActive, true)
      )
    );

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mis Cursos</h1>
        <p className="text-slate-500 text-sm mt-1">
          Accede a todos los cursos virtuales y material didáctico activo en tu cuenta.
        </p>
      </div>

      {userEnrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <GraduationCap className="h-12 w-12 mx-auto text-slate-400 opacity-60" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Aún no tienes cursos inscritos
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Una vez que adquieras un curso y se confirme la orden de pago, tus cursos inscritos aparecerán listados aquí.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition"
          >
            Explorar Catálogo de Cursos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userEnrollments.map((item) => (
            <div
              key={item.enrollmentId}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 flex flex-col justify-between space-y-4 hover:shadow-lg transition"
            >
              <div className="space-y-2">
                <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  {item.level}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2">
                  {item.productTitle}
                </h2>
              </div>

              <Link
                href={`/my-account/courses/${item.productSlug}`}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
              >
                <PlayCircle className="h-4 w-4" /> Ingresar al Curso
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
