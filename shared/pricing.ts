export const MAIN_COIN_ID = "coin120year";
export const FOUNDERS_SET_ID = "jewelset7";

export const MAIN_COIN_PRICE = 59.06;
export const FOUNDERS_SET_PRICE = 159.06;
export const FOUNDERS_BUNDLE_DISCOUNT_RATE = 0.30;

export type PricedCartItem = {
  id: string;
  quantity: number;
};

export function getFoundersBundlePairCount(items: PricedCartItem[]): number {
  const mainCoinQuantity = items.find((item) => item.id === MAIN_COIN_ID)?.quantity ?? 0;
  const foundersSetQuantity = items.find((item) => item.id === FOUNDERS_SET_ID)?.quantity ?? 0;
  return Math.min(mainCoinQuantity, foundersSetQuantity);
}

export function getFoundersBundleDiscountCents(items: PricedCartItem[]): number {
  const pairCount = getFoundersBundlePairCount(items);
  const bundlePriceCents = Math.round((MAIN_COIN_PRICE + FOUNDERS_SET_PRICE) * 100);
  const discountPerPairCents = Math.round(bundlePriceCents * FOUNDERS_BUNDLE_DISCOUNT_RATE);
  return pairCount * discountPerPairCents;
}
