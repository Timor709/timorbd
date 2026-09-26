import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { initMetaPixel, trackPixel } from "@/lib/meta-pixel";

/** Loads Meta Pixel from store settings, tracks page views, and keeps products live. */
export function StoreEffects() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("store_settings")
      .select("value")
      .eq("key", "meta_pixel_id")
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data?.value) return;
        initMetaPixel(data.value.trim());
        trackPixel("PageView");
      });
    const unsub = router.subscribe("onResolved", ({ pathChanged }) => {
      if (pathChanged) trackPixel("PageView");
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [router]);

  useEffect(() => {
    const channel = supabase
      .channel("products-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        router.invalidate();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, router]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient, router]);

  return null;
}
