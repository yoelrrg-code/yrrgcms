import React from "react";
import { db } from "@/lib/db";
import { courses, products, courseModules, courseLessons } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import CourseEditor from "./CourseEditor";
import { GraduationCap } from "lucide-react";

export default async function CoursesAdminPage() {
  // Fetch courses with products
  const rawCourses = await db
    .select({
      courseId: courses.id,
      productId: products.id,
      productTitle: products.title,
      level: courses.level,
    })
    .from(courses)
    .innerJoin(products, eq(courses.productId, products.id))
    .orderBy(desc(courses.createdAt));

  // Build full course details with modules and lessons
  const coursesWithDetails = await Promise.all(
    rawCourses.map(async (c) => {
      const modules = await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.courseId, c.courseId))
        .orderBy(courseModules.order);

      const modulesWithLessons = await Promise.all(
        modules.map(async (m) => {
          const lessons = await db
            .select()
            .from(courseLessons)
            .where(eq(courseLessons.moduleId, m.id))
            .orderBy(courseLessons.order);
          return {
            ...m,
            lessons,
          };
        })
      );

      return {
        ...c,
        modules: modulesWithLessons,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">LMS Courses & Curriculum Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organize educational content, modules, lessons, and downloadable materials for your courses.
        </p>
      </div>

      {coursesWithDetails.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-12 text-center">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
          <h3 className="text-lg font-semibold">No courses registered yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
            Create a product with type &quot;Virtual Course&quot; in the Products section to start building your curriculum.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {coursesWithDetails.map((course) => (
            <CourseEditor key={course.courseId} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
