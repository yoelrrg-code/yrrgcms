import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pages, posts, formSubmissions, media } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Newspaper, ClipboardList, Image } from "lucide-react";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function DashboardPage() {
  await auth(); // layout already protects, but belt-and-suspenders

  // Run all count queries in parallel
  const [
    [publishedPagesCount],
    [totalPostsCount],
    [formSubmissionsCount],
    [mediaCount],
    recentPosts,
    recentPages,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(pages)
      .where(eq(pages.status, "published")),

    db.select({ count: count() }).from(posts),

    db.select({ count: count() }).from(formSubmissions),

    db.select({ count: count() }).from(media),

    db
      .select({
        id: posts.id,
        title: posts.title,
        status: posts.status,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .orderBy(desc(posts.updatedAt))
      .limit(5),

    db
      .select({
        id: pages.id,
        title: pages.title,
        status: pages.status,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .orderBy(desc(pages.updatedAt))
      .limit(5),
  ]);

  const statCards = [
    {
      title: "Published Pages",
      value: publishedPagesCount.count,
      description: "Live pages on your site",
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Posts",
      value: totalPostsCount.count,
      description: "All blog posts",
      icon: Newspaper,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      title: "Form Submissions",
      value: formSubmissionsCount.count,
      description: "Across all forms",
      icon: ClipboardList,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Media Files",
      value: mediaCount.count,
      description: "Uploaded to Blob storage",
      icon: Image,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  // Merge and sort the recent activity by date
  const recentActivity = [
    ...recentPosts.map((p) => ({
      id: p.id,
      title: p.title,
      type: "Post" as const,
      status: p.status,
      date: p.updatedAt,
    })),
    ...recentPages.map((p) => ({
      id: p.id,
      title: p.title,
      type: "Page" as const,
      status: p.status,
      date: p.updatedAt,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back — here&apos;s what&apos;s happening on your site.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`size-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <CardDescription className="mt-0.5 text-xs">
                {card.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>
            Last updated posts and pages across your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No content yet. Create your first page or post to get started.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {recentActivity.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between py-3 gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {item.type}
                    </Badge>
                    <span className="text-sm font-medium truncate">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={
                        item.status === "published" ? "default" : "secondary"
                      }
                      className="text-xs capitalize"
                    >
                      {item.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground w-24 text-right">
                      {formatDate(item.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
