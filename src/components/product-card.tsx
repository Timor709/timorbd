import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useQuickOrder } from "@/lib/quick-order";
import { formatBDT, type Product } from "@/lib/products";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { openQuickOrder } = useQuickOrder();
  const strap = product.straps[0] ?? "Standard";
  const size = product.sizes[0] ?? "Standard";

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
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button
            disabled={!product.inStock}
            title={product.inStock ? "Add to Cart" : "Currently sold out"}
            onClick={() =>
              addItem({
                slug: product.slug,
                name: product.name,
                image: product.image,
                price: product.price,
                strap,
                size,
              })
            }
            className="btn-ghost-line h-auto min-w-0 rounded-sm px-2 py-3 text-[0.62rem] sm:px-3 sm:text-[0.68rem]"
          >
            Add to Cart
          </Button>
          <Button
            disabled={!product.inStock}
            title={product.inStock ? "Order Now" : "Currently sold out"}
            onClick={() => openQuickOrder({ product, strap, size })}
            className="btn-ember h-auto min-w-0 rounded-sm px-2 py-3 text-[0.62rem] sm:px-3 sm:text-[0.68rem]"
          >
            Order Now
          </Button>
        </div>
      </div>
    </article>
  );
}
