import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { subscribeToInventory } from "@/lib/firebase";

interface StickyHeaderProps {
  onCtaClick: () => void;
}

export function StickyHeader({ onCtaClick }: StickyHeaderProps) {
  const [realtimeStock, setRealtimeStock] = useState<number | null>(null);
  
  const { data: inventory, isLoading } = useQuery<{ remainingStock: number }>({
    queryKey: ['/api/inventory'],
    refetchInterval: 5000, // Fallback polling if Firebase not available
  });

  // Subscribe to Firebase real-time updates
  useEffect(() => {
    const setupFirebase = async () => {
      // Sign in anonymously before subscribing
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

  // Prefer real-time Firebase stock, fallback to API query
  const stock = realtimeStock !== null ? realtimeStock : (inventory?.remainingStock ?? 406);
  const isSoldOut = stock <= 0;

  return (
    <header className="sticky top-0 z-50 bg-background/95 border-b border-primary/30 shadow-lg backdrop-blur-sm">
      <div className="py-3 px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
        <h1 className="text-lg md:text-xl font-bold text-primary font-serif tracking-widest">
          APA 120th Legacy Coin
        </h1>
        
        <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
          <span className="text-xs md:text-sm font-semibold flex items-baseline gap-1 flex-wrap justify-center">
            <span className={isSoldOut ? "text-destructive" : "text-primary"} data-testid="text-scarcity-status">
              {isSoldOut ? "Phase I is SOLD OUT!" : "Limited Edition - Only"}
            </span>
            <span 
              className={`text-xl md:text-2xl font-bold ${isSoldOut ? "text-destructive" : "text-primary"}`}
              data-testid="text-stock-counter"
            >
              {isLoading ? "..." : stock}
            </span>
            {!isSoldOut && <span className="text-xs md:text-sm">Remaining!</span>}
          </span>
          
          <Button
            onClick={onCtaClick}
            disabled={isSoldOut}
            className="whitespace-nowrap font-bold"
            size="default"
            data-testid="button-header-cta"
          >
            {isSoldOut ? "JOIN WAITLIST" : "SECURE YOUR COIN NOW"}
          </Button>
        </div>
      </div>
    </header>
  );
}
