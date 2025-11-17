// SEO configuration for the site
// This avoids runtime window.location calls that break SSR/tests

export const SEO_CONFIG = {
  siteUrl: "https://06coins.com",
  siteName: "Alpha Phi Alpha 120th Anniversary Commemorative Coin",
  defaultTitle: "Alpha Phi Alpha 120th Anniversary Commemorative Coin - Limited Edition 1906 Coins",
  defaultDescription: "Exclusive limited edition 4-inch commemorative coin celebrating 120 years of Alpha Phi Alpha Fraternity (1906-2026). Own a piece of history with only 1906 coins available. Shop now.",
  defaultImage: "/favicon.png",
  twitterHandle: "@AlphaPhiAlpha",
  locale: "en_US",
  type: "website",
};

export function getAbsoluteUrl(path: string = ""): string {
  // Use configured URL in production, fallback to window in dev
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return `${window.location.origin}${path}`;
  }
  return `${SEO_CONFIG.siteUrl}${path}`;
}
