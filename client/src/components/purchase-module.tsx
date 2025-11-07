import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const COIN_PRICE = 50.00;

export function PurchaseModule() {
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: inventory } = useQuery<{ remainingStock: number }>({
    queryKey: ['/api/inventory'],
    refetchInterval: 5000,
  });

  const stock = inventory?.remainingStock ?? 406;
  const isSoldOut = stock <= 0;
  const totalAmount = COIN_PRICE * quantity;

  const handleCheckout = () => {
    if (isSoldOut) {
      toast({
        title: "Sold Out",
        description: "Phase I is sold out! Please check back soon or join the waitlist.",
        variant: "destructive",
      });
      return;
    }

    if (quantity > stock) {
      toast({
        title: "Insufficient Stock",
        description: `Sorry, only ${stock} coins are left! Please adjust your quantity.`,
        variant: "destructive",
      });
      return;
    }

    // Check if Stripe is configured
    if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      toast({
        title: "Payment System Unavailable",
        description: "Stripe checkout is not configured yet. Please add your API keys to enable payments.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to checkout page with quantity
    setLocation(`/checkout?quantity=${quantity}`);
  };

  return (
    <section className="py-16 px-6 md:px-12 bg-card border-t border-primary/50">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h2 
          className="text-4xl font-serif text-primary tracking-monumental"
          data-testid="text-purchase-heading"
        >
          Secure Your Piece of History
        </h2>
        
        <p 
          className="text-xl text-foreground/90"
          data-testid="text-purchase-description"
        >
          Don't miss out on Phase I of this limited commemorative run. Once current stock runs out, the price may change, or availability may be delayed.
        </p>

        <Card className="p-8 shadow-2xl border border-primary/70 space-y-6">
          <div className="space-y-2">
            <p className="text-4xl font-bold text-foreground" data-testid="text-coin-price">
              <span className="text-primary">${COIN_PRICE.toFixed(2)}</span> Per Coin
            </p>
          </div>

          <div className="flex justify-center items-center gap-4">
            <label htmlFor="quantity" className="text-foreground font-semibold">
              Quantity:
            </label>
            <Input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              min="1"
              max="10"
              className="w-20 text-center border-primary/50"
              disabled={isSoldOut}
              data-testid="input-quantity"
            />
          </div>

          <Button
            onClick={handleCheckout}
            disabled={isSoldOut}
            size="lg"
            className="w-full text-2xl font-bold py-6 rounded-lg shadow-xl hover:scale-[1.01] transition-transform"
            data-testid="button-checkout"
          >
            {isSoldOut ? "JOIN WAITLIST" : "SECURE YOUR COIN NOW"}
          </Button>

          <p className="text-sm text-foreground/70">
            Shipping calculated at checkout. Powered by Stripe Secure Payments.
          </p>

          <div className="flex justify-center">
            <span className="text-sm text-foreground/50">Visa | Mastercard | Stripe Secure</span>
          </div>

          {/* Admin replenish button - will be properly secured in production */}
          {!isSoldOut && (
            <button 
              className="text-xs text-destructive/70 hover:text-destructive mt-4"
              onClick={() => {
                toast({
                  title: "Admin Feature",
                  description: "Stock replenishment will be available in admin panel",
                });
              }}
            >
              [Admin: Replenish Stock Counter]
            </button>
          )}
        </Card>
      </div>
    </section>
  );
}
