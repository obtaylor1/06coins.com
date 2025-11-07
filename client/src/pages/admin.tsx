import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  ShoppingCart,
  User,
  Mail,
  MapPin,
  RefreshCw
} from "lucide-react";
import type { Order, Inventory } from "@shared/schema";

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  totalCoinsSold: number;
  totalProfit: number;
  initialStock: number;
  remainingStock: number;
  soldPercentage: string;
}

export default function Admin() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [newStock, setNewStock] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    // Check admin status
    if (!isLoading && isAuthenticated && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have admin privileges.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isLoading, isAdmin, toast]);

  const { data: inventory } = useQuery<Inventory>({
    queryKey: ['/api/inventory'],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/admin/analytics'],
    enabled: isAuthenticated && isAdmin,
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async (remainingStock: number) => {
      await apiRequest("PATCH", "/api/admin/inventory", { remainingStock });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics'] });
      toast({
        title: "Inventory Updated",
        description: "Stock levels have been updated successfully.",
      });
      setNewStock("");
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateStock = () => {
    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid stock number.",
        variant: "destructive",
      });
      return;
    }
    updateInventoryMutation.mutate(stock);
  };

  const handleResetTo1906 = () => {
    if (confirm("Are you sure you want to reset the inventory to 1906 coins?")) {
      updateInventoryMutation.mutate(1906);
    }
  };

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatAddress = (address: any) => {
    if (!address) return "No shipping address";
    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postal_code,
      address.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-serif text-primary tracking-monumental">
            Admin Dashboard
          </h1>
          <div className="flex gap-3 items-center">
            <span className="text-foreground/80">
              {user?.firstName || user?.email}
            </span>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/"}
              data-testid="button-home"
            >
              Back to Site
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="text-total-revenue">
                {formatCurrency(analytics?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-foreground/60 mt-1">
                From {analytics?.totalOrders || 0} orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500" data-testid="text-total-profit">
                {formatCurrency(analytics?.totalProfit || 0)}
              </div>
              <p className="text-xs text-foreground/60 mt-1">
                $20 profit per coin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coins Sold</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="text-coins-sold">
                {analytics?.totalCoinsSold || 0}
              </div>
              <p className="text-xs text-foreground/60 mt-1">
                {analytics?.soldPercentage || 0}% of inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Remaining</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="text-remaining-stock">
                {analytics?.remainingStock || 0}
              </div>
              <p className="text-xs text-foreground/60 mt-1">
                of {analytics?.initialStock || 1906} initial
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Management */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-serif text-primary">Inventory Management</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-foreground/80">Current Stock</p>
              <p className="text-3xl font-bold text-primary" data-testid="text-current-stock">
                {inventory?.remainingStock ?? 0} coins
              </p>
              <p className="text-sm text-foreground/60">
                Last updated: {inventory?.lastUpdated ? new Date(inventory.lastUpdated).toLocaleString() : 'Never'}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-foreground/80">Update Stock Level</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="Enter new stock quantity"
                  data-testid="input-new-stock"
                />
                <Button
                  onClick={handleUpdateStock}
                  disabled={updateInventoryMutation.isPending}
                  data-testid="button-update-stock"
                >
                  {updateInventoryMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-foreground/80">Quick Actions</label>
              <Button
                onClick={handleResetTo1906}
                variant="outline"
                disabled={updateInventoryMutation.isPending}
                className="w-full"
                data-testid="button-reset-1906"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to 1906 Coins
              </Button>
            </div>
          </div>
        </Card>

        {/* Orders Management */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-serif text-primary">Customer Orders & Shipping</h2>
          <div className="space-y-4">
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <div 
                  key={order.id} 
                  className="border border-primary/20 rounded-lg p-4 space-y-3"
                  data-testid={`card-order-${order.id}`}
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          Order #{order.id.substring(0, 8)}
                        </h3>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/70">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-sm text-foreground/70">
                        {order.quantity} coin{order.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-primary/10">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs text-foreground/60">Customer Name</p>
                          <p className="text-sm font-medium text-foreground">
                            {order.customerName || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs text-foreground/60">Email</p>
                          <p className="text-sm font-medium text-foreground break-all">
                            {order.customerEmail || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs text-foreground/60">Shipping Address</p>
                          <p className="text-sm font-medium text-foreground">
                            {formatAddress(order.shippingAddress)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Intent ID */}
                  <div className="pt-2 border-t border-primary/10">
                    <p className="text-xs text-foreground/60">
                      Stripe Payment Intent: <span className="font-mono">{order.stripePaymentIntentId}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                <p className="text-foreground/60">No orders yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
