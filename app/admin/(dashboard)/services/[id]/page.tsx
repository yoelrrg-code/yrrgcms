import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { notFound } from "next/navigation";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await db.select().from(services).where(eq(services.id, id)).limit(1);
  const service = res[0];

  if (!service) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <ServiceForm initialService={service} />
    </div>
  );
}
