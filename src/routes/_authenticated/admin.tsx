import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LayoutDashboard, LogOut, Package, Settings, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin")({
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
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [claimMsg, setClaimMsg] = useState<string | null>(null);
  const { data: admin, isLoading, refetch } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: () => isAdmin(user.id),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  async function claim() {
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error || !data) setClaimMsg("This store already has an owner. Ask them to give you access.");
    else refetch();
  }

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-5 py-20 text-muted-foreground">Loading…</div>;
  }

  if (!admin) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <p className="eyebrow">Restricted</p>
        <h1 className="mt-3 text-3xl font-light">Admin access needed</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Signed in as {user.email}. If you're the store owner setting things up for the first
          time, claim ownership below.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={claim} className="btn-ember">Claim store ownership</button>
          <button onClick={signOut} className="btn-ghost-line">Sign out</button>
        </div>
        {claimMsg && <p className="mt-6 text-sm text-destructive">{claimMsg}</p>}
      </div>
    );
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
