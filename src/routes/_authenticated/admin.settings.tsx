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
    queryKey: ["setting", "meta"],
    queryFn: async () => {
      const [p, t] = await Promise.all([
        supabase.from("store_settings").select("value").eq("key", "meta_pixel_id").maybeSingle(),
        supabase.from("private_settings").select("value").eq("key", "meta_capi_token").maybeSingle(),
      ]);
      return { pixel: p.data?.value ?? "", token: t.data?.value ?? "" };
    },
  });
  const [pixel, setPixel] = useState("");
  const [token, setToken] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (data) {
      setPixel(data.pixel);
      setToken(data.token);
    }
  }, [data]);

  async function save() {
    const value = pixel.trim();
    const tok = token.trim();
    if (value && !isValidPixelId(value)) {
      toast.error("A Pixel ID is 10–20 digits");
      return;
    }
    if (tok && !/^[A-Za-z0-9_-]{20,1000}$/.test(tok)) {
      toast.error("That doesn't look like a valid access token");
      return;
    }
    setSaving(true);
    const [a, b] = await Promise.all([
      supabase.from("store_settings").upsert({ key: "meta_pixel_id", value }),
      supabase.from("private_settings").upsert({ key: "meta_capi_token", value: tok }),
    ]);
    setSaving(false);
    if (a.error || b.error) toast.error("Couldn't save");
    else toast.success("Meta settings saved — live on next page load");
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-light">Settings</h1>
      <DeliverySettings />
      <div className="mt-8 border border-border bg-card p-6">
        <p className="eyebrow">Meta Pixel & Conversions API</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Tracks PageView, ViewContent, AddToCart and Purchase in the browser and, with a token, from the server too
          (duplicates are merged by Meta). Find both in Meta Events Manager. Leave empty to turn off.
        </p>
        <div className="mt-6 space-y-2">
          <Label htmlFor="pixel">Pixel ID</Label>
          <Input id="pixel" inputMode="numeric" placeholder="e.g. 123456789012345" value={pixel} onChange={(e) => setPixel(e.target.value)} />
        </div>
        <div className="mt-5 space-y-2">
          <Label htmlFor="capi">Conversions API access token</Label>
          <div className="flex gap-2">
            <Input
              id="capi"
              type={show ? "text" : "password"}
              autoComplete="off"
              placeholder="EAAB…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="border border-border px-3 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              {show ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Kept private — only admins can see it; it is never sent to visitors' browsers.</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-ember mt-6">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

function DeliverySettings() {
  const qc = useQueryClient();
  const { data } = useQuery(deliveryRatesQueryOptions);
  const [inside, setInside] = useState("");
  const [outside, setOutside] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (data) {
      setInside(String(data.inside));
      setOutside(String(data.outside));
    }
  }, [data]);

  async function save() {
    const a = Number(inside), b = Number(outside);
    if (![a, b].every((n) => Number.isInteger(n) && n >= 0 && n <= 100000)) {
      toast.error("Enter whole amounts in ৳ (0 for free)");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("store_settings").upsert([
      { key: "delivery_inside_dhaka", value: String(a) },
      { key: "delivery_outside_dhaka", value: String(b) },
    ]);
    setSaving(false);
    if (error) toast.error("Couldn't save");
    else {
      toast.success("Delivery charges saved");
      qc.invalidateQueries({ queryKey: deliveryRatesQueryOptions.queryKey });
    }
  }

  return (
    <div className="mt-8 border border-border bg-card p-6">
      <p className="eyebrow">Delivery charge</p>
      <p className="mt-3 text-sm text-muted-foreground">
        Added to every order at checkout based on the customer's district. Use 0 for free delivery.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="d-in">Inside Dhaka (৳)</Label>
          <Input id="d-in" inputMode="numeric" value={inside} onChange={(e) => setInside(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="d-out">Outside Dhaka (৳)</Label>
          <Input id="d-out" inputMode="numeric" value={outside} onChange={(e) => setOutside(e.target.value)} />
        </div>
      </div>
      <button onClick={save} disabled={saving} className="btn-ember mt-6">
        {saving ? "Saving…" : "Save delivery charges"}
      </button>
    </div>
  );
}
