import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, LogOut, Package, Settings, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const user = (context as { user?: { id: string } }).user;
    if (!user || !(await isAdmin(user.id))) {
      throw redirect({ to: "/admin/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Admin — TIMOR" },
      { name: "description", content: "Manage TIMOR products, orders and tracking." },
      { property: "og:title", content: "Admin — TIMOR" },
      { property: "og:description", content: "TIMOR store administration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package, exact: false },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart, exact: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="flex flex-row flex-wrap gap-2 lg:flex-col">
        <p className="eyebrow hidden lg:block lg:mb-4">Admin</p>
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeOptions={{ exact: l.exact }}
            activeProps={{ className: "border-primary/70 bg-primary/10 text-foreground" }}
            inactiveProps={{ className: "border-border text-muted-foreground" }}
            className="flex items-center gap-2 border px-4 py-2 text-[0.7rem] uppercase tracking-[0.2em] hover:text-foreground"
          >
            <l.icon className="h-4 w-4" /> {l.label}
          </Link>
        ))}
        <button
          onClick={signOut}
          className="flex items-center gap-2 border border-border px-4 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground lg:mt-6"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}
