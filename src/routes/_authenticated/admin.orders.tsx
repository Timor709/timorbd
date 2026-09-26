import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Watch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBDT, productsQueryOptions } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: Orders,
});

const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

type Item = { slug?: string; name: string; qty: number; price: number; strap?: string; size?: string };

function Orders() {
  const qc = useQueryClient();
  const { data: products } = useQuery(productsQueryOptions);
  const imageBySlug = useMemo(
    () => new Map((products ?? []).map((p) => [p.slug, p.image])),
    [products],
  );
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error("Couldn't update status");
    else {
      toast.success(`Order marked ${status}`);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-light">Orders</h1>
      {isLoading && <p className="mt-6 text-muted-foreground">Loading…</p>}
      {orders?.length === 0 && <p className="mt-6 text-muted-foreground">No orders yet.</p>}
      <div className="mt-8 space-y-4">
        {orders?.map((o) => (
          <div key={o.id} className="border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg">{o.customer_name}</p>
                <p className="text-xs text-muted-foreground">
                  {o.order_ref} · {new Date(o.created_at).toLocaleString()} · {o.payment_method === "cod" ? "Cash on Delivery" : "Online payment"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">{formatBDT(o.total)}</span>
                <select
                  value={o.status}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                  className="border border-border bg-background px-3 py-2 text-xs uppercase tracking-[0.15em]"
                  aria-label="Order status"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div className="text-muted-foreground">
                <p>{o.phone}</p>
                <p className="mt-1">{o.address}</p>
                {o.note && <p className="mt-1 italic">Note: {o.note}</p>}
              </div>
              <ul className="space-y-1">
                {((o.items as Item[]) ?? []).map((it, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">
                      {it.qty}× {it.name}
                      <span className="text-muted-foreground"> {[it.strap, it.size].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span>{formatBDT(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
