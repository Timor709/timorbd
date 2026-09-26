import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CollectionView } from "@/components/collection-view";
import { productsQueryOptions } from "@/lib/products";
import { categoriesQueryOptions } from "@/lib/categories";

export const Route = createFileRoute("/collection/$category")({
  loader: async ({ context, params }) => {
    const [, categories] = await Promise.all([
      context.queryClient.ensureQueryData(productsQueryOptions),
      context.queryClient.ensureQueryData(categoriesQueryOptions),
    ]);
    const category = categories.find((c) => c.slug === params.category);
    if (!category) throw notFound();
    return { name: category.name, description: category.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Category not found — TIMOR" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.name} Watches — TIMOR`;
    const desc = loaderData.description || `Shop TIMOR ${loaderData.name} watches. Prices in BDT, delivery across Bangladesh.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <p className="p-20 text-center text-muted-foreground">Couldn't load this category.</p>,
  notFoundComponent: () => (
    <div className="p-20 text-center">
      <p className="text-muted-foreground">This category doesn't exist.</p>
      <Link to="/collection" className="btn-ghost-line mt-6">View all watches</Link>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const current = categories.find((c) => c.slug === category);
  return <CollectionView products={products} categories={categories} current={current} />;
}
