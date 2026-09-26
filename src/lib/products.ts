import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import watch1 from "@/assets/watch-1.jpg";
import watch2 from "@/assets/watch-2.jpg";
import watch3 from "@/assets/watch-3.jpg";
import watch4 from "@/assets/watch-4.jpg";
import watch5 from "@/assets/watch-5.jpg";
import watch6 from "@/assets/watch-6.jpg";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compareAt?: number;
  image: string;
  collection: string;
  inStock: boolean;
  description: string;
  straps: string[];
  sizes: string[];
  specs: { label: string; value: string }[];
};

const imageByFile: Record<string, string> = {
  "watch-1.jpg": watch1,
  "watch-2.jpg": watch2,
  "watch-3.jpg": watch3,
  "watch-4.jpg": watch4,
  "watch-5.jpg": watch5,
  "watch-6.jpg": watch6,
};

type ProductRow = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compare_at: number | null;
  description: string;
  image_url: string;
  collection: string;
  in_stock: boolean;
  straps: string[];
  sizes: string[];
  specs: { label: string; value: string }[];
};

function toProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    price: row.price,
    compareAt: row.compare_at ?? undefined,
    image: imageByFile[row.image_url] ?? row.image_url,
    collection: row.collection,
    inStock: row.in_stock,
    description: row.description,
    straps: row.straps ?? [],
    sizes: row.sizes ?? [],
    specs: Array.isArray(row.specs) ? row.specs : [],
  };
}

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("slug, name, tagline, price, compare_at, description, image_url, collection, in_stock, straps, sizes, specs")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as ProductRow[]).map(toProduct);
}

export const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: fetchProducts,
  staleTime: 60_000,
});

export async function fetchProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("slug, name, tagline, price, compare_at, description, image_url, collection, in_stock, straps, sizes, specs")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? toProduct(data as ProductRow) : null;
}

export function formatBDT(amount: number) {
  return `৳${amount.toLocaleString("en-US")}`;
}
