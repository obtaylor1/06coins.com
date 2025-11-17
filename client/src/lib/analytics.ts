import ReactGA from "react-ga4";

// Track GA initialization status
let gaInitialized = false;

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  
  if (!measurementId) {
    console.warn("Google Analytics Measurement ID not found. Analytics tracking is disabled.");
    gaInitialized = false;
    return false;
  }

  try {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        debug_mode: import.meta.env.DEV,
      },
    });
    gaInitialized = true;
    console.log("Google Analytics initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize Google Analytics:", error);
    gaInitialized = false;
    return false;
  }
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (!gaInitialized) return;
  
  try {
    ReactGA.send({ 
      hitType: "pageview", 
      page: path,
      title: title || document.title
    });
  } catch (error) {
    console.error("Failed to track page view:", error);
  }
};

// Track custom events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (!gaInitialized) return;
  
  try {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
};

// Sanitize item data to prevent PII leakage
const sanitizeItem = (item: any) => ({
  item_id: item.item_id || item.id,
  item_name: item.item_name || item.name,
  price: item.price,
  quantity: item.quantity || 1,
});

// E-commerce tracking
export const trackPurchase = (transactionId: string, value: number, items: any[]) => {
  if (!gaInitialized) return;
  
  try {
    // Sanitize items to only include allowed fields
    const sanitizedItems = items.map(sanitizeItem);
    
    ReactGA.event("purchase", {
      transaction_id: transactionId,
      value: value,
      currency: "USD",
      items: sanitizedItems,
    });
  } catch (error) {
    console.error("Failed to track purchase:", error);
  }
};

export const trackAddToCart = (item: { id: string; name: string; price: number; quantity: number }) => {
  if (!gaInitialized) return;
  
  try {
    ReactGA.event("add_to_cart", {
      currency: "USD",
      value: item.price * item.quantity,
      items: [sanitizeItem({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })],
    });
  } catch (error) {
    console.error("Failed to track add to cart:", error);
  }
};

export const trackViewItem = (item: { id: string; name: string; price: number }) => {
  if (!gaInitialized) return;
  
  try {
    ReactGA.event("view_item", {
      currency: "USD",
      value: item.price,
      items: [sanitizeItem({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
      })],
    });
  } catch (error) {
    console.error("Failed to track view item:", error);
  }
};

// Check if GA is initialized (actual initialization status, not just env var)
export const isGAInitialized = (): boolean => {
  return gaInitialized;
};

// Check if GA measurement ID is configured
export const isGAConfigured = (): boolean => {
  return !!import.meta.env.VITE_GA4_MEASUREMENT_ID;
};

// Get measurement ID for display (masked)
export const getGAMeasurementId = (): string | null => {
  return import.meta.env.VITE_GA4_MEASUREMENT_ID || null;
};
