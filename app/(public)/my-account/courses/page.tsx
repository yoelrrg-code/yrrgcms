import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { enrollments, courses, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { GraduationCap, PlayCircle } from "lucide-react";

export const metadata = {
  title: "My Courses | My Account",
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
      <div data-aos="fade-down">
        <h1 className="text-3xl font-extrabold tracking-tight">My Courses</h1>
        <p className="text-slate-500 text-sm mt-1">
          Access all virtual courses and educational materials active on your account.
        </p>
      </div>

      {userEnrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-4" data-aos="zoom-in">
          <GraduationCap className="h-12 w-12 mx-auto text-slate-400 opacity-60" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No Enrolled Courses Yet
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Once you purchase a course and the payment is confirmed, your enrolled courses will appear listed here.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-xl transition"
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
          {userEnrollments.map((item, index) => (
            <div
              key={item.enrollmentId}
              data-aos="fade-up"
              data-aos-delay={(index % 3) * 150}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 flex flex-col justify-between space-y-4 hover:shadow-lg transition"
            >
              <div className="space-y-2">
                <span 
                  className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded-md"
                  style={{
                    backgroundColor: "var(--theme-primary, #4f46e5)",
                    color: "#ffffff",
                  }}
                >
                  {item.level}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2">
                  {item.productTitle}
                </h2>
              </div>

              <Link
                href={`/my-account/courses/${item.productSlug}`}
                className="w-full py-3 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
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
