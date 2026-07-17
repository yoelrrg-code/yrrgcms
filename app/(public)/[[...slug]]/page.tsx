import { getPageBySlug } from "@/lib/actions/pages";
import { notFound } from "next/navigation";
import { BLOCK_REGISTRY, Block } from "@/components/blocks";
import { Metadata } from "next";

interface SeoData {
  title?: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export const revalidate = 60; // Default ISR interval

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug?.join("/") || "home";
  const page = await getPageBySlug(slugPath);

  if (!page || page.status === "draft") {
    return { title: "Not Found" };
  }

  const seo = (page.seo as SeoData) || {};

  return {
    title: seo.title || page.title,
    description: seo.description,
    openGraph: {
      title: seo.title || page.title,
      description: seo.description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    robots: seo.noIndex ? "noindex, nofollow" : "index, follow",
  };
}

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug?.join("/") || "home";
  const page = await getPageBySlug(slugPath);

  if (!page || page.status === "draft") {
    notFound();
  }

  const blocks = (page.blocks as Block[]) || [];

  return (
    <main className="min-h-screen">
      {blocks.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          This page has no content.
        </div>
      )}
      {blocks.map((block) => {
        const Component = BLOCK_REGISTRY[block.type];
        if (!Component) return null;
        return <Component key={block.id} {...block.props} />;
      })}
    </main>
  );
}
