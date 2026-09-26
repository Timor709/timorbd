import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, ShoppingBag, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin, useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import logo from "@/assets/timor-logo.jpg.asset.json";

const nav = [
  { to: "/", label: "Home" },
  { to: "/collection", label: "Collection" },
  { to: "/craftsmanship", label: "Craftsmanship" },
] as const;

export function SiteHeader() {
  const { count, openCart } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: admin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: () => isAdmin(user!.id),
    enabled: !!user,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const pill =
    "flex shrink-0 items-center gap-2 border border-border px-3 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Link to="/" className="shrink-0">
            <img
              src={logo.url}
              alt="TIMOR"
              width={112}
              height={112}
              className="h-9 w-auto mix-blend-screen"
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
        {!loading && user && admin && (
          <>
            <Link to="/admin" className={pill}>Admin</Link>
            <button onClick={signOut} className={pill} aria-label="Log out">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
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
