import { auth } from "@/lib/auth";
import { requireCan } from "@/lib/permissions";
import { getFormById, getFormSubmissions } from "@/lib/actions/forms";
import { notFound } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await getFormById(id);
  if (!form) return { title: "Form Not Found" };
  return { title: `${form.name} Submissions | YRRG CMS` };
}

export default async function FormSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  requireCan(session, "manage", "form_submissions");

  const { id } = await params;
  const form = await getFormById(id);
  if (!form) notFound();

  const submissions = await getFormSubmissions(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon">
          <Link href="/admin/forms" title="Back to forms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Submissions: {form.name}
        </h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Data Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  No submissions yet.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((sub) => {
                const data = (sub.data as Record<string, unknown>) || {};
                const preview = Object.entries(data)
                  .slice(0, 3)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ");

                return (
                  <TableRow key={sub.id}>
                    <TableCell className="align-top whitespace-nowrap">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="align-top">{sub.ip || "Unknown"}</TableCell>
                    <TableCell>
                      <details className="cursor-pointer group">
                        <summary className="font-medium text-sm text-muted-foreground group-hover:text-foreground">
                          {preview || "View Data"}
                        </summary>
                        <div className="mt-2 bg-muted p-4 rounded-md text-sm whitespace-pre-wrap font-mono">
                          {JSON.stringify(data, null, 2)}
                        </div>
                      </details>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
