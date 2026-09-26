import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

const schema = z.object({
  event: z.enum(["PageView", "ViewContent", "AddToCart", "InitiateCheckout", "Purchase"]),
  eventId: z.string().min(1).max(100),
  url: z.string().url().max(2000),
  fbp: z.string().max(200).optional(),
  fbc: z.string().max(300).optional(),
  customData: z.record(z.string(), z.unknown()).optional(),
});

/** Public: forwards a storefront event to Meta Conversions API using the admin-saved token. */
export const sendCapiEvent = createServerFn({ method: "POST" })
  .inputValidator((d) => schema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: pixel }, { data: token }] = await Promise.all([
      supabaseAdmin.from("store_settings").select("value").eq("key", "meta_pixel_id").maybeSingle(),
      supabaseAdmin.from("private_settings").select("value").eq("key", "meta_capi_token").maybeSingle(),
    ]);
    const pixelId = pixel?.value?.trim();
    const accessToken = token?.value?.trim();
    if (!pixelId || !accessToken) return { sent: false };

    const ip = (getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for") || "").split(",")[0].trim();
    const ua = getRequestHeader("user-agent") || "";
    const body = {
      data: [
        {
          event_name: data.event,
          event_time: Math.floor(Date.now() / 1000),
          event_id: data.eventId,
          event_source_url: data.url,
          action_source: "website",
          user_data: {
            ...(ip ? { client_ip_address: ip } : {}),
            ...(ua ? { client_user_agent: ua } : {}),
            ...(data.fbp ? { fbp: data.fbp } : {}),
            ...(data.fbc ? { fbc: data.fbc } : {}),
          },
          ...(data.customData ? { custom_data: data.customData } : {}),
        },
      ],
    };
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
        { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
      );
      if (!res.ok) console.error("CAPI error", res.status, await res.text());
      return { sent: res.ok };
    } catch (e) {
      console.error("CAPI failed", e);
      return { sent: false };
    }
  });
