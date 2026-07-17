import { getPostById } from "@/lib/actions/posts";
import { getCategories } from "@/lib/actions/categories";
import { getTags } from "@/lib/actions/tags";
import PostEditor from "@/components/admin/PostEditor";
import { notFound } from "next/navigation";

interface PostEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostEditorPage({ params }: PostEditorPageProps) {
  const { id } = await params;

  const [categoriesResult, tagsResult] = await Promise.all([
    getCategories(),
    getTags(),
  ]);

  if (id === "new") {
    return (
      <div className="max-w-5xl mx-auto">
        <PostEditor categories={categoriesResult} tags={tagsResult} />
      </div>
    );
  }

  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      <PostEditor post={post} categories={categoriesResult} tags={tagsResult} />
    </div>
  );
}
