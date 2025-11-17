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
import { SEO } from "@/components/seo";
import { getAbsoluteUrl } from "@/../../shared/seo-config";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";
import { JEWEL_SET } from "@/lib/products";
import separatorBarImg from "@assets/0_0_640_N_1763339269798.png";
import separatorBar2Img from "@assets/0_0_640_N_1763340226514.png";

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

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Alpha Phi Alpha Fraternity, Incorporated",
    "url": "https://apa1906.net",
    "logo": getAbsoluteUrl("/favicon.png"),
    "description": "First intercollegiate Greek-letter organization founded by African American men",
    "foundingDate": "1906-12-04"
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Alpha Phi Alpha 120th Anniversary Commemorative Coin - 4 Inch Diameter",
    "description": "Exclusive limited edition 4-inch commemorative coin celebrating 120 years of Alpha Phi Alpha Fraternity (1906-2026). Only 1906 coins available.",
    "brand": {
      "@type": "Brand",
      "name": "Alpha Phi Alpha"
    },
    "offers": {
      "@type": "Offer",
      "price": "50.06",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": getAbsoluteUrl("/shop-coins")
    },
    "sku": "APA-120-COIN-4IN"
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Alpha Phi Alpha 120th Anniversary Commemorative Coin - Limited Edition 1906 Coins"
        description="Exclusive limited edition 4-inch commemorative coin celebrating 120 years of Alpha Phi Alpha Fraternity (1906-2026). Own a piece of history with only 1906 coins available. Shop now."
        canonical={getAbsoluteUrl("/")}
        keywords="Alpha Phi Alpha, commemorative coin, 120th anniversary, 1906, limited edition, fraternity collectibles, APA memorabilia"
        structuredData={[organizationSchema, productSchema]}
      />
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
        
        {/* Decorative Separator Bar */}
        <div 
          className="w-full bg-background py-4 sm:py-6 md:py-8"
          style={{
            backgroundImage: `url(${separatorBar2Img})`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'center',
            backgroundSize: 'auto 32px',
            minHeight: '32px',
          }}
          data-testid="container-separator-bar-2"
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
