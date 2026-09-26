import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBDT } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [orders, products] = await Promise.all([
        supabase
          .from("orders")
          .select("order_ref, customer_name, total, status, created_at, items")
          .order("created_at", { ascending: false }),
        supabase.from("products").select("id, slug, stock, in_stock"),
      ]);
      if (orders.error) throw orders.error;
      if (products.error) throw products.error;
      const valid = orders.data.filter((o) => o.status !== "cancelled");
      return {
        sales: valid.reduce((s, o) => s + o.total, 0),
        orders: orders.data.length,
        pending: orders.data.filter((o) => o.status === "pending").length,
        products: products.data.length,
        lowStock: products.data.filter((p) => p.stock <= 3).length,
        recent: orders.data.slice(0, 6),
      };
    },
  });

  const stats = [
    { label: "Total sales", value: data ? formatBDT(data.sales) : "—" },
    { label: "Orders", value: data?.orders ?? "—", sub: data ? `${data.pending} pending` : "" },
    { label: "Products", value: data?.products ?? "—", sub: data ? `${data.lowStock} low stock` : "" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-light">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="border border-border bg-card p-6">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-3 text-3xl font-light">{s.value}</p>
            {s.sub && <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>}
          </div>
        ))}
      </div>
      <div className="mt-10 flex items-end justify-between">
        <h2 className="text-xl font-light">Recent orders</h2>
        <Link to="/admin/orders" className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </div>
      <div className="mt-4 divide-y divide-border border border-border">
        {data?.recent.length === 0 && <p className="p-5 text-sm text-muted-foreground">No orders yet.</p>}
        {data?.recent.map((o) => {
          const first = ((o.items as { slug?: string; name?: string }[]) ?? [])[0];
          const img = first?.slug ? productImages.get(first.slug) : undefined;
          return (
            <div key={o.order_ref} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 p-4 text-sm">
              {img ? (
                <img
                  src={img}
                  alt={first?.name ?? "Ordered watch"}
                  className="h-12 w-12 shrink-0 border border-border object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border text-muted-foreground">
                  <Watch className="h-4 w-4" aria-hidden />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate">{o.customer_name}</p>
                <p className="text-xs text-muted-foreground">{o.order_ref} · {new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{o.status}</span>
              <span>{formatBDT(o.total)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
