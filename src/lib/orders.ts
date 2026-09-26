import { supabase } from "@/integrations/supabase/client";
import { trackPixel } from "@/lib/meta-pixel";

export type OrderItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
  strap?: string;
  size?: string;
};

export type OrderInput = {
  customerName: string;
  phone: string;
  address: string;
  note?: string | undefined;
  paymentMethod: "cod" | "online";
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export async function placeOrder(input: OrderInput): Promise<string> {
  const orderRef = `TMR-${Math.floor(100000 + Math.random() * 900000)}`;
  const { error } = await supabase.from("orders").insert({
    order_ref: orderRef,
    customer_name: input.customerName,
    phone: input.phone,
    address: input.address,
    note: input.note || null,
    payment_method: input.paymentMethod,
    items: input.items,
    subtotal: input.subtotal,
    delivery_fee: input.deliveryFee,
    total: input.total,
  });
  if (error) throw error;
  trackPixel("Purchase", {
    value: input.total,
    currency: "BDT",
    content_ids: input.items.map((i) => i.slug),
    content_type: "product",
    num_items: input.items.reduce((n, i) => n + i.qty, 0),
  });
  return orderRef;
}
