import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { subscribeToInventory, signInAnonymouslyToFirebase } from "@/lib/firebase";

interface StickyHeaderProps {
  onCtaClick: () => void;
}

export function StickyHeader({ onCtaClick }: StickyHeaderProps) {
  const [realtimeStock, setRealtimeStock] = useState<number | null>(null);
  
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

  const stock = realtimeStock !== null ? realtimeStock : (inventory?.remainingStock ?? 406);
  const isSoldOut = stock <= 0;

  return (
    <header 
      className="sticky top-0 z-50 shadow-lg"
      style={{ backgroundColor: '#8B1538' }}
      data-testid="header-sticky"
    >
      <div className="py-3 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary fill-primary" data-testid="icon-logo" />
            <span className="text-sm md:text-base font-semibold text-white whitespace-nowrap">
              Alpha Phi Alpha 120th Anniversary
            </span>
          </div>

          {/* Center: Stock Counter */}
          <div className="flex-1 flex justify-center">
            <span className="text-sm md:text-base font-semibold text-white flex items-baseline gap-1">
              <span>Phase I:</span>
              <span>Only</span>
              <span 
                className="text-lg md:text-xl font-bold text-primary mx-1"
                data-testid="text-stock-counter"
              >
                {isLoading ? "..." : stock}
              </span>
              <span>Remaining!</span>
            </span>
          </div>

          {/* Right: CTA Button */}
          <Button
            onClick={onCtaClick}
            disabled={isSoldOut}
            className="whitespace-nowrap font-bold bg-primary hover:bg-primary/90 text-black border-0"
            size="default"
            data-testid="button-header-cta"
          >
            {isSoldOut ? "JOIN WAITLIST" : "PURCHASE NOW"}
          </Button>
        </div>
      </div>
    </header>
  );
}
