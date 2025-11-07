import { useEffect, useRef } from "react";
import { StickyHeader } from "@/components/sticky-header";
import { HeroSection } from "@/components/hero-section";
import { StorySection } from "@/components/story-section";
import { ProductShowcase } from "@/components/product-showcase";
import { WhyOwnSection } from "@/components/why-own-section";
import { PurchaseModule } from "@/components/purchase-module";

export default function Home() {
  useEffect(() => {
    // Set dark mode by default for Alpha Phi Alpha theme
    document.documentElement.classList.add("dark");
  }, []);

  const purchaseRef = useRef<HTMLDivElement>(null);

  const scrollToPurchase = () => {
    purchaseRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StickyHeader onCtaClick={scrollToPurchase} />
      
      <main>
        <HeroSection onCtaClick={scrollToPurchase} />
        
        {/* Divider */}
        <hr className="border-primary/30 max-w-4xl mx-auto" />
        
        <StorySection />
        
        <ProductShowcase />
        
        <WhyOwnSection />
        
        <div ref={purchaseRef}>
          <PurchaseModule />
        </div>
      </main>
    </div>
  );
}
