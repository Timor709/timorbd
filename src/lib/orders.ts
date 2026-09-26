import { supabase } from "@/integrations/supabase/client";

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
  note?: string;
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
  return orderRef;
}
