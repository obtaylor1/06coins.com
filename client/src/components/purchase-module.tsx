import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, CreditCard, Package } from "lucide-react";
import coinFrontImg from "@assets/apa coin front_1762505793054.png";

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
    <section className="py-20 md:py-32 px-6 md:px-12 bg-gradient-to-b from-background to-card/30 border-t border-primary/20">
      <div className="max-w-6xl mx-auto space-y-12 md:space-y-16">
        <div className="text-center space-y-6">
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground tracking-tight leading-tight"
            data-testid="text-purchase-heading"
          >
            Secure Your Limited Edition Coin Today
          </h2>
          
          <p 
            className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto"
            data-testid="text-purchase-description"
          >
            Don't let history pass you by. Only {stock} coins remain in Phase I.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="lg:col-span-2">
            <div className="aspect-square rounded-full overflow-hidden shadow-2xl">
              <img 
                src={coinFrontImg} 
                alt="Alpha Phi Alpha 120th Anniversary Commemorative Coin" 
                className="w-full h-full object-cover"
                data-testid="img-coin-purchase"
              />
            </div>
          </div>

          {/* Purchase Details */}
          <div className="lg:col-span-3 bg-card/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-2xl border border-primary/20 space-y-8">
            {/* Product Title */}
            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                Alpha Phi Alpha 120th Anniversary Commemorative Coin
              </h3>
              <p className="text-foreground/70">
                6-inch diameter • Museum-quality • Numbered & Certified
              </p>
              <div className="flex items-center gap-2 text-primary">
                <span className="font-semibold">Phase I: Only</span>
                <span className="text-2xl font-bold">{stock}</span>
                <span className="font-semibold">Remaining</span>
              </div>
            </div>

            {/* Price Display */}
            <div className="space-y-2 pb-6 border-b border-primary/10">
              <p className="text-4xl md:text-5xl font-bold text-foreground" data-testid="text-coin-price">
                <span className="text-primary">${COIN_PRICE.toFixed(2)}</span>
              </p>
              <p className="text-sm text-foreground/60">+ Free shipping in the continental US</p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <label htmlFor="quantity" className="text-base text-foreground/80 font-semibold">
                Quantity:
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
                  className="w-20 text-center text-xl font-bold border-primary/30"
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
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={isSoldOut}
              size="lg"
              className="w-full text-lg md:text-xl font-bold"
              data-testid="button-checkout"
            >
              {isSoldOut ? "JOIN WAITLIST" : "Add to Cart"}
            </Button>

            {/* Trust Signals */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm text-foreground/60 border-t border-primary/10 pt-6">
              <span className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Secure Checkout via Stripe
              </span>
              <span className="flex items-center justify-center gap-2">
                <Package className="w-4 h-4" />
                Authenticity Guaranteed
              </span>
            </div>

            {/* What's Included */}
            <div className="border-t border-primary/10 pt-6 space-y-4">
              <h4 className="font-semibold text-foreground">What's Included:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-foreground/70">
                  <span className="text-primary mt-1">✓</span>
                  <span>Official 120th Anniversary Commemorative Coin (6" diameter)</span>
                </li>
                <li className="flex items-start gap-3 text-foreground/70">
                  <span className="text-primary mt-1">✓</span>
                  <span>Premium Display Case</span>
                </li>
                <li className="flex items-start gap-3 text-foreground/70">
                  <span className="text-primary mt-1">✓</span>
                  <span>Certificate of Authenticity</span>
                </li>
                <li className="flex items-start gap-3 text-foreground/70">
                  <span className="text-primary mt-1">✓</span>
                  <span>Unique Serial Number</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
