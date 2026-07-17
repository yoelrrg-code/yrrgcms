import { getCategoryBySlug } from "@/lib/actions/categories";
import PostsGrid from "@/components/blocks/PostsGrid";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const category = await getCategoryBySlug(resolvedParams.slug);

  if (!category) {
    return { title: "Not Found" };
  }

  return {
    title: `${category.name} | Blog`,
    description: category.description || `Read posts about ${category.name}.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const category = await getCategoryBySlug(resolvedParams.slug);

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen py-16 px-6 lg:px-8 max-w-7xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Category: {category.name}
        </h1>
        {category.description && (
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {category.description}
          </p>
        )}
      </header>
      
      <PostsGrid categoryId={category.id} layout="grid" count={24} />
    </main>
  );
}
