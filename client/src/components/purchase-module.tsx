import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";
import { MAIN_COIN } from "@/lib/products";
import { ShieldCheck, CreditCard, Package, ShoppingCart, Lock, RotateCw } from "lucide-react";
import coinFrontImg from "@assets/apa coin front_1762505793054.png";
import coinBackImg from "@assets/apa coin back_1762505793054.png";
import egyptianBgImg from "@assets/0_0-6_1763344416952.jpg";

const COIN_PRICE = 49.06;

export function PurchaseModule() {
  const [quantity, setQuantity] = useState(1);
  const [showBack, setShowBack] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { addItem, itemCount } = useCart();

  const { data: inventory } = useQuery<{ remainingStock: number }>({
    queryKey: ['/api/inventory'],
    refetchInterval: 5000,
  });

  const stock = inventory?.remainingStock ?? 1906;
  const isSoldOut = stock <= 0;
  const totalAmount = COIN_PRICE * quantity;

  const handleAddToCart = () => {
    if (isSoldOut) {
      toast({
        title: "Sold Out",
        description: "LIMITED EDITION is sold out! Please check back soon or join the waitlist.",
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

    addItem(MAIN_COIN, quantity);
    toast({
      title: "Added to Cart",
      description: `${quantity}x 120-Year Anniversary Coin ($${(COIN_PRICE * quantity).toFixed(2)})`,
    });
  };

  const handleViewCart = () => {
    setLocation("/shop-coins");
  };

  const handleCheckout = () => {
    if (itemCount === 0) {
      toast({
        title: "Cart is Empty",
        description: "Please add items to your cart before checking out.",
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

    setLocation("/checkout");
  };

  return (
    <section 
      className="relative py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6 md:px-12 border-t border-primary/20 overflow-hidden"
      style={{
        backgroundImage: `url(${egyptianBgImg})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/85 pointer-events-none" />
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-16">
        <div className="text-center space-y-4 sm:space-y-6 px-2">
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-foreground tracking-tight leading-tight"
            data-testid="text-purchase-heading"
          >
            Secure Your Limited Edition Coin Today
          </h2>
          
          <p 
            className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto"
            data-testid="text-purchase-description"
          >
            Don't let history pass you by. Only {stock} coins remain in LIMITED EDITION.
          </p>
        </div>

        <Card className="border-2 border-primary/30 rounded-2xl sm:rounded-3xl overflow-hidden bg-card/95 shadow-2xl">
          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 p-6 sm:p-8 md:p-10">
            {/* Product Image */}
            <div className="lg:col-span-2 flex flex-col justify-center items-center gap-4">
              <div className="relative w-full max-w-xs">
                <img 
                  src={showBack ? coinBackImg : coinFrontImg} 
                  alt={`Alpha Phi Alpha 120th Anniversary Commemorative Coin - ${showBack ? 'Back' : 'Front'}`} 
                  className="w-full h-auto object-contain drop-shadow-2xl transition-opacity duration-300"
                  data-testid="img-coin-purchase"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowBack(!showBack)}
                className="flex items-center gap-2 bg-background/60 border-primary/30"
                data-testid="button-toggle-coin-side"
              >
                <RotateCw className="w-4 h-4" />
                {showBack ? 'Show Front' : 'Show Back'}
              </Button>
            </div>

            {/* Purchase Details */}
            <div className="lg:col-span-3 space-y-6 sm:space-y-8">
              {/* Product Title */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground">
                  Alpha Phi Alpha 120th Anniversary Commemorative Coin
                </h3>
                <p className="text-sm sm:text-base text-foreground/70">
                  4-inch diameter • Museum-quality • Numbered & Certified
                </p>
                
                {/* Stock Badge */}
                <div className="inline-block bg-background/80 border border-primary/30 rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-foreground/70 text-xs sm:text-sm">LIMITED EDITION: Only</span>
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{stock}</span>
                    <span className="text-foreground/70 text-xs sm:text-sm">Remaining</span>
                  </div>
                </div>
              </div>

              {/* Price Display */}
              <div className="space-y-1 sm:space-y-2 pb-4 sm:pb-6 border-b border-primary/10">
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground" data-testid="text-coin-price">
                  ${COIN_PRICE.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-foreground/60">+ Shipping in the continental US and worldwide</p>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3 sm:space-y-4">
                <label htmlFor="quantity" className="text-sm sm:text-base text-foreground/80 font-semibold">
                  Quantity:
                </label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isSoldOut || quantity <= 1}
                    className="bg-background/60 min-h-11 min-w-11"
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
                    className="w-16 sm:w-20 text-center text-lg sm:text-xl font-bold border-primary/30 bg-background/60 min-h-11"
                    disabled={isSoldOut}
                    data-testid="input-quantity"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={isSoldOut || quantity >= 10}
                    className="bg-background/60 min-h-11 min-w-11"
                    data-testid="button-increase-quantity"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Add to Cart and Checkout Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                  size="lg"
                  className="flex-1 text-base md:text-lg font-bold bg-primary hover:bg-primary/90 text-black"
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isSoldOut ? "JOIN WAITLIST" : "Add to Cart"}
                </Button>
                {itemCount > 0 && (
                  <Button
                    onClick={handleCheckout}
                    size="lg"
                    variant="outline"
                    className="flex-1 text-base md:text-lg font-bold border-primary text-primary hover:bg-primary hover:text-black"
                    data-testid="button-proceed-checkout"
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    Checkout ({itemCount})
                  </Button>
                )}
              </div>

              {/* Trust Signals */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm text-foreground/60 border-t border-primary/10 pt-6">
                <span className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Secure Checkout via Stripe
                </span>
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Authenticity Guaranteed
                </span>
              </div>

            </div>
          </div>

          {/* What's Included */}
          <div className="border-t border-primary/10 px-8 md:px-10 py-6 bg-background/20">
            <h4 className="font-semibold text-foreground mb-4">What's Included:</h4>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-start gap-3 text-foreground/70">
                <span className="text-primary mt-0.5">✓</span>
                <span>120th Anniversary Commemorative Coin (4" diameter)</span>
              </div>
              <div className="flex items-start gap-3 text-foreground/70">
                <span className="text-primary mt-0.5">✓</span>
                <span>Premium Display Case</span>
              </div>
              <div className="flex items-start gap-3 text-foreground/70">
                <span className="text-primary mt-0.5">✓</span>
                <span>Certificate of Authenticity</span>
              </div>
              <div className="flex items-start gap-3 text-foreground/70">
                <span className="text-primary mt-0.5">✓</span>
                <span>Unique Serial Number</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
