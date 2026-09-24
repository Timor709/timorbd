import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { itemKey, useCart } from "@/lib/cart";
import { formatBDT } from "@/lib/products";

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, setQty, removeItem } = useCart();

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-surface transition-transform duration-400 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-lg tracking-[0.2em] uppercase">Your Bag</h2>
          <button onClick={closeCart} aria-label="Close cart" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="mt-20 text-center">
              <p className="text-sm text-muted-foreground">Your bag is empty.</p>
              <Link to="/collection" onClick={closeCart} className="btn-ghost-line mt-6">
                Browse Collection
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
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
                      className="h-28 w-24 shrink-0 rounded-sm border border-border object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm tracking-wide">{item.name}</p>
                        <button
                          onClick={() => removeItem(key)}
                          aria-label={`Remove ${item.name}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.strap} · {item.size}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() => setQty(key, item.qty - 1)}
                            aria-label="Decrease quantity"
                            className="px-2 py-1 text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-xs">{item.qty}</span>
                          <button
                            onClick={() => setQty(key, item.qty + 1)}
                            aria-label="Increase quantity"
                            className="px-2 py-1 text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm">{formatBDT(item.price * item.qty)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBDT(subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-muted-foreground">Free</span>
            </div>
            <Link to="/checkout" onClick={closeCart} className="btn-ember mt-6 w-full">
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
