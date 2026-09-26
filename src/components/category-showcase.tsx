import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Watch } from "lucide-react";
import type { Product } from "@/lib/products";
import type { Category } from "@/lib/categories";

export function CategoryShowcase({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <p className="eyebrow">Categories</p>
          <h2 className="mt-3 text-3xl font-light sm:text-4xl">Shop by Style</h2>
        </div>
        <Link
          to="/collection"
          className="shrink-0 text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-4">
        {categories.map((c) => {
          const list = products.filter((p) => p.categoryId === c.id);
          const cover = list[0]?.image;
          return (
            <Link
              key={c.id}
              to="/collection/$category"
              params={{ category: c.slug }}
              className="group relative block overflow-hidden border border-border bg-card transition-colors hover:border-primary/60"
            >
              <div className="relative aspect-square overflow-hidden">
                {cover ? (
                  <img
                    src={cover}
                    alt={`${c.name} watches`}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary">
                    <Watch className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border border-border bg-background/70 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="text-lg font-light tracking-[0.15em] uppercase sm:text-xl">
                  {c.name}
                </h3>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {list.length} {list.length === 1 ? "piece" : "pieces"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
