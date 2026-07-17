import { getPageById } from "@/lib/actions/pages";
import PageEditor from "@/components/admin/PageEditor";
import { notFound } from "next/navigation";

interface PageEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function PageEditorPage({ params }: PageEditorPageProps) {
  const { id } = await params;

  if (id === "new") {
    return (
      <div className="max-w-5xl mx-auto">
        <PageEditor />
      </div>
    );
  }

  const page = await getPageById(id);
  if (!page) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      <PageEditor page={page} />
    </div>
  );
}
