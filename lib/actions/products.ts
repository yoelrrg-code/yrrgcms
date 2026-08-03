"use server";

import { db } from "@/lib/db";
import { products, courses, productCategories, NewProduct, Product } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ProductWithCategories = Product & {
  categories?: { categoryId: string }[];
};

export async function getProducts(): Promise<Product[]> {
  return await db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getProductById(id: string): Promise<ProductWithCategories | null> {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  if (!product) return null;

  const cats = await db
    .select({ categoryId: productCategories.categoryId })
    .from(productCategories)
    .where(eq(productCategories.productId, id));

  return {
    ...product,
    categories: cats,
  };
}

export async function createProduct(data: {
  title: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
  type: "VIRTUAL_COURSE" | "PHYSICAL" | "DIGITAL_DOWNLOAD";
  status: "DRAFT" | "PUBLISHED";
  imageUrl?: string;
  categoryIds?: string[];
}) {
  const [product] = await db
    .insert(products)
    .values({
      title: data.title,
      slug: data.slug,
      description: data.description,
      price: data.price,
      currency: data.currency || "USD",
      type: data.type,
      status: data.status,
      imageUrl: data.imageUrl,
    })
    .returning();

  if (product && data.categoryIds && data.categoryIds.length > 0) {
    await db.insert(productCategories).values(
      data.categoryIds.map((categoryId) => ({
        productId: product.id,
        categoryId,
      }))
    );
  }

  // If it's a virtual course, automatically instantiate an associated course entry
  if (data.type === "VIRTUAL_COURSE" && product) {
    await db.insert(courses).values({
      productId: product.id,
      level: "BEGINNER",
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/courses");
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<NewProduct> & { categoryIds?: string[] }
) {
  const { categoryIds, ...productData } = data;

  const [updated] = await db
    .update(products)
    .set({
      ...productData,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();

  if (categoryIds !== undefined) {
    await db.delete(productCategories).where(eq(productCategories.productId, id));
    if (categoryIds.length > 0) {
      await db.insert(productCategories).values(
        categoryIds.map((categoryId) => ({
          productId: id,
          categoryId,
        }))
      );
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/courses");
  return updated;
}

export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/admin/courses");
}

export async function publishProduct(id: string) {
  return updateProduct(id, { status: "PUBLISHED" });
}

export async function unpublishProduct(id: string) {
  return updateProduct(id, { status: "DRAFT" });
}
