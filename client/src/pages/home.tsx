import { useEffect, useRef } from "react";
import { StickyHeader } from "@/components/sticky-header";
import { HeroSection } from "@/components/hero-section";
import { FoundersLegacySection } from "@/components/founders-legacy-section";
import { StorySection } from "@/components/story-section";
import { JewelCarouselSection } from "@/components/jewel-carousel-section";
import { ProductShowcase } from "@/components/product-showcase";
import { WhyOwnSection } from "@/components/why-own-section";
import { PurchaseModule } from "@/components/purchase-module";
import { Footer } from "@/components/footer";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  
  useEffect(() => {
    // Set dark mode by default for Alpha Phi Alpha theme
    document.documentElement.classList.add("dark");
  }, []);

  const purchaseRef = useRef<HTMLDivElement>(null);
  const foundersSetRef = useRef<HTMLDivElement>(null);

  const scrollToPurchase = () => {
    purchaseRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFoundersSet = () => {
    foundersSetRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddCoinToCart = (jewel: any, quantity: number) => {
    toast({
      title: "Added to Cart",
      description: `${quantity}x ${jewel.fullName} coin${quantity > 1 ? 's' : ''} ($${(jewel.price * quantity).toFixed(2)})`,
    });
    
    setTimeout(() => {
      scrollToPurchase();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StickyHeader onCtaClick={scrollToPurchase} />
      
      <main>
        <HeroSection onCtaClick={scrollToPurchase} />
        
        <div ref={foundersSetRef}>
          <FoundersLegacySection onCtaClick={scrollToPurchase} />
        </div>
        
        <StorySection onCtaClick={scrollToPurchase} />
        
        <JewelCarouselSection 
          onAddToCart={handleAddCoinToCart}
          onViewSet={scrollToFoundersSet}
        />
        
        <ProductShowcase onCtaClick={scrollToPurchase} />
        
        <WhyOwnSection onCtaClick={scrollToPurchase} />
        
        <div ref={purchaseRef}>
          <PurchaseModule />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
