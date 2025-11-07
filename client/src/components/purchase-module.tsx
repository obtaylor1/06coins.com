import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, CreditCard, Package } from "lucide-react";

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
    <section className="py-20 md:py-32 px-6 md:px-12 bg-gradient-to-b from-background to-card/50 border-t border-primary/20">
      <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
        <div className="text-center space-y-6">
          <h2 
            className="text-4xl md:text-5xl lg:text-7xl font-serif text-foreground tracking-tight leading-tight"
            data-testid="text-purchase-heading"
          >
            Secure Your Piece
            <br />
            <span className="text-primary">of History</span>
          </h2>
          
          <p 
            className="text-lg md:text-xl lg:text-2xl text-foreground/60 max-w-2xl mx-auto"
            data-testid="text-purchase-description"
          >
            Limited commemorative run. Once current stock runs out, the price may change or availability may be delayed.
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-primary/20 space-y-8">
          {/* Price Display */}
          <div className="text-center space-y-4 pb-8 border-b border-primary/10">
            <p className="text-5xl md:text-6xl font-bold text-foreground" data-testid="text-coin-price">
              <span className="text-primary">${COIN_PRICE.toFixed(2)}</span>
            </p>
            <p className="text-lg text-foreground/60">Per Coin</p>
          </div>

          {/* Quantity Selector */}
          <div className="flex flex-col items-center gap-4">
            <label htmlFor="quantity" className="text-lg text-foreground/80 font-semibold">
              Select Quantity
            </label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isSoldOut || quantity <= 1}
                data-testid="button-decrease-quantity"
              >
                -
              </Button>
              <Input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                min="1"
                max="10"
                className="w-24 text-center text-2xl font-bold border-primary/30"
                disabled={isSoldOut}
                data-testid="input-quantity"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                disabled={isSoldOut || quantity >= 10}
                data-testid="button-increase-quantity"
              >
                +
              </Button>
            </div>
            <p className="text-sm text-foreground/50">Maximum 10 per order</p>
          </div>

          {/* Total */}
          <div className="text-center py-6 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-sm text-foreground/60 mb-2">Total Amount</p>
            <p className="text-4xl font-bold text-primary" data-testid="text-total-amount">
              ${totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            disabled={isSoldOut}
            size="lg"
            className="w-full text-xl md:text-2xl font-bold rounded-xl shadow-2xl hover:scale-[1.02] transition-all duration-300"
            data-testid="button-checkout"
          >
            {isSoldOut ? "JOIN WAITLIST" : "SECURE YOUR COIN NOW"}
          </Button>

          {/* Trust Signals */}
          <div className="space-y-4 pt-6 border-t border-primary/10">
            <p className="text-sm text-center text-foreground/60">
              Shipping calculated at checkout • Powered by Stripe Secure Payments
            </p>
            <div className="flex justify-center gap-6 text-sm text-foreground/40">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Secure Checkout
              </span>
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                All Cards Accepted
              </span>
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Fast Shipping
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
