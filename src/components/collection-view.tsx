import { Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/products";
import type { Category } from "@/lib/categories";

const pill = "border px-5 py-2 text-[0.65rem] uppercase tracking-[0.25em] transition-colors";
const active = "border-primary/70 bg-primary/10 text-foreground";
const idle = "border-border text-muted-foreground hover:text-foreground";

export function CollectionView({
  products,
  categories,
  current,
}: {
  products: Product[];
  categories: Category[];
  current?: Category | undefined;
}) {
  const list = current ? products.filter((p) => p.categoryId === current.id) : products;
  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <p className="eyebrow">The Collection</p>
      <h1 className="mt-3 text-4xl font-light sm:text-5xl">{current ? current.name : "Every TIMOR piece"}</h1>
      {current?.description && <p className="mt-4 max-w-2xl text-muted-foreground">{current.description}</p>}

      <nav className="mt-10 flex flex-wrap gap-3" aria-label="Categories">
        <Link to="/collection" className={`${pill} ${current ? idle : active}`}>All</Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/collection/$category"
            params={{ category: c.slug }}
            className={`${pill} ${current?.id === c.id ? active : idle}`}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <p className="mt-12 text-muted-foreground">No watches in this category yet.</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
