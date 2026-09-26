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

export function trackPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq || !activeId) return;
  window.fbq("track", event, params);
}
