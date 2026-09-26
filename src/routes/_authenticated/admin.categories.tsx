import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoriesQueryOptions, slugify, type Category } from "@/lib/categories";
import { productsQueryOptions } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesPage,
});

const empty = { id: "", name: "", slug: "", description: "" };

function CategoriesPage() {
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery(categoriesQueryOptions);
  const { data: products = [] } = useQuery(productsQueryOptions);
  const [form, setForm] = useState<Category>(empty);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function refresh() {
    qc.invalidateQueries({ queryKey: ["categories"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    const slug = slugify(form.slug || name);
    if (name.length < 2 || name.length > 60) { toast.error("Name must be 2–60 characters"); return; }
    if (!slug) { toast.error("Enter a valid URL slug"); return; }
    if (categories.some((c) => c.slug === slug && c.id !== form.id)) { toast.error("That URL slug is already used"); return; }
    setSaving(true);
    const row = { name, slug, description: form.description.trim().slice(0, 300) };
    const { error } = form.id
      ? await supabase.from("categories").update(row).eq("id", form.id)
      : await supabase.from("categories").insert(row);
    if (!error && form.id) {
      // keep product labels in sync with the renamed category
      await supabase.from("products").update({ collection: name }).eq("category_id", form.id);
    }
    setSaving(false);
    if (error) { toast.error("Couldn't save category"); return; }
    toast.success(form.id ? "Category updated" : "Category added");
    setForm(empty);
    setSlugTouched(false);
    refresh();
  }

  async function remove(c: Category) {
    const count = products.filter((p) => p.categoryId === c.id).length;
    const msg = count
      ? `Delete "${c.name}"? Its ${count} watch(es) will stay in the store without a category.`
      : `Delete "${c.name}"?`;
    if (!window.confirm(msg)) return;
    await supabase.from("products").update({ category_id: null }).eq("category_id", c.id);
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) { toast.error("Couldn't delete category"); return; }
    toast.success("Category deleted");
    if (form.id === c.id) setForm(empty);
    refresh();
  }

  function copy(url: string) {
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copied"),
      () => toast.error("Couldn't copy — select the link manually"),
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-light">Categories</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Each category gets its own page link for Meta Ads. Assign watches to a category from the Products page.
      </p>

      <form onSubmit={save} className="mt-8 space-y-4 border border-border bg-card p-6">
        <p className="eyebrow">{form.id ? "Edit category" : "Add category"}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-name">Name</Label>
            <Input
              id="c-name"
              value={form.name}
              maxLength={60}
              placeholder="e.g. Sport"
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-slug">URL slug</Label>
            <Input
              id="c-slug"
              value={form.slug}
              maxLength={60}
              placeholder="sport"
              onChange={(e) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }));
              }}
            />
          </div>
        </div>
        <p className="break-all text-xs text-muted-foreground">
          Page link: {origin}/collection/{slugify(form.slug || form.name) || "…"}
        </p>
        <div className="space-y-2">
          <Label htmlFor="c-desc">Description (optional)</Label>
          <Input
            id="c-desc"
            value={form.description}
            maxLength={300}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-ember">
            {saving ? "Saving…" : form.id ? "Save changes" : "Add category"}
          </button>
          {form.id && (
            <button type="button" className="btn-ghost-line" onClick={() => { setForm(empty); setSlugTouched(false); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="mt-8 space-y-3">
        {categories.map((c) => {
          const url = `${origin}/collection/${c.slug}`;
          const count = products.filter((p) => p.categoryId === c.id).length;
          return (
            <li key={c.id} className="flex flex-col gap-3 border border-border bg-card p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="text-lg">{c.name} <span className="text-xs text-muted-foreground">· {count} watch{count === 1 ? "" : "es"}</span></p>
                <a href={url} target="_blank" rel="noreferrer" className="break-all text-xs text-muted-foreground hover:text-foreground">{url}</a>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => copy(url)} className="flex items-center gap-1 border border-border px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  <Copy className="h-3.5 w-3.5" /> Copy link
                </button>
                <button type="button" aria-label={`Edit ${c.name}`} onClick={() => { setForm(c); setSlugTouched(true); }} className="border border-border p-2 text-muted-foreground hover:text-foreground">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" aria-label={`Delete ${c.name}`} onClick={() => remove(c)} className="border border-border p-2 text-muted-foreground hover:text-primary">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
        {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories yet.</p>}
      </ul>
    </div>
  );
}
