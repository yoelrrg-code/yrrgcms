import { getThemeById } from "@/lib/actions/themes";
import { ThemeEditor } from "@/components/admin/ThemeEditor";
import { notFound } from "next/navigation";

export default async function EditThemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const theme = await getThemeById(id);

  if (!theme) {
    notFound();
  }

  return <ThemeEditor theme={theme} />;
}
