import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/cart-context";
import { AnalyticsProvider } from "@/contexts/analytics-context";
import { trackPageView } from "@/lib/analytics";
const Home = lazy(() => import("@/pages/home"));
const ShopCoins = lazy(() => import("@/pages/shop-coins"));
const Checkout = lazy(() => import("@/pages/checkout"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Admin = lazy(() => import("@/pages/admin"));
const AdminOverview = lazy(() => import("@/pages/admin/overview"));
const AdminOrders = lazy(() => import("@/pages/admin/orders"));
const AdminOrderDetail = lazy(() => import("@/pages/admin/order-detail"));
const AdminInventory = lazy(() => import("@/pages/admin/inventory"));
const AdminProductDetail = lazy(() => import("@/pages/admin/product-detail"));
const AdminCustomers = lazy(() => import("@/pages/admin/customers"));
const AdminCertificates = lazy(() => import("@/pages/admin/certificates"));
const AdminCustomerDetail = lazy(() => import("@/pages/admin/customer-detail"));
const AdminReports = lazy(() => import("@/pages/admin/reports"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));
const Policies = lazy(() => import("@/pages/policies"));
const VerifyCertificate = lazy(() => import("@/pages/verify-certificate"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  const [location] = useLocation();

  // Track page views on route changes
  useEffect(() => {
    trackPageView(location);
  }, [location]);

  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background text-foreground grid place-items-center" aria-live="polite">
        <p className="font-serif text-primary tracking-wide">Loading 06coins…</p>
      </main>
    }>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/shop-coins" component={ShopCoins} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/verify" component={VerifyCertificate} />
        <Route path="/admin/orders/:orderId" component={AdminOrderDetail} />
        <Route path="/admin/inventory/:productId" component={AdminProductDetail} />
        <Route path="/admin/customers/:customerId" component={AdminCustomerDetail} />
        <Route path="/admin/overview" component={AdminOverview} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/inventory" component={AdminInventory} />
        <Route path="/admin/customers" component={AdminCustomers} />
        <Route path="/admin/certificates" component={AdminCertificates} />
        <Route path="/admin/reports" component={AdminReports} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin" component={Admin} />
        <Route path="/shipping">{() => <Policies type="shipping" />}</Route>
        <Route path="/returns">{() => <Policies type="returns" />}</Route>
        <Route path="/privacy">{() => <Policies type="privacy" />}</Route>
        <Route path="/terms">{() => <Policies type="terms" />}</Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </AnalyticsProvider>
    </QueryClientProvider>
  );
}

export default App;
