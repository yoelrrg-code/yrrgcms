import { Metadata } from "next";
import PostsGrid from "@/components/blocks/PostsGrid";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Read our latest articles.",
};

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen py-16 px-6 lg:px-8 max-w-7xl mx-auto">
      <PostsGrid title="Blog" layout="grid" count={24} />
    </main>
  );
}
