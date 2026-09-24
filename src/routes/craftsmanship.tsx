import { createFileRoute, Link } from "@tanstack/react-router";
import craftImg from "@/assets/craft.jpg";

export const Route = createFileRoute("/craftsmanship")({
  head: () => ({
    meta: [
      { title: "Craftsmanship — TIMOR" },
      {
        name: "description",
        content:
          "How TIMOR builds a watch: hand-finished movements, sapphire crystal, surgical-grade steel and a minimalist design philosophy.",
      },
      { property: "og:title", content: "Craftsmanship — TIMOR" },
      {
        property: "og:description",
        content: "Hand-finished movements, premium materials, and a minimalist philosophy.",
      },
    ],
  }),
  component: Craftsmanship,
});

const pillars = [
  {
    title: "Precision first",
    text: "Each movement is regulated on a timegrapher across five positions before assembly is signed off.",
  },
  {
    title: "Premium materials",
    text: "316L and grade 5 titanium cases, sapphire crystal, and straps cut from full-grain leather.",
  },
  {
    title: "Minimalist philosophy",
    text: "Nothing on a TIMOR dial exists for decoration. If it does not tell you something, it is removed.",
  },
];

function Craftsmanship() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={craftImg}
          alt="Watchmaker at the bench"
          width={1200}
          height={912}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />
        <div className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8">
          <p className="eyebrow">Craftsmanship</p>
          <h1 className="mt-4 max-w-2xl text-4xl leading-tight font-light sm:text-6xl">
            Built at the bench, not on a line
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {pillars.map((p, i) => (
            <div key={p.title} className="border-t border-border pt-8">
              <span className="text-xs tracking-[0.3em] text-primary">0{i + 1}</span>
              <h2 className="mt-4 text-2xl font-light">{p.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-20">
          <Link to="/collection" className="btn-ember">
            Explore Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
