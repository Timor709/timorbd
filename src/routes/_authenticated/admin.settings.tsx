import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidPixelId } from "@/lib/meta-pixel";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data } = useQuery({
    queryKey: ["setting", "meta_pixel_id"],
    queryFn: async () => {
      const { data } = await supabase.from("store_settings").select("value").eq("key", "meta_pixel_id").maybeSingle();
      return data?.value ?? "";
    },
  });
  const [pixel, setPixel] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (data !== undefined) setPixel(data);
  }, [data]);

  async function save() {
    const value = pixel.trim();
    if (value && !isValidPixelId(value)) {
      toast.error("A Pixel ID is 10–20 digits");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("store_settings").upsert({ key: "meta_pixel_id", value });
    setSaving(false);
    if (error) toast.error("Couldn't save");
    else toast.success(value ? "Meta Pixel saved — live on next page load" : "Meta Pixel turned off");
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-light">Settings</h1>
      <div className="mt-8 border border-border bg-card p-6">
        <p className="eyebrow">Meta Pixel</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Tracks PageView, ViewContent, AddToCart and Purchase. Find your ID in Meta Events Manager. Leave empty to turn off.
        </p>
        <div className="mt-6 space-y-2">
          <Label htmlFor="pixel">Pixel ID</Label>
          <Input id="pixel" inputMode="numeric" placeholder="e.g. 123456789012345" value={pixel} onChange={(e) => setPixel(e.target.value)} />
        </div>
        <button onClick={save} disabled={saving} className="btn-ember mt-6">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
