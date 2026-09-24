import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatBDT, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <article className="glow-hover group border border-border bg-surface">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block overflow-hidden bg-black"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={912}
          height={1104}
          className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </Link>
      <div className="p-5">
        <p className="eyebrow">{product.collection}</p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="min-w-0">
            <h3 className="truncate text-lg">{product.name}</h3>
          </Link>
          <div className="shrink-0 text-right">
            <p className="text-sm">{formatBDT(product.price)}</p>
            {product.compareAt && (
              <p className="text-xs text-muted-foreground line-through">
                {formatBDT(product.compareAt)}
              </p>
            )}
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{product.tagline}</p>
        <div className="mt-5 flex gap-2">
          <button
            disabled={!product.inStock}
            onClick={() =>
              addItem({
                slug: product.slug,
                name: product.name,
                image: product.image,
                price: product.price,
                strap: product.straps[0] ?? "Standard",
                size: product.sizes[0] ?? "Standard",
              })
            }
            className="btn-ember flex-1 px-4 py-3"
          >
            {product.inStock ? "Add to Cart" : "Sold Out"}
          </button>
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="btn-ghost-line px-4 py-3"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
