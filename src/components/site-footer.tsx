import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, ShieldCheck, Truck, BadgeCheck, Headphones } from "lucide-react";
import logo from "@/assets/timor-logo.jpg.asset.json";

const badges = [
  { icon: ShieldCheck, title: "Secure Checkout", text: "Encrypted order handling" },
  { icon: BadgeCheck, title: "100% Authentic", text: "Every piece serial-verified" },
  { icon: Truck, title: "Free Delivery", text: "Nationwide, ৳0 charge" },
  { icon: Headphones, title: "Support", text: "10am – 10pm, daily" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {badges.map((b) => (
          <div key={b.title} className="flex min-w-0 items-start gap-4">
            <b.icon className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em]">{b.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <img src={logo.url} alt="TIMOR" width={112} height={112} loading="lazy" className="h-9 w-auto mix-blend-screen" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              TIMOR builds precision timepieces for people who measure life in moments, not minutes.
            </p>
          </div>
          <div>
            <p className="eyebrow">Shop</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li><Link to="/collection" className="hover:text-foreground">All Watches</Link></li>
              <li><Link to="/craftsmanship" className="hover:text-foreground">Craftsmanship</Link></li>
              <li><Link to="/checkout" className="hover:text-foreground">Checkout</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Follow</p>
            <div className="mt-5 flex gap-3">
              <a href="https://instagram.com" aria-label="Instagram" className="border border-border p-3 text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://facebook.com" aria-label="Facebook" className="border border-border p-3 text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">support@timor.com</p>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center text-xs tracking-[0.2em] text-muted-foreground uppercase">
        © {new Date().getFullYear()} TIMOR
      </div>
    </footer>
  );
}
