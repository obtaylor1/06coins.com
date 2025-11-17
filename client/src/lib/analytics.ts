import ReactGA from "react-ga4";

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  
  if (!measurementId) {
    console.warn("Google Analytics Measurement ID not found. Analytics tracking is disabled.");
    return false;
  }

  try {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        debug_mode: import.meta.env.DEV,
      },
    });
    console.log("Google Analytics initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize Google Analytics:", error);
    return false;
  }
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
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

// E-commerce tracking
export const trackPurchase = (transactionId: string, value: number, items: any[]) => {
  try {
    ReactGA.event("purchase", {
      transaction_id: transactionId,
      value: value,
      currency: "USD",
      items: items,
    });
  } catch (error) {
    console.error("Failed to track purchase:", error);
  }
};

export const trackAddToCart = (item: { id: string; name: string; price: number; quantity: number }) => {
  try {
    ReactGA.event("add_to_cart", {
      currency: "USD",
      value: item.price * item.quantity,
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }],
    });
  } catch (error) {
    console.error("Failed to track add to cart:", error);
  }
};

export const trackViewItem = (item: { id: string; name: string; price: number }) => {
  try {
    ReactGA.event("view_item", {
      currency: "USD",
      value: item.price,
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price,
      }],
    });
  } catch (error) {
    console.error("Failed to track view item:", error);
  }
};

// Check if GA is initialized
export const isGAInitialized = (): boolean => {
  return !!import.meta.env.VITE_GA4_MEASUREMENT_ID;
};
