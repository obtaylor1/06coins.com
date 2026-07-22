import { useEffect, useRef } from "react";
import { StickyHeader } from "@/components/sticky-header";
import { HeroSection } from "@/components/hero-section";
import { FoundersLegacySection } from "@/components/founders-legacy-section";
import { JewelCarouselSection } from "@/components/jewel-carousel-section";
import { ProductShowcase } from "@/components/product-showcase";
import { WhyOwnSection } from "@/components/why-own-section";
import { PurchaseModule } from "@/components/purchase-module";
import { Footer } from "@/components/footer";
import { SEO } from "@/components/seo";
import { getAbsoluteUrl } from "@/../../shared/seo-config";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";
import { JEWEL_COINS, JEWEL_SET } from "@/lib/products";

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

  const handleAddJewelSetToCart = () => {
    addItem(JEWEL_SET, 1);
    toast({
      title: "Added to Cart",
      description: `Complete 7-Jewel Collector's Set ($${JEWEL_SET.price.toFixed(2)})`,
    });
  };

  const handleAddJewelCoinToCart = (jewel: { id: string; fullName: string }, quantity: number) => {
    const product = JEWEL_COINS.find((coin) => coin.id === `jewel_${jewel.id}`);
    if (!product) return;
    addItem(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.fullName} coin${quantity === 1 ? "" : "s"}`,
    });
  };

  const scrollToFounderSet = () => {
    foundersSetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Alpha Phi Alpha Fraternity, Incorporated",
    "url": "https://apa1906.net",
    "logo": getAbsoluteUrl("/favicon.webp"),
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
      "price": "39.06",
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
        
        <div ref={foundersSetRef}>
          <FoundersLegacySection onCtaClick={handleAddJewelSetToCart} />
        </div>

        <JewelCarouselSection
          onAddToCart={handleAddJewelCoinToCart}
          onViewSet={scrollToFounderSet}
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
