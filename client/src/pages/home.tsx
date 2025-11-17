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
import { useCart } from "@/contexts/cart-context";
import { JEWEL_SET } from "@/lib/products";
import separatorBarImg from "@assets/0_0_640_N_1763339269798.png";

export default function Home() {
  const { toast } = useToast();
  const { addItem } = useCart();
  
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

  const handleAddJewelSetToCart = () => {
    addItem(JEWEL_SET, 1);
    toast({
      title: "Added to Cart",
      description: `Complete 7-Jewel Collector's Set ($${JEWEL_SET.price.toFixed(2)})`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StickyHeader onCtaClick={scrollToPurchase} />
      
      <main>
        <HeroSection onCtaClick={scrollToPurchase} />
        
        {/* Decorative Separator Bar */}
        <div 
          className="w-full bg-background py-4 sm:py-6 md:py-8"
          style={{
            backgroundImage: `url(${separatorBarImg})`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'center',
            backgroundSize: 'auto 32px',
            minHeight: '32px',
          }}
          data-testid="container-separator-bar"
        />

        
        <div ref={foundersSetRef}>
          <FoundersLegacySection onCtaClick={handleAddJewelSetToCart} />
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
