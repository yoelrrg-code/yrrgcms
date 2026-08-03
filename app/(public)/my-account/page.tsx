import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { GraduationCap, User } from "lucide-react";
import ProfileForm from "./ProfileForm";

export const metadata = {
  title: "My Account | CMS",
};

export default async function MyAccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/my-account");
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div data-aos="fade-down">
        <h1 className="text-3xl font-extrabold tracking-tight">My Account</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your account profile and access your purchased courses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Course Access Card */}
        <div 
          data-aos="fade-right"
          className="md:col-span-1 text-white rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-md border border-slate-800/20"
          style={{
            backgroundColor: "var(--theme-secondary, #0f172a)",
          }}
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{color: "var(--theme-text-color, #ffffff)"}}>My Courses</h2>
            <p className="text-xs opacity-90 leading-relaxed" style={{color: "var(--theme-text-color, #ffffff)"}}>
              Access video lessons, guides, and materials for all enrolled virtual courses.
            </p>
          </div>

          <Link
            href="/my-account/courses"
            className="w-full py-3 font-bold text-sm rounded-xl text-center transition block"
            style={{
              backgroundColor: "var(--theme-button-bg, var(--theme-secondary, #4f46e5))",
              color: "var(--theme-button-text, #ffffff)",
              borderRadius: "var(--theme-button-radius, 0.75rem)",
            }}
          >
            View My Courses →
          </Link>
        </div>

        {/* Profile Details & Password Update */}
        <div data-aos="fade-left" className="md:col-span-2 bg-card border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <User className="h-5 w-5" style={{ color: "var(--theme-primary, #4f46e5)" }} />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Information</h2>
              <p className="text-xs text-slate-500">Your personal account details</p>
            </div>
          </div>

          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
