import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatBDT, resolveImage } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsAdmin,
});

type Row = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compare_at: number | null;
  description: string;
  image_url: string;
  collection: string;
  category_id: string | null;
  in_stock: boolean;
  stock: number;
  straps: string[];
  sizes: string[];
  featured: boolean;
};

type FormState = {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  price: string;
  compare_at: string;
  description: string;
  image_url: string;
  category_id: string;
  stock: string;
  straps: string;
  sizes: string;
  featured: boolean;
};

const empty: FormState = {
  name: "", slug: "", tagline: "", price: "", compare_at: "", description: "", image_url: "",
  category_id: "", stock: "0", straps: "", sizes: "", featured: false,
};

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z.string().trim().regex(/^[a-z0-9-]{2,80}$/, "Link name: lowercase letters, numbers and dashes"),
  tagline: z.string().trim().max(160),
  price: z.coerce.number().int().min(1, "Price must be above 0"),
  compare_at: z.union([z.literal(""), z.coerce.number().int().min(1)]),
  description: z.string().trim().max(3000),
  stock: z.coerce.number().int().min(0, "Stock can't be negative"),
});

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function ProductsAdmin() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at");
      if (error) throw error;
      return data as unknown as Row[];
    },
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  function edit(p: Row) {
    setForm({
      id: p.id, name: p.name, slug: p.slug, tagline: p.tagline, price: String(p.price),
      compare_at: p.compare_at ? String(p.compare_at) : "", description: p.description,
      image_url: p.image_url, category_id: p.category_id ?? "", stock: String(p.stock),
      straps: p.straps.join(", "), sizes: p.sizes.join(", "), featured: p.featured,
    });
  }

  async function upload(file: File): Promise<void> {
    if (!form) return;
    if (!file.type.startsWith("image/")) return void toast.error("Please choose an image");
    setUploading(true);
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) return void toast.error("Upload failed");
    setForm({ ...form, image_url: `storage:${path}` });
  }

  async function save(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!form) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) return void toast.error(parsed.error.issues[0]?.message ?? "Check the form");
    if (!form.image_url) return void toast.error("Add a product photo");
    const category = categories?.find((c) => c.id === form.category_id);
    const payload = {
      name: parsed.data.name,
      slug: parsed.data.slug,
      tagline: parsed.data.tagline,
      price: parsed.data.price,
      compare_at: parsed.data.compare_at === "" ? null : parsed.data.compare_at,
      description: parsed.data.description,
      image_url: form.image_url,
      category_id: category?.id ?? null,
      collection: category?.name ?? "Essential",
      stock: parsed.data.stock,
      in_stock: parsed.data.stock > 0,
      straps: list(form.straps),
      sizes: list(form.sizes),
      featured: form.featured,
    };
    setSaving(true);
    const { error } = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) return void toast.error(error.code === "23505" ? "That link name is already used" : "Couldn't save product");
    toast.success(form.id ? "Product updated" : "Product added");
    setForm(null);
    refresh();
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const { error } = await supabase.from("products").delete().eq("id", toDelete.id);
    if (error) toast.error("Couldn't delete product");
    else {
      toast.success("Product deleted");
      refresh();
    }
    setToDelete(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-light">Products</h1>
        <button onClick={() => setForm({ ...empty, category_id: categories?.[0]?.id ?? "" })} className="btn-ember">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="mt-8 divide-y divide-border border border-border">
        {products?.map((p) => (
          <div key={p.id} className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 p-3">
            <img src={resolveImage(p.image_url)} alt={p.name} className="h-14 w-14 object-cover" />
            <div className="min-w-0">
              <p className="truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBDT(p.price)} · {p.collection} · {p.stock > 0 ? `${p.stock} in stock` : "Sold out"}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => edit(p)} aria-label={`Edit ${p.name}`} className="border border-border p-2 hover:border-primary/60">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => setToDelete(p)} aria-label={`Delete ${p.name}`} className="border border-border p-2 hover:border-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-light">{form?.id ? "Edit product" : "Add product"}</DialogTitle>
          </DialogHeader>
          {form && (
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Photo</Label>
                <div className="flex items-center gap-4">
                  {form.image_url ? (
                    <img src={resolveImage(form.image_url)} alt="" className="h-20 w-20 object-cover" />
                  ) : (
                    <div className="h-20 w-20 border border-dashed border-border" />
                  )}
                  <label className="btn-ghost-line cursor-pointer">
                    <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                  </label>
                </div>
              </div>
              <Field label="Name">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })} />
              </Field>
              <Field label="Link name">
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </Field>
              <Field label="Tagline" wide>
                <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
              </Field>
              <Field label="Price (৳)">
                <Input inputMode="numeric" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </Field>
              <Field label="Compare-at price (৳, optional)">
                <Input inputMode="numeric" value={form.compare_at} onChange={(e) => setForm({ ...form, compare_at: e.target.value })} />
              </Field>
              <Field label="Category">
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="h-9 w-full border border-input bg-background px-3 text-sm">
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Stock">
                <Input inputMode="numeric" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </Field>
              <Field label="Straps (comma separated)">
                <Input value={form.straps} onChange={(e) => setForm({ ...form, straps: e.target.value })} />
              </Field>
              <Field label="Dial sizes (comma separated)">
                <Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
              </Field>
              <Field label="Description" wide>
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured on homepage
              </label>
              <div className="flex justify-end gap-3 sm:col-span-2">
                <button type="button" onClick={() => setForm(null)} className="btn-ghost-line">Cancel</button>
                <button type="submit" disabled={saving || uploading} className="btn-ember">{saving ? "Saving…" : "Save product"}</button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>It will disappear from the shop right away. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-2 ${wide ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
