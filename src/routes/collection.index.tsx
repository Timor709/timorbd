import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CollectionView } from "@/components/collection-view";
import { productsQueryOptions } from "@/lib/products";
import { categoriesQueryOptions } from "@/lib/categories";

export const Route = createFileRoute("/collection/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productsQueryOptions),
      context.queryClient.ensureQueryData(categoriesQueryOptions),
    ]),
  head: () => ({
    meta: [
      { title: "Collection — TIMOR Luxury Watches" },
      { name: "description", content: "Browse every TIMOR timepiece by category. Prices in BDT, delivery across Bangladesh." },
      { property: "og:title", content: "Collection — TIMOR Luxury Watches" },
      { property: "og:description", content: "Every TIMOR timepiece, in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => <p className="p-20 text-center text-muted-foreground">Couldn't load the collection.</p>,
  notFoundComponent: () => <p className="p-20 text-center text-muted-foreground">Not found.</p>,
  component: Collection,
});

function Collection() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  return <CollectionView products={products} categories={categories} />;
}
