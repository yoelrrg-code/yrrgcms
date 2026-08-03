import { getProductById } from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import ProductEditor from "@/components/admin/ProductEditor";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoriesList = await getCategories();

  if (id === "new") {
    return (
      <div className="max-w-5xl mx-auto">
        <ProductEditor product={null} categories={categoriesList} />
      </div>
    );
  }

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <ProductEditor product={product} categories={categoriesList} />
    </div>
  );
}
