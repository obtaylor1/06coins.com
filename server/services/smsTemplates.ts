import type { Order } from '@shared/schema';

// Helper to format currency
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Helper to get customer first name
function getFirstName(customerName: string | null | undefined): string {
  if (!customerName) return 'there';
  const parts = customerName.trim().split(' ');
  return parts[0] || 'there';
}

// Helper to get short product description
function getProductSummary(order: Order): string {
  const cartItems = order.cartItems as any[] | null;
  if (!cartItems || cartItems.length === 0) {
    return `${order.quantity} coin${order.quantity > 1 ? 's' : ''}`;
  }
  
  if (cartItems.length === 1) {
    return cartItems[0].name;
  }
  
  return `${cartItems.length} items`;
}

// 1. Order Confirmation SMS (sent immediately after payment)
export function orderConfirmation(order: Order): string {
  const firstName = getFirstName(order.customerName);
  const total = formatCurrency(order.totalAmount);
  
  return `Thank you ${firstName}! Your Alpha Phi Alpha coin order (${total}) is confirmed. Order #${order.id.slice(0, 8)}. We'll text you when it ships! Reply STOP to opt out.`;
}

// 2. Shipping Confirmation SMS (sent when order ships)
export function shippingConfirmation(order: Order): string {
  const firstName = getFirstName(order.customerName);
  const carrier = order.carrier || 'USPS';
  const tracking = order.trackingNumber || 'pending';
  const products = getProductSummary(order);
  
  if (tracking === 'pending') {
    return `${firstName}, your ${products} has shipped via ${carrier}! Tracking info coming soon. Order #${order.id.slice(0, 8)}. Reply STOP to opt out.`;
  }
  
  return `${firstName}, your ${products} has shipped via ${carrier}! Track: ${tracking}. Order #${order.id.slice(0, 8)}. Reply STOP to opt out.`;
}

// 3. Delivery Confirmation SMS (sent when order delivered)
export function deliveryConfirmation(order: Order): string {
  const firstName = getFirstName(order.customerName);
  const products = getProductSummary(order);
  
  return `${firstName}, your ${products} has been delivered! Enjoy your piece of Alpha Phi Alpha history. Reply STOP to opt out.`;
}

// 4. Order Problem SMS (sent when there's an issue)
export function orderProblem(order: Order, issue: string = 'issue'): string {
  const firstName = getFirstName(order.customerName);
  
  return `${firstName}, we have an ${issue} with order #${order.id.slice(0, 8)}. Please check your email or contact us at support@06coins.com. Reply STOP to opt out.`;
}

// 5. Thank You Story SMS (sent 1-2 days after delivery)
export function thankYouStory(order: Order): string {
  const firstName = getFirstName(order.customerName);
  
  return `${firstName}, thank you for supporting Alpha Phi Alpha's 120th! Your coin represents a legacy of excellence. First of All, Servants of All. Reply STOP to opt out.`;
}

// 6. Review Request SMS (sent 5-7 days after delivery)
export function reviewRequest(order: Order): string {
  const firstName = getFirstName(order.customerName);
  
  return `${firstName}, loving your Alpha coin? Share your thoughts! Email us at support@06coins.com. Your feedback helps fellow brothers. Reply STOP to opt out.`;
}

// 7. Admin New Order Alert (sent to admin for high-value orders)
export function adminNewOrderAlert(order: Order): string {
  const total = formatCurrency(order.totalAmount);
  const products = getProductSummary(order);
  const customerName = order.customerName || 'Unknown';
  
  return `NEW ORDER: ${customerName} - ${products} (${total}). Order #${order.id.slice(0, 8)}`;
}

// 8. Admin High Value Alert (sent for orders over threshold)
export function adminHighValueAlert(order: Order, threshold: number): string {
  const total = formatCurrency(order.totalAmount);
  const customerName = order.customerName || 'Unknown';
  
  return `HIGH VALUE: ${customerName} - ${total} (>${formatCurrency(threshold)}). Order #${order.id.slice(0, 8)}`;
}

// 9. Admin Problem Alert (sent when there's a delivery issue)
export function adminProblemAlert(order: Order, problem: string): string {
  const customerName = order.customerName || 'Unknown';
  
  return `ISSUE: ${problem} - Order #${order.id.slice(0, 8)} (${customerName})`;
}

// Marketing SMS template (for future campaigns)
export function marketingSms(firstName: string, message: string): string {
  return `${firstName}, ${message} Reply STOP to opt out.`;
}

// Export all templates
export const smsTemplates = {
  orderConfirmation,
  shippingConfirmation,
  deliveryConfirmation,
  orderProblem,
  thankYouStory,
  reviewRequest,
  adminNewOrderAlert,
  adminHighValueAlert,
  adminProblemAlert,
  marketingSms,
};
