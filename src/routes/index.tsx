import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroWatch from "@/assets/hero-watch.jpg";
import craftImg from "@/assets/craft.jpg";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TIMOR — Timeless Elegance & Precision" },
      {
        name: "description",
        content:
          "Discover TIMOR luxury watches: blackened chronographs, dive automatics and minimalist dress pieces. Free nationwide delivery.",
      },
      { property: "og:title", content: "TIMOR — Timeless Elegance & Precision" },
      {
        property: "og:description",
        content: "Luxury watches built on precision, premium materials and quiet design.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = products.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroWatch}
          alt="TIMOR blackened steel chronograph"
          width={1600}
          height={1104}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
        <div className="ember absolute inset-0" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-5 pb-20 pt-32 sm:px-8">
          <p className="eyebrow">Est. Precision · Dhaka</p>
          <h1 className="mt-6 max-w-3xl text-5xl leading-[1.05] font-light sm:text-7xl">
            Timeless Elegance
            <span className="block text-primary">&amp; Precision</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Mechanical timepieces finished by hand, engineered to keep pace with a life
            measured in moments.
          </p>
          <div className="mt-10">
            <Link to="/collection" className="btn-ember">
              Explore Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Featured</p>
            <h2 className="mt-3 text-3xl font-light sm:text-4xl">The Signature Three</h2>
          </div>
          <Link
            to="/collection"
            className="shrink-0 text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="ember-top border-y border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2">
          <img
            src={craftImg}
            alt="Watchmaker assembling a mechanical movement"
            loading="lazy"
            width={1200}
            height={912}
            className="w-full border border-border object-cover"
          />
          <div>
            <p className="eyebrow">Craftsmanship</p>
            <h2 className="mt-3 text-3xl font-light sm:text-4xl">
              Every second, accounted for
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              A TIMOR movement passes through eleven pairs of hands before it leaves the
              bench. Sapphire crystal, surgical-grade steel, and a regulation tolerance of
              −2/+4 seconds per day — nothing decorative, everything deliberate.
            </p>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                ["11", "Hands per piece"],
                ["−2/+4s", "Daily accuracy"],
                ["5 yr", "Movement warranty"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-light text-primary">{value}</dt>
                  <dd className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
            <Link to="/craftsmanship" className="btn-ghost-line mt-10">
              Our Philosophy
            </Link>
          </div>
        </div>
      </section>

      {/* Rest of collection */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <p className="eyebrow">The Collection</p>
        <h2 className="mt-3 text-3xl font-light sm:text-4xl">More from TIMOR</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(3).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
