import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { enrollments, courses, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { GraduationCap, PlayCircle } from "lucide-react";
import { AccountBreadcrumbs } from "@/components/AccountBreadcrumbs";

export const metadata = {
  title: "My Courses | My Account",
};

export default async function MisCursosPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login?callbackUrl=/my-account/courses");
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
      <AccountBreadcrumbs />

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--theme-h1-color, var(--theme-text, inherit))" }}>My Courses</h1>
        <p className="text-sm mt-1" style={{ color: "var(--theme-p-color, inherit)" }}>
          Access all virtual courses and educational materials active on your account.
        </p>
      </div>

      {userEnrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <GraduationCap className="h-12 w-12 mx-auto text-slate-400 opacity-60" />
          <h3 className="text-lg font-bold" style={{ color: "var(--theme-h3-color, var(--theme-text, inherit))" }}>
            No Enrolled Courses Yet
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--theme-p-color, inherit)" }}>
            Once you purchase a course and the payment is confirmed, your enrolled courses will appear listed here.
          </p>
          <Link
            href="/courses"
            className="btn-hover-effect inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-300 shadow-md"
            style={{
              backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
              color: "var(--theme-button-text, #ffffff)",
              borderRadius: "var(--theme-button-radius, 0.75rem)",
            }}
          >
            Explore Course Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userEnrollments.map((item) => (
            <div
              key={item.enrollmentId}
              className="group card-hover-effect rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 flex flex-col justify-between space-y-4 hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-500/30 transition-all duration-300"
            >
              <div className="space-y-2">
                <span 
                  className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded-md text-white"
                  style={{
                    backgroundColor: "var(--theme-primary, #4f46e5)",
                  }}
                >
                  {item.level}
                </span>
                <h2 className="text-xl font-bold line-clamp-2 group-hover:text-[var(--theme-primary,#4f46e5)] transition-colors duration-300" style={{ color: "var(--theme-h2-color, var(--theme-text, inherit))" }}>
                  {item.productTitle}
                </h2>
              </div>

              <Link
                href={`/my-account/courses/${item.productSlug}`}
                className="btn-hover-effect w-full py-3 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                style={{
                  backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
                  color: "var(--theme-button-text, #ffffff)",
                  borderRadius: "var(--theme-button-radius, 0.75rem)",
                }}
              >
                <PlayCircle className="h-4 w-4" /> Start Course
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
