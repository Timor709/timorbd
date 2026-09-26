import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DHAKA_DISTRICT_ID = "47";
export type DeliveryRates = { inside: number; outside: number };

export const deliveryRatesQueryOptions = queryOptions({
  queryKey: ["setting", "delivery"],
  staleTime: 10_000,
  queryFn: async (): Promise<DeliveryRates> => {
    const { data } = await supabase
      .from("store_settings")
      .select("key,value")
      .in("key", ["delivery_inside_dhaka", "delivery_outside_dhaka"]);
    const get = (k: string) => {
      const n = Number(data?.find((r) => r.key === k)?.value ?? 0);
      return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
    };
    return { inside: get("delivery_inside_dhaka"), outside: get("delivery_outside_dhaka") };
  },
});

export function useDeliveryFee(districtId: string) {
  const { data } = useQuery(deliveryRatesQueryOptions);
  const rates = data ?? { inside: 0, outside: 0 };
  const fee = !districtId ? null : districtId === DHAKA_DISTRICT_ID ? rates.inside : rates.outside;
  return { fee, rates };
}
