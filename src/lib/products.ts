import watch1 from "@/assets/watch-1.jpg";
import watch2 from "@/assets/watch-2.jpg";
import watch3 from "@/assets/watch-3.jpg";
import watch4 from "@/assets/watch-4.jpg";
import watch5 from "@/assets/watch-5.jpg";
import watch6 from "@/assets/watch-6.jpg";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compareAt?: number;
  image: string;
  collection: string;
  inStock: boolean;
  description: string;
  straps: string[];
  sizes: string[];
  specs: { label: string; value: string }[];
};

export const products: Product[] = [
  {
    slug: "meridian-noir",
    name: "Meridian Noir",
    tagline: "Blackened steel chronograph",
    price: 24500,
    compareAt: 28900,
    image: watch3,
    collection: "Noir",
    inStock: true,
    description:
      "A stealth chronograph finished in matte blackened steel with a skeletonised movement. Built for those who prefer presence over noise.",
    straps: ["Black Steel", "Black Leather", "Rubber"],
    sizes: ["40 mm", "42 mm", "44 mm"],
    specs: [
      { label: "Movement", value: "Automatic, 42h reserve" },
      { label: "Case", value: "316L blackened steel" },
      { label: "Glass", value: "Sapphire, anti-reflective" },
      { label: "Water resistance", value: "10 ATM" },
    ],
  },
  {
    slug: "abyss-diver",
    name: "Abyss Diver",
    tagline: "Deep blue dive automatic",
    price: 19900,
    image: watch1,
    collection: "Marine",
    inStock: true,
    description:
      "A 200 m dive automatic with a sunburst blue dial, unidirectional bezel and luminous markers legible at depth.",
    straps: ["Steel Bracelet", "Navy Rubber"],
    sizes: ["40 mm", "42 mm"],
    specs: [
      { label: "Movement", value: "Automatic, 40h reserve" },
      { label: "Case", value: "Brushed stainless steel" },
      { label: "Glass", value: "Domed sapphire" },
      { label: "Water resistance", value: "20 ATM" },
    ],
  },
  {
    slug: "heritage-gold",
    name: "Heritage Gold",
    tagline: "Gold-cased dress watch",
    price: 32900,
    image: watch2,
    collection: "Heritage",
    inStock: true,
    description:
      "A slim dress piece with a champagne dial and hand-stitched leather strap. Quiet formality, made to be inherited.",
    straps: ["Brown Leather", "Black Leather"],
    sizes: ["38 mm", "40 mm"],
    specs: [
      { label: "Movement", value: "Hand-wound, 45h reserve" },
      { label: "Case", value: "Gold-plated steel, 8.2 mm" },
      { label: "Glass", value: "Sapphire" },
      { label: "Water resistance", value: "5 ATM" },
    ],
  },
  {
    slug: "pure-minimal",
    name: "Pure Minimal",
    tagline: "White dial, mesh bracelet",
    price: 14900,
    compareAt: 17500,
    image: watch4,
    collection: "Essential",
    inStock: true,
    description:
      "Reduced to the essentials: a clean white dial, needle hands and a milanese mesh bracelet that disappears on the wrist.",
    straps: ["Steel Mesh", "Tan Leather"],
    sizes: ["36 mm", "39 mm"],
    specs: [
      { label: "Movement", value: "Swiss quartz" },
      { label: "Case", value: "Polished steel, 7.4 mm" },
      { label: "Glass", value: "Sapphire" },
      { label: "Water resistance", value: "3 ATM" },
    ],
  },
  {
    slug: "ember-rose",
    name: "Ember Rose",
    tagline: "Rose gold chronograph",
    price: 27500,
    image: watch5,
    collection: "Noir",
    inStock: true,
    description:
      "Rose gold case against a deep black dial with three counters. Warmth and contrast in equal measure.",
    straps: ["Rose Gold Bracelet", "Black Leather"],
    sizes: ["40 mm", "42 mm"],
    specs: [
      { label: "Movement", value: "Automatic chronograph" },
      { label: "Case", value: "Rose gold PVD steel" },
      { label: "Glass", value: "Sapphire" },
      { label: "Water resistance", value: "10 ATM" },
    ],
  },
  {
    slug: "altitude-field",
    name: "Altitude Field",
    tagline: "Titanium field automatic",
    price: 21900,
    image: watch6,
    collection: "Marine",
    inStock: false,
    description:
      "A lightweight titanium field watch with a forest green dial and full lume indices. Made for long distances.",
    straps: ["Titanium Bracelet", "Green NATO"],
    sizes: ["39 mm", "41 mm"],
    specs: [
      { label: "Movement", value: "Automatic, 50h reserve" },
      { label: "Case", value: "Grade 5 titanium" },
      { label: "Glass", value: "Sapphire" },
      { label: "Water resistance", value: "10 ATM" },
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function formatBDT(amount: number) {
  return `৳${amount.toLocaleString("en-US")}`;
}
