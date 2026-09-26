import { type Context,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { trackPixel } from "@/lib/meta-pixel";

export type CartItem = {
  slug: string;
  name: string;
  image: string;
  price: number;
  strap: string;
  size: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

// Persist across hot reloads so provider and consumers share one context.
const cartStore = globalThis as unknown as {
  __timorCartContext?: Context<CartContextValue | null>;
};
const CartContext =
  cartStore.__timorCartContext ??
  (cartStore.__timorCartContext = createContext<CartContextValue | null>(null));
const STORAGE_KEY = "timor-cart-v1";

export function itemKey(item: Pick<CartItem, "slug" | "strap" | "size">) {
  return `${item.slug}__${item.strap}__${item.size}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    trackPixel("AddToCart", {
      content_ids: [item.slug],
      content_name: item.name,
      content_type: "product",
      value: item.price * qty,
      currency: "BDT",
    });
    setItems((prev) => {
      const key = itemKey(item);
      const found = prev.find((i) => itemKey(i) === key);
      if (found) {
        return prev.map((i) => (itemKey(i) === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty }];
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      prev.flatMap((i) =>
        itemKey(i) === key ? (qty <= 0 ? [] : [{ ...i, qty }]) : [i],
      ),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => itemKey(i) !== key));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
    return {
      items,
      count,
      subtotal,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      setQty,
      removeItem,
      clearCart: () => setItems([]),
    };
  }, [items, isOpen, addItem, setQty, removeItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
