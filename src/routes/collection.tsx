import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { productsQueryOptions } from "@/lib/products";

export const Route = createFileRoute("/collection")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  head: () => ({
    meta: [
      { title: "Collection — TIMOR Luxury Watches" },
      {
        name: "description",
        content:
          "Browse every TIMOR timepiece: Noir chronographs, Marine divers, Heritage dress watches and Essential minimalists.",
      },
      { property: "og:title", content: "Collection — TIMOR Luxury Watches" },
      {
        property: "og:description",
        content: "Every TIMOR timepiece, in one place. Prices in BDT, free delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Collection,
});

function Collection() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const [filter, setFilter] = useState("All");
  const collections = ["All", ...Array.from(new Set(products.map((p) => p.collection)))];
  const list = filter === "All" ? products : products.filter((p) => p.collection === filter);

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <p className="eyebrow">The Collection</p>
      <h1 className="mt-3 text-4xl font-light sm:text-5xl">Every TIMOR piece</h1>

      <div className="mt-10 flex flex-wrap gap-3">
        {collections.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`border px-5 py-2 text-[0.65rem] uppercase tracking-[0.25em] transition-colors ${
              filter === c
                ? "border-primary/70 bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
