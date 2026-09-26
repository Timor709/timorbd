import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type Context,
} from "react";
import { CheckCircle2, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBDT, type Product } from "@/lib/products";
import { placeOrder } from "@/lib/orders";
import { AddressFields } from "@/components/address-fields";

type QuickOrderSelection = {
  product: Product;
  strap: string;
  size: string;
};

type QuickOrderContextValue = {
  openQuickOrder: (selection: QuickOrderSelection) => void;
};

// Keep a single context instance across hot reloads so provider and consumers always match.
const globalStore = globalThis as unknown as {
  __timorQuickOrderContext?: Context<QuickOrderContextValue | null>;
};
const QuickOrderContext =
  globalStore.__timorQuickOrderContext ??
  (globalStore.__timorQuickOrderContext = createContext<QuickOrderContextValue | null>(null));

const quickOrderSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?88)?01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
  address: z.string().trim().min(10, "Please enter a complete delivery address").max(400),
  payment: z.enum(["cod", "online"]),
});

export function QuickOrderProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<QuickOrderSelection | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState<"cod" | "online">("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const value = useMemo<QuickOrderContextValue>(
    () => ({
      openQuickOrder: (nextSelection) => {
        setSelection(nextSelection);
        setQuantity(1);
        setPayment("cod");
        setErrors({});
        setOrderId(null);
        setSubmitError(null);
      },
    }),
    [],
  );

  function closeQuickOrder() {
    setSelection(null);
    setErrors({});
    setOrderId(null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = quickOrderSchema.safeParse({
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: String(form.get("address") ?? ""),
      payment,
    });

    if (!parsed.success || !selection) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error?.issues ?? []) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);
    const productTotal = selection.product.price * quantity;
    try {
      const ref = await placeOrder({
        customerName: parsed.data.name,
        phone: parsed.data.phone,
        address: parsed.data.address,
        paymentMethod: parsed.data.payment,
        items: [
          {
            slug: selection.product.slug,
            name: selection.product.name,
            price: selection.product.price,
            qty: quantity,
            strap: selection.strap,
            size: selection.size,
          },
        ],
        subtotal: productTotal,
        deliveryFee: delivery,
        total: productTotal + delivery,
      });
      setOrderId(ref);
    } catch {
      setSubmitError("We couldn't place your order just now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const product = selection?.product;
  const total = product ? product.price * quantity + delivery : 0;

  return (
    <QuickOrderContext.Provider value={value}>
      {children}
      <Dialog open={selection !== null} onOpenChange={(open) => !open && closeQuickOrder()}>
        <DialogContent className="max-h-[92vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto border-primary/40 bg-surface p-0 shadow-[0_0_50px_oklch(0.58_0.24_26/0.24)] sm:rounded-sm">
          {selection && product && !orderId && (
            <div className="grid md:grid-cols-[0.8fr_1.2fr]">
              <div className="relative min-h-56 overflow-hidden border-b border-border bg-background md:min-h-full md:border-b-0 md:border-r">
                <img
                  src={product.image}
                  alt={product.name}
                  width={912}
                  height={1104}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-5 pt-16">
                  <p className="eyebrow text-foreground">Direct order</p>
                  <h2 className="mt-2 text-2xl font-light">{product.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selection.strap} · {selection.size}
                  </p>
                </div>
              </div>

              <form onSubmit={onSubmit} className="p-5 sm:p-7" noValidate>
                <DialogHeader className="pr-8 text-left">
                  <DialogTitle className="font-display text-3xl font-light">Order now</DialogTitle>
                  <DialogDescription>Complete your order in under a minute.</DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="quick-name" className="eyebrow">Full name</label>
                    <input id="quick-name" name="name" autoComplete="name" maxLength={100} className="field mt-2" placeholder="Your name" />
                    {errors["name"] && <p className="mt-1.5 text-xs text-primary">{errors["name"]}</p>}
                  </div>
                  <div>
                    <label htmlFor="quick-phone" className="eyebrow">Phone</label>
                    <input id="quick-phone" name="phone" autoComplete="tel" inputMode="tel" maxLength={20} className="field mt-2" placeholder="01XXXXXXXXX" />
                    {errors["phone"] && <p className="mt-1.5 text-xs text-primary">{errors["phone"]}</p>}
                  </div>
                  <AddressFields idPrefix="quick" error={errors["address"]} onDistrictChange={setDistrictId} />

                  <fieldset>
                    <legend className="eyebrow">Payment method</legend>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Button type="button" variant="outline" onClick={() => setPayment("cod")} className={`h-auto min-w-0 whitespace-normal rounded-sm px-3 py-3 text-xs ${payment === "cod" ? "border-primary bg-primary/10" : "border-border"}`}>
                        Cash on Delivery
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setPayment("online")} className={`h-auto min-w-0 whitespace-normal rounded-sm px-3 py-3 text-xs ${payment === "online" ? "border-primary bg-primary/10" : "border-border"}`}>
                        Online Payment
                      </Button>
                    </div>
                  </fieldset>

                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-y border-border py-4">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="mt-1 truncate text-lg">{formatBDT(total)}</p>
                    </div>
                    <div className="flex shrink-0 items-center border border-border">
                      <Button type="button" variant="ghost" size="icon" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="rounded-none">
                        <Minus />
                      </Button>
                      <span className="w-8 text-center text-sm">{quantity}</span>
                      <Button type="button" variant="ghost" size="icon" aria-label="Increase quantity" onClick={() => setQuantity((current) => Math.min(10, current + 1))} className="rounded-none">
                        <Plus />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> {fee === null ? `Delivery: Inside Dhaka ${formatBDT(rates.inside)} · Outside ${formatBDT(rates.outside)}` : `Delivery ${formatBDT(delivery)}`}</span>
                    <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure order</span>
                  </div>

                  {submitError && <p className="text-xs text-primary">{submitError}</p>}
                  <Button type="submit" disabled={submitting} className="btn-ember h-auto w-full rounded-sm disabled:opacity-60">
                    {submitting ? "Placing order…" : `Place order · ${formatBDT(total)}`}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {selection && product && orderId && (
            <div className="px-6 py-14 text-center sm:px-12">
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
              <DialogHeader className="mt-6 text-center">
                <DialogTitle className="font-display text-3xl font-light">Order placed</DialogTitle>
                <DialogDescription className="mx-auto max-w-sm leading-relaxed">
                  Your order reference is <span className="text-foreground">{orderId}</span>. Our team will call you shortly to confirm delivery.
                </DialogDescription>
              </DialogHeader>
              <Button type="button" variant="outline" onClick={closeQuickOrder} className="btn-ghost-line mt-8 h-auto rounded-sm">
                Continue shopping
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </QuickOrderContext.Provider>
  );
}

export function useQuickOrder() {
  const context = useContext(QuickOrderContext);
  if (!context) throw new Error("useQuickOrder must be used inside QuickOrderProvider");
  return context;
}