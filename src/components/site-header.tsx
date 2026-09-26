import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import logo from "/logo.jpeg";

const nav = [
  { to: "/", label: "Home" },
  { to: "/collection", label: "Collection" },
  { to: "/craftsmanship", label: "Craftsmanship" },
] as const;

export function SiteHeader() {
  const { count, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-10">
          <Link to="/" className="shrink-0">
            <img
              src={logo}
              alt="TIMOR"
              width={112}
              height={112}
              className="h-16 w-auto mix-blend-screen drop-shadow-[0_0_12px_rgba(255,26,26,0.18)] sm:h-20"
            />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="text-[0.7rem] uppercase tracking-[0.25em] transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
        <button
          onClick={openCart}
          aria-label="Open cart"
          className="relative flex shrink-0 items-center gap-2 border border-border px-4 py-2 text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Cart</span>
          <span className="text-foreground">{count}</span>
        </button>
        </div>
      </div>
    </header>
  );
}
