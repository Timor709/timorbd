import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { itemKey, useCart } from "@/lib/cart";
import { formatBDT } from "@/lib/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — TIMOR" },
      {
        name: "description",
        content:
          "Complete your TIMOR order. Cash on delivery or online payment, with free nationwide delivery.",
      },
      { property: "og:title", content: "Checkout — TIMOR" },
      { property: "og:description", content: "Secure checkout with free delivery." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?88)?01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
  address: z.string().trim().min(10, "Please enter a complete delivery address").max(400),
  note: z.string().trim().max(300).optional(),
  payment: z.enum(["cod", "online"]),
});

function Checkout() {
  const { items, subtotal, setQty, removeItem, clearCart } = useCart();
  const [payment, setPayment] = useState<"cod" | "online">("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState<string | null>(null);

  const delivery = 0;
  const total = subtotal + delivery;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: String(form.get("address") ?? ""),
      note: String(form.get("note") ?? ""),
      payment,
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0])] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setOrderId(`TMR-${Math.floor(100000 + Math.random() * 900000)}`);
    clearCart();
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center sm:px-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-8 text-3xl font-light">Order placed</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Your order reference is <span className="text-foreground">{orderId}</span>. Our team
          will call you shortly to confirm delivery.
        </p>
        <Link to="/collection" className="btn-ghost-line mt-10">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center sm:px-8">
        <h1 className="text-3xl font-light">Your bag is empty</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Add a timepiece to continue to checkout.
        </p>
        <Link to="/collection" className="btn-ember mt-10">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-3 text-4xl font-light">Complete your order</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="name" className="eyebrow">
              Full name
            </label>
            <input id="name" name="name" maxLength={100} className="field mt-3" placeholder="Your name" />
            {errors["name"] && <p className="mt-2 text-xs text-primary">{errors["name"]}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="eyebrow">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              inputMode="tel"
              maxLength={20}
              className="field mt-3"
              placeholder="01XXXXXXXXX"
            />
            {errors["phone"] && <p className="mt-2 text-xs text-primary">{errors["phone"]}</p>}
          </div>

          <div>
            <label htmlFor="address" className="eyebrow">
              Delivery address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              maxLength={400}
              className="field mt-3"
              placeholder="House, road, area, city"
            />
            {errors["address"] && (
              <p className="mt-2 text-xs text-primary">{errors["address"]}</p>
            )}
          </div>

          <div>
            <label htmlFor="note" className="eyebrow">
              Order note (optional)
            </label>
            <input id="note" name="note" maxLength={300} className="field mt-3" placeholder="Anything we should know" />
          </div>

          <div>
            <p className="eyebrow">Payment method</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { id: "cod", title: "Cash on Delivery", text: "Pay when it arrives" },
                { id: "online", title: "Online Payment", text: "bKash, Nagad or card" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPayment(option.id as "cod" | "online")}
                  className={`border p-4 text-left transition-colors ${
                    payment === option.id
                      ? "border-primary/70 bg-primary/10"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="text-sm">{option.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{option.text}</p>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-ember w-full">
            Place order · {formatBDT(total)}
          </button>
        </form>

        <aside className="h-fit border border-border bg-surface p-6">
          <h2 className="text-lg tracking-[0.2em] uppercase">Order summary</h2>
          <ul className="mt-6 space-y-5">
            {items.map((item) => {
              const key = itemKey(item);
              return (
                <li key={key} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    width={912}
                    height={1104}
                    className="h-20 w-16 shrink-0 border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.strap} · {item.size}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <button type="button" onClick={() => setQty(key, item.qty - 1)} className="hover:text-foreground">
                          −
                        </button>
                        <span className="text-foreground">{item.qty}</span>
                        <button type="button" onClick={() => setQty(key, item.qty + 1)} className="hover:text-foreground">
                          +
                        </button>
                        <button type="button" onClick={() => removeItem(key)} className="ml-2 hover:text-primary">
                          Remove
                        </button>
                      </div>
                      <span className="text-sm">{formatBDT(item.price * item.qty)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 space-y-2 border-t border-border pt-6 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBDT(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>{formatBDT(delivery)}</span>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4 text-base">
              <span>Total</span>
              <span>{formatBDT(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
