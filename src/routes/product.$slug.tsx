import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatBDT, getProduct, products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useQuickOrder } from "@/lib/quick-order";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Watch not found — TIMOR" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — TIMOR`;
    return {
      meta: [
        { title },
        { name: "description", content: product.description },
        { property: "og:title", content: title },
        { property: "og:description", content: product.description },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { addItem } = useCart();
  const { openQuickOrder } = useQuickOrder();
  const [strap, setStrap] = useState<string>(product.straps[0] ?? "Standard");
  const [size, setSize] = useState<string>(product.sizes[0] ?? "Standard");

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <nav className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
        <Link to="/collection" className="hover:text-foreground">
          Collection
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-10 grid gap-14 lg:grid-cols-2">
        <div>
          <div className="ember-top border border-border bg-black">
            <img
              src={product.image}
              alt={product.name}
              width={912}
              height={1104}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div>
          <p className="eyebrow">{product.collection}</p>
          <h1 className="mt-3 text-4xl font-light sm:text-5xl">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{product.tagline}</p>

          <div className="mt-7 flex items-baseline gap-4">
            <span className="text-2xl">{formatBDT(product.price)}</span>
            {product.compareAt && (
              <span className="text-sm text-muted-foreground line-through">
                {formatBDT(product.compareAt)}
              </span>
            )}
          </div>

          <p className="mt-3 text-xs uppercase tracking-[0.2em]">
            {product.inStock ? (
              <span className="text-primary">In stock — ships in 24h</span>
            ) : (
              <span className="text-muted-foreground">Sold out</span>
            )}
          </p>

          <p className="mt-7 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-9">
            <p className="eyebrow">Strap</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.straps.map((s) => (
                <button
                  key={s}
                  onClick={() => setStrap(s)}
                  className={`border px-4 py-2 text-xs tracking-wide transition-colors ${
                    strap === s
                      ? "border-primary/70 bg-primary/10"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <p className="eyebrow">Case size</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`border px-4 py-2 text-xs tracking-wide transition-colors ${
                    size === s
                      ? "border-primary/70 bg-primary/10"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3">
            <Button
              disabled={!product.inStock}
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
              className="btn-ghost-line h-auto min-w-0 rounded-sm px-3 text-[0.68rem] sm:text-xs"
            >
              {product.inStock ? "Add to Cart" : "Sold Out"}
            </Button>
            <Button
              disabled={!product.inStock}
              onClick={() => openQuickOrder({ product, strap, size })}
              className="btn-ember h-auto min-w-0 rounded-sm px-3 text-[0.68rem] sm:text-xs"
            >
              {product.inStock ? "Order Now" : "Unavailable"}
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Free delivery (৳0)
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> 100% authentic
            </span>
          </div>

          <dl className="mt-12 divide-y divide-border border-t border-border">
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex items-center justify-between gap-4 py-4">
                <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {spec.label}
                </dt>
                <dd className="text-sm">{spec.value}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {["5-year movement warranty", "Cash on delivery available", "7-day easy exchange"].map(
              (t) => (
                <li key={t} className="flex items-center gap-3">
                  <Check className="h-4 w-4 shrink-0 text-primary" /> {t}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <section className="mt-28">
        <p className="eyebrow">You may also like</p>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
