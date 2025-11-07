import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Order, Inventory } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [newStock, setNewStock] = useState("");

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

  const updateInventoryMutation = useMutation({
    mutationFn: async (remainingStock: number) => {
      await apiRequest("PATCH", "/api/admin/inventory", { remainingStock });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
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

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Inventory Management */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-serif text-primary">Inventory Management</h2>
          <div className="grid md:grid-cols-2 gap-4">
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
          </div>
        </Card>

        {/* Orders Management */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-serif text-primary">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/30">
                  <th className="text-left p-3 text-foreground/80">Order ID</th>
                  <th className="text-left p-3 text-foreground/80">Quantity</th>
                  <th className="text-left p-3 text-foreground/80">Amount</th>
                  <th className="text-left p-3 text-foreground/80">Status</th>
                  <th className="text-left p-3 text-foreground/80">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-foreground/10" data-testid={`row-order-${order.id}`}>
                      <td className="p-3 text-sm font-mono text-foreground/70">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="p-3 text-foreground">{order.quantity}</td>
                      <td className="p-3 text-foreground">${(order.totalAmount / 100).toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-foreground/70">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-foreground/60">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
