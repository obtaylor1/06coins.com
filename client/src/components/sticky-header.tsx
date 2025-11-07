import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { subscribeToInventory, signInAnonymouslyToFirebase } from "@/lib/firebase";

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
      <div className="py-3 px-4 md:px-6 flex justify-center items-center">
        <div className="flex items-center gap-6">
          <span className="text-sm md:text-base font-semibold flex items-baseline gap-1">
            <span className="text-foreground/70">Phase I:</span>
            <span className="text-foreground">Only</span>
            <span 
              className="text-lg md:text-xl font-bold text-primary"
              data-testid="text-stock-counter"
            >
              {isLoading ? "..." : stock}
            </span>
            <span className="text-foreground">Remaining!</span>
          </span>
          
          <Button
            onClick={onCtaClick}
            disabled={isSoldOut}
            className="whitespace-nowrap font-bold"
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
