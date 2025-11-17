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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  ShoppingCart,
  User,
  Mail,
  MapPin,
  Minus,
  Plus,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  BarChart3,
  ExternalLink,
  MessageSquare,
  Send,
  Clock,
  Truck,
  PackageCheck,
} from "lucide-react";
import { useAnalytics } from "@/contexts/analytics-context";
import type { Order, SmsLog } from "@shared/schema";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  totalCoinsSold: number;
  totalProfit: number;
  initialStock: number;
  remainingStock: number;
  soldPercentage: string;
}

interface EnhancedInventory {
  id: string;
  productId: string;
  productName: string;
  remainingStock: number;
  initialStock: number;
  sold: number;
  avgDailySales: number;
  daysOfStock: number | null;
  reorderLevel: number;
  status: string;
  lastUpdated: string;
}

interface SalesChartData {
  date: string;
  revenue: number;
  units: number;
}

interface ProductSales {
  productId: string;
  productName: string;
  unitsSold: number;
  percentage: number;
}

interface SmsAnalytics {
  totalSent: number;
  totalFailed: number;
  totalDelivered: number;
  totalOptedOut: number;
  successRate: string;
  transactionalCount: number;
  marketingCount: number;
  adminCount: number;
  recentSms: number;
  totalMessages: number;
}

function OrderSmsTimeline({ orderId }: { orderId: string }) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  const { data: smsLogs } = useQuery<SmsLog[]>({
    queryKey: ['/api/admin/sms/logs', { orderId }],
    queryFn: async () => {
      const response = await fetch(`/api/admin/sms/logs/${orderId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch SMS logs');
      }
      return response.json();
    },
    enabled: isAuthenticated && isAdmin && !!orderId,
  });

  if (!smsLogs || smsLogs.length === 0) {
    return (
      <div className="text-xs text-foreground/50 italic">
        No SMS messages sent for this order
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {smsLogs.map((log) => (
        <div 
          key={log.id} 
          className="flex items-start gap-2 text-xs"
          data-testid={`sms-log-${log.id}`}
        >
          <MessageSquare className="w-3 h-3 text-primary mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground/80">{log.templateName}</span>
              <Badge 
                className={`text-xs ${
                  log.status === 'sent' || log.status === 'delivered' 
                    ? 'bg-green-500/20 text-green-500 border-green-500/30' 
                    : 'bg-red-500/20 text-red-500 border-red-500/30'
                }`}
              >
                {log.status}
              </Badge>
            </div>
            <p className="text-foreground/60">
              {new Date(log.createdAt).toLocaleString()}
            </p>
            {log.errorMessage && (
              <p className="text-red-500 text-xs mt-1">{log.errorMessage}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const { isInitialized: gaInitialized, isConfigured: gaConfigured, measurementId } = useAnalytics();
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'completed' | 'refunded'>('all');
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");

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

  const { data: orders } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/admin/analytics'],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: inventory } = useQuery<EnhancedInventory[]>({
    queryKey: ['/api/admin/all-inventory'],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: salesChart } = useQuery<SalesChartData[]>({
    queryKey: ['/api/admin/sales-chart'],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: productSales } = useQuery<ProductSales[]>({
    queryKey: ['/api/admin/product-sales'],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: smsAnalytics } = useQuery<SmsAnalytics>({
    queryKey: ['/api/admin/sms/analytics'],
    enabled: isAuthenticated && isAdmin,
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async ({ productId, remainingStock }: { productId: string; remainingStock: number }) => {
      await apiRequest("PATCH", "/api/admin/inventory", { productId, remainingStock });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/all-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      
      const product = inventory?.find(inv => inv.productId === variables.productId);
      toast({
        title: "Stock Updated",
        description: `${product?.productName} stock updated successfully.`,
      });
      setEditingProduct(null);
      setEditValue("");
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleQuickUpdate = (productId: string, delta: number) => {
    const product = inventory?.find(inv => inv.productId === productId);
    if (!product) return;
    
    const newStock = Math.max(0, product.remainingStock + delta);
    updateInventoryMutation.mutate({ productId, remainingStock: newStock });
  };

  const handleEditSave = (productId: string) => {
    const stock = parseInt(editValue);
    if (isNaN(stock) || stock < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid stock number.",
        variant: "destructive",
      });
      return;
    }
    updateInventoryMutation.mutate({ productId, remainingStock: stock });
  };

  // Ship order mutation
  const shipOrderMutation = useMutation({
    mutationFn: async ({ orderId, trackingNumber, carrier }: { orderId: string; trackingNumber: string; carrier: string }) => {
      return await apiRequest("PATCH", `/api/admin/orders/${orderId}/ship`, { trackingNumber, carrier });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "Order Shipped",
        description: "Shipping confirmation sent to customer via email and SMS.",
      });
      setShippingDialogOpen(false);
      setTrackingNumber("");
      setCarrier("");
      setSelectedOrderId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Shipping Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Deliver order mutation
  const deliverOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("PATCH", `/api/admin/orders/${orderId}/deliver`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "Order Delivered",
        description: "Delivery confirmation sent to customer via email and SMS.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delivery Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleShipOrder = () => {
    if (!selectedOrderId || !trackingNumber || !carrier) {
      toast({
        title: "Missing Information",
        description: "Please provide both tracking number and carrier.",
        variant: "destructive",
      });
      return;
    }
    shipOrderMutation.mutate({ orderId: selectedOrderId, trackingNumber, carrier });
  };

  const openShippingDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShippingDialogOpen(true);
  };

  const startEdit = (productId: string, currentStock: number) => {
    setEditingProduct(productId);
    setEditValue(currentStock.toString());
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

  const filteredOrders = orders?.filter(order => {
    if (orderFilter === 'all') return true;
    return order.status === orderFilter;
  }) || [];

  const lowStockItems = inventory?.filter(inv => inv.status === 'Low Stock' || inv.status === 'Out of Stock') || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'Low Stock': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'Out of Stock': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-foreground/20 text-foreground border-foreground/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050505] to-[#111111] p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-serif text-primary tracking-tight">
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
          <Card className="bg-card/80 border-primary/20">
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

          <Card className="bg-card/80 border-primary/20">
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

          <Card className="bg-card/80 border-primary/20">
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

          <Card className="bg-card/80 border-primary/20">
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

        {/* Google Analytics Section */}
        <Card className="bg-card/80 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Google Analytics Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Status Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {gaInitialized ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-foreground">GA4 Active</span>
                    </>
                  ) : gaConfigured ? (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-medium text-foreground">GA4 Initialization Failed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="text-sm font-medium text-foreground">GA4 Not Configured</span>
                    </>
                  )}
                </div>
                
                {gaInitialized ? (
                  <div className="space-y-2">
                    <p className="text-xs text-foreground/60">
                      Measurement ID: {measurementId?.substring(0, 5)}...
                    </p>
                    <p className="text-xs text-foreground/60">
                      Successfully tracking page views, purchases, and cart events
                    </p>
                  </div>
                ) : gaConfigured ? (
                  <div className="space-y-2">
                    <p className="text-xs text-foreground/60">
                      Measurement ID is configured but initialization failed. Check browser console for errors.
                    </p>
                    <p className="text-xs text-foreground/60">
                      Configured ID: {measurementId?.substring(0, 5)}...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-foreground/60">
                      To enable Google Analytics tracking, add your GA4 Measurement ID to the environment variables:
                    </p>
                    <code className="text-xs bg-background/80 px-2 py-1 rounded block">
                      VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXX
                    </code>
                  </div>
                )}
              </div>

              {/* Actions Column */}
              <div className="space-y-3">
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    data-testid="button-open-ga-console"
                  >
                    Open Google Analytics Console
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
                
                {gaInitialized && (
                  <div className="bg-background/50 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground/80">Tracked Events:</p>
                    <ul className="text-xs text-foreground/60 space-y-0.5">
                      <li>• Page views (all routes)</li>
                      <li>• Add to cart events</li>
                      <li>• Purchase events</li>
                      <li>• E-commerce tracking</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMS Analytics Card */}
        <Card className="bg-card/80 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              SMS Campaign Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-green-500" />
                  <p className="text-xs text-foreground/60">Messages Sent</p>
                </div>
                <p className="text-2xl font-bold text-primary" data-testid="text-sms-sent">
                  {smsAnalytics?.totalSent || 0}
                </p>
                <p className="text-xs text-foreground/50">{smsAnalytics?.successRate || 0}% success rate</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <p className="text-xs text-foreground/60">Delivered</p>
                </div>
                <p className="text-2xl font-bold text-primary" data-testid="text-sms-delivered">
                  {smsAnalytics?.totalDelivered || 0}
                </p>
                <p className="text-xs text-foreground/50">Confirmed by carrier</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <p className="text-xs text-foreground/60">Failed</p>
                </div>
                <p className="text-2xl font-bold text-red-500" data-testid="text-sms-failed">
                  {smsAnalytics?.totalFailed || 0}
                </p>
                <p className="text-xs text-foreground/50">Errors & bounces</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <p className="text-xs text-foreground/60">Recent (24h)</p>
                </div>
                <p className="text-2xl font-bold text-primary" data-testid="text-sms-recent">
                  {smsAnalytics?.recentSms || 0}
                </p>
                <p className="text-xs text-foreground/50">Last day activity</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 mt-4 pt-4 border-t border-primary/10">
              <div className="space-y-1">
                <p className="text-xs text-foreground/60">Transactional</p>
                <p className="text-lg font-semibold text-foreground" data-testid="text-sms-transactional">
                  {smsAnalytics?.transactionalCount || 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-foreground/60">Marketing</p>
                <p className="text-lg font-semibold text-foreground" data-testid="text-sms-marketing">
                  {smsAnalytics?.marketingCount || 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-foreground/60">Admin Alerts</p>
                <p className="text-lg font-semibold text-foreground" data-testid="text-sms-admin">
                  {smsAnalytics?.adminCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales & Inventory Analytics */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-card/80 border-primary/20 p-6">
            <h3 className="text-xl font-serif text-primary mb-4">Sales Over Time (30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C8A856" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  stroke="#C8A856"
                  tick={{ fill: '#C8A856', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  stroke="#C8A856"
                  tick={{ fill: '#C8A856', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0a', 
                    border: '1px solid #C8A856',
                    borderRadius: '8px',
                    color: '#C8A856'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                    return [value, 'Units'];
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#C8A856" 
                  strokeWidth={2}
                  dot={{ fill: '#C8A856' }}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="bg-card/80 border-primary/20 p-6">
            <h3 className="text-xl font-serif text-primary mb-4">Top Selling Products</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productSales || []} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#C8A856" opacity={0.1} />
                <XAxis type="number" stroke="#C8A856" tick={{ fill: '#C8A856', fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="productName" 
                  stroke="#C8A856"
                  tick={{ fill: '#C8A856', fontSize: 10 }}
                  width={150}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0a', 
                    border: '1px solid #C8A856',
                    borderRadius: '8px',
                    color: '#C8A856'
                  }}
                  formatter={(value: any, name: string, props: any) => {
                    return [`${value} units (${props.payload.percentage}%)`, 'Sold'];
                  }}
                />
                <Bar dataKey="unitsSold" fill="#C8A856" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Inventory Alerts */}
        {lowStockItems.length > 0 && (
          <Card className="bg-amber-500/5 border-amber-500/30 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-serif text-amber-500 mb-2">Inventory Alerts</h3>
                <p className="text-sm text-foreground/80 mb-3">
                  {lowStockItems.length} product{lowStockItems.length > 1 ? 's' : ''} need attention
                </p>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.map(item => (
                    <Badge 
                      key={item.productId}
                      className={`${getStatusColor(item.status)} px-3 py-1`}
                    >
                      {item.productName.split('—')[0].trim()}: {item.remainingStock} left
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {!lowStockItems.length && (
          <Card className="bg-green-500/5 border-green-500/30 p-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-serif text-green-500 mb-1">All Items Sufficiently Stocked</h3>
                <p className="text-sm text-foreground/70">
                  No inventory alerts at this time.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Inventory Management */}
        <Card className="bg-card/80 border-primary/20 p-6 overflow-x-auto">
          <h2 className="text-2xl font-serif text-primary mb-6">Inventory Management</h2>
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_120px] gap-4 pb-3 border-b border-primary/20 text-sm font-semibold text-primary/90">
              <div>Product</div>
              <div>SKU</div>
              <div>Current Stock</div>
              <div>Sold (All-Time)</div>
              <div>Reorder Level</div>
              <div>Days of Stock</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {inventory?.map((item) => (
              <div 
                key={item.productId}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_120px] gap-4 py-4 border-b border-primary/10 items-center text-sm"
                data-testid={`inventory-row-${item.productId}`}
              >
                <div className="font-medium text-foreground">{item.productName}</div>
                <div className="text-foreground/70 font-mono text-xs">{item.productId}</div>
                <div className="font-bold text-primary">{item.remainingStock}</div>
                <div className="text-foreground/70">{item.sold}</div>
                <div className="text-foreground/70">{item.reorderLevel}</div>
                <div className="text-foreground/70">
                  {item.daysOfStock !== null ? `${item.daysOfStock} days` : '—'}
                </div>
                <div>
                  <Badge className={`${getStatusColor(item.status)} text-xs`}>
                    {item.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {editingProduct === item.productId ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-16 h-7 text-xs"
                        data-testid={`input-edit-${item.productId}`}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleEditSave(item.productId)}
                        data-testid={`button-save-${item.productId}`}
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setEditingProduct(null)}
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleQuickUpdate(item.productId, -1)}
                        disabled={updateInventoryMutation.isPending || item.remainingStock === 0}
                        data-testid={`button-decrease-${item.productId}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleQuickUpdate(item.productId, 1)}
                        disabled={updateInventoryMutation.isPending}
                        data-testid={`button-increase-${item.productId}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => startEdit(item.productId, item.remainingStock)}
                        disabled={updateInventoryMutation.isPending}
                        data-testid={`button-edit-${item.productId}`}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Orders Management */}
        <Card className="bg-card/80 border-primary/20 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif text-primary">Customer Orders & Shipping</h2>
            <div className="flex gap-2">
              <Button
                variant={orderFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setOrderFilter('all')}
                size="sm"
                data-testid="filter-all"
              >
                All ({orders?.length || 0})
              </Button>
              <Button
                variant={orderFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setOrderFilter('pending')}
                size="sm"
                data-testid="filter-pending"
              >
                Pending
              </Button>
              <Button
                variant={orderFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setOrderFilter('completed')}
                size="sm"
                data-testid="filter-completed"
              >
                Completed ({orders?.filter(o => o.status === 'completed').length || 0})
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="border border-primary/20 rounded-lg p-4 space-y-3 hover-elevate"
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
                        {order.quantity} item{order.quantity > 1 ? 's' : ''}
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

                  {/* Tracking Information */}
                  {order.trackingNumber && (
                    <div className="pt-3 border-t border-primary/10">
                      <div className="flex items-start gap-2">
                        <Truck className="w-4 h-4 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-foreground/60">Tracking Information</p>
                          <p className="text-sm font-medium text-foreground">
                            {order.carrier}: {order.trackingNumber}
                          </p>
                          {order.shippedAt && (
                            <p className="text-xs text-foreground/50 mt-1">
                              Shipped on {new Date(order.shippedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fulfillment Actions */}
                  <div className="pt-3 border-t border-primary/10">
                    <div className="flex gap-2 flex-wrap">
                      {order.status === 'completed' && !order.trackingNumber && (
                        <Dialog open={shippingDialogOpen && selectedOrderId === order.id} onOpenChange={(open) => {
                          if (!open) {
                            setShippingDialogOpen(false);
                            setSelectedOrderId(null);
                            setTrackingNumber("");
                            setCarrier("");
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openShippingDialog(order.id)}
                              data-testid={`button-ship-${order.id}`}
                            >
                              <Truck className="w-4 h-4 mr-1" />
                              Mark as Shipped
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ship Order #{order.id.substring(0, 8)}</DialogTitle>
                              <DialogDescription>
                                Enter the tracking information to notify the customer.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="carrier">Carrier</Label>
                                <Select value={carrier} onValueChange={setCarrier}>
                                  <SelectTrigger id="carrier" data-testid="select-carrier">
                                    <SelectValue placeholder="Select carrier" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="USPS">USPS</SelectItem>
                                    <SelectItem value="FedEx">FedEx</SelectItem>
                                    <SelectItem value="UPS">UPS</SelectItem>
                                    <SelectItem value="DHL">DHL</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="tracking">Tracking Number</Label>
                                <Input
                                  id="tracking"
                                  placeholder="Enter tracking number"
                                  value={trackingNumber}
                                  onChange={(e) => setTrackingNumber(e.target.value)}
                                  data-testid="input-tracking"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShippingDialogOpen(false);
                                  setSelectedOrderId(null);
                                  setTrackingNumber("");
                                  setCarrier("");
                                }}
                                data-testid="button-cancel-ship"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleShipOrder}
                                disabled={shipOrderMutation.isPending}
                                data-testid="button-confirm-ship"
                              >
                                {shipOrderMutation.isPending ? "Processing..." : "Ship Order"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {order.status === 'shipped' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => deliverOrderMutation.mutate(order.id)}
                          disabled={deliverOrderMutation.isPending}
                          data-testid={`button-deliver-${order.id}`}
                        >
                          <PackageCheck className="w-4 h-4 mr-1" />
                          {deliverOrderMutation.isPending ? "Processing..." : "Mark as Delivered"}
                        </Button>
                      )}

                      {order.status === 'delivered' && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Delivered
                          {order.deliveredAt && ` on ${new Date(order.deliveredAt).toLocaleDateString()}`}
                        </Badge>
                      )}

                      {order.status === 'refunded' && (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          Refunded
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* SMS Timeline */}
                  {order.customerPhone && (
                    <div className="pt-3 border-t border-primary/10">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <p className="text-xs font-semibold text-foreground/80">SMS Timeline</p>
                      </div>
                      <OrderSmsTimeline orderId={order.id} />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-primary/10 rounded-lg">
                <Package className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                <p className="text-foreground/60 font-medium mb-1">
                  {orderFilter === 'all' ? 'No orders yet' : `No ${orderFilter} orders`}
                </p>
                <p className="text-sm text-foreground/50">
                  {orderFilter === 'all' 
                    ? 'Once customers begin purchasing coins, their orders will appear here for fulfillment and tracking.'
                    : `No orders with ${orderFilter} status.`}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
