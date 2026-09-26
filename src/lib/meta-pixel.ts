type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: unknown;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let activeId: string | null = null;

export function isValidPixelId(id: string) {
  return /^\d{10,20}$/.test(id);
}

/** Installs the Meta Pixel base code once for the given ID. */
export function initMetaPixel(id: string) {
  if (typeof window === "undefined" || !isValidPixelId(id) || activeId === id) return;
  if (!window.fbq) {
    const fbq: Fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue!.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  window.fbq("init", id);
  activeId = id;
}

function readCookie(name: string) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1] ?? "") : undefined;
}

type CapiEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

/** Fires the browser Pixel and the server-side Conversions API with a shared event ID for deduplication. */
export function trackPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq || !activeId) return;
  const eventId = `${event}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.fbq("track", event, params, { eventID: eventId });
  import("./capi.functions")
    .then(({ sendCapiEvent }) =>
      sendCapiEvent({
        data: {
          event: event as CapiEvent,
          eventId,
          url: window.location.href,
          fbp: readCookie("_fbp"),
          fbc: readCookie("_fbc"),
          customData: params,
        },
      }),
    )
    .catch(() => {});
}
