import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { subscribeToInventory, signInAnonymouslyToFirebase } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/cart-context";
import { Settings, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import coinBackImg from "@assets/apa coin back_1763327918152.png";

interface StickyHeaderProps {
  onCtaClick: () => void;
}

export function StickyHeader({ onCtaClick }: StickyHeaderProps) {
  const [realtimeStock, setRealtimeStock] = useState<number | null>(null);
  const { isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  
  const { data: inventory, isLoading } = useQuery<{ remainingStock: number }>({
    queryKey: ['/api/inventory'],
    refetchInterval: 5000,
  });

  useEffect(() => {
    const setupFirebase = async () => {
      const signedIn = await signInAnonymouslyToFirebase();
      
      if (signedIn) {
        const unsubscribe = subscribeToInventory((stock) => {
          setRealtimeStock(stock);
        });
        return unsubscribe;
      } else {
        console.log('Firebase not configured - using API polling for inventory updates');
        return null;
      }
    };

    let unsubscribe: (() => void) | null = null;
    setupFirebase().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const stock = realtimeStock !== null ? realtimeStock : (inventory?.remainingStock ?? 1906);
  const isSoldOut = stock <= 0;

  return (
    <header 
      className="sticky top-0 z-50 shadow-lg bg-destructive"
      data-testid="header-sticky"
    >
      <div className="py-2 px-3 sm:py-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-2 sm:gap-3 md:gap-4">
          {/* Left: Logo + Title (clickable, links to home) */}
          <Link href="/">
            <div className="flex items-center gap-2 sm:gap-3 w-auto cursor-pointer hover:opacity-80 transition-opacity" data-testid="link-home">
              <img 
                src={coinBackImg} 
                alt="Alpha Phi Alpha 120th Anniversary Coin" 
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain shrink-0" 
                data-testid="img-coin-logo" 
              />
              <span className="text-xs sm:text-sm md:text-base font-semibold">
                <span className="hidden sm:inline">
                  <span className="text-black uppercase">Alpha Phi Alpha</span>
                  <span className="text-white"> 120th Anniversary</span>
                </span>
                <span className="sm:hidden">
                  <span className="text-black uppercase">AΦA</span>
                  <span className="text-white"> 120th</span>
                </span>
              </span>
            </div>
          </Link>

          {/* Center: Stock Counter */}
          <div className="flex-shrink-0 order-3 sm:order-2 sm:flex-1 sm:flex sm:justify-center w-full sm:w-auto text-center">
            <span className="text-xs sm:text-sm md:text-base font-semibold text-white flex items-baseline gap-1 justify-center flex-wrap">
              <span className="hidden sm:inline">LIMITED EDITION:</span>
              <span>Only</span>
              <span 
                className="text-base sm:text-lg md:text-xl font-bold text-primary mx-0.5 sm:mx-1"
                data-testid="text-stock-counter"
              >
                {isLoading ? "..." : stock}
              </span>
              <span>Remaining!</span>
            </span>
          </div>

          {/* Right: Shop Link + Cart Icon + CTA Button + Admin Link */}
          <div className="flex items-center gap-1.5 sm:gap-2 order-2 sm:order-3">
            <Link href="/shop-coins">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 text-xs sm:text-sm min-h-11"
                data-testid="button-shop-link"
              >
                Shop All
              </Button>
            </Link>

            <Link href="/shop-coins">
              <Button
                variant="outline"
                size="icon"
                className="bg-white/10 border-white/30 text-white shrink-0 min-h-11 min-w-11 relative"
                data-testid="button-cart-icon"
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {itemCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center bg-primary text-black font-bold text-xs px-1"
                    data-testid="badge-cart-count"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {isAuthenticated && isAdmin && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/30 text-white shrink-0 min-h-11 min-w-11"
                  data-testid="button-admin-link"
                >
                  <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            )}
            
            <Button
              onClick={onCtaClick}
              disabled={isSoldOut}
              className="font-bold bg-primary text-black border-0 text-xs sm:text-sm whitespace-nowrap min-h-11"
              size="sm"
              data-testid="button-header-cta"
            >
              {isSoldOut ? "WAITLIST" : "PURCHASE"}
              <span className="hidden sm:inline ml-1">{isSoldOut ? "" : "NOW"}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
