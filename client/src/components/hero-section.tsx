import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Lock, ShieldCheck, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import coinFrontImg from "@assets/apa coin front_1762505793054.png";
import heroBackgroundImg from "@assets/0_0_1763334659938.jpg";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  const { data: inventory } = useQuery<{ remainingStock: number }>({
    queryKey: ['/api/inventory'],
    refetchInterval: 5000,
  });
  
  const stock = inventory?.remainingStock ?? 1906;

  return (
    <section className="relative min-h-screen flex items-center px-4 sm:px-6 py-16 sm:py-20 md:px-12 lg:px-16 overflow-hidden">
      {/* Gold Circular Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${heroBackgroundImg})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-black/80 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <div className="space-y-6 sm:space-y-8 text-left">
            {/* Edition Badge */}
            <Badge 
              variant="outline"
              className="border-primary/50 bg-primary/10 text-primary font-semibold px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm w-fit"
              data-testid="badge-edition"
            >
              120th Anniversary Edition
            </Badge>

            {/* Main Headline */}
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary font-serif leading-tight"
              data-testid="text-hero-title"
            >
              120 Years Forged in Gold: The Official Commemorative Coin
            </h1>
            
            {/* Motto with left border */}
            <div className="border-l-4 border-primary pl-3 sm:pl-4 py-2">
              <p 
                className="text-lg sm:text-xl md:text-2xl text-foreground/90 font-serif italic"
                data-testid="text-motto"
              >
                "First of All, Servants of All, We Shall Transcend All."
              </p>
            </div>

            {/* Description */}
            <p 
              className="text-sm sm:text-base md:text-lg text-foreground/70 leading-relaxed"
              data-testid="text-hero-description"
            >
              Honor the Legacy of the Jewels and secure your piece of Alpha history.
            </p>

            {/* Limited Edition Text - Bordered Box */}
            <div 
              className="border border-primary/30 rounded-md px-4 sm:px-6 py-2 sm:py-3 w-fit"
              data-testid="container-limited-edition"
            >
              <p className="text-xs sm:text-sm md:text-base text-primary font-semibold">
                <span className="font-bold">LIMITED EDITION.</span> Only {stock.toLocaleString()} available worldwide.
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={onCtaClick}
                  size="lg"
                  className="text-xs sm:text-sm md:text-base font-bold bg-primary text-black hover:bg-primary/90"
                  data-testid="button-hero-cta-primary"
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  SECURE YOUR COIN NOW
                </Button>
                <Link href="/shop-coins">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-xs sm:text-sm md:text-base font-bold border-primary text-primary bg-white hover:bg-primary/10 w-full sm:w-auto"
                    data-testid="button-shop-all-coins"
                  >
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    SHOP ALL COINS
                  </Button>
                </Link>
                <Button
                  onClick={onCtaClick}
                  size="lg"
                  variant="outline"
                  className="text-xs sm:text-sm md:text-base font-bold border-primary text-primary bg-white hover:bg-primary/10"
                  data-testid="button-hero-cta-secondary"
                >
                  VIEW DETAILS
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-foreground/80">
                <div className="flex items-center gap-1.5 sm:gap-2" data-testid="text-price">
                  <span className="text-primary font-bold text-sm sm:text-base md:text-lg">$50.06</span>
                  <span>Each</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2" data-testid="text-secure-checkout">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">Secure Checkout</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2" data-testid="text-authenticity">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">Authenticity Guaranteed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Coin Image */}
          <div className="relative flex justify-center lg:justify-end mt-6 lg:mt-0">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
              <div 
                className="relative aspect-square rounded-full overflow-hidden shadow-2xl"
                data-testid="container-coin-image"
              >
                <img 
                  src={coinFrontImg} 
                  alt="Alpha Phi Alpha 120th Anniversary Commemorative Coin - Front" 
                  className="w-full h-full object-cover"
                  data-testid="img-coin-front"
                />
              </div>
              
              {/* Coin Details Badge */}
              <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4">
                <Badge 
                  className="bg-primary/90 text-black font-semibold px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-[10px] sm:text-xs md:text-sm backdrop-blur-sm border-0"
                  data-testid="badge-coin-details"
                >
                  <span className="hidden sm:inline">4-inch Diameter commemorative 1906</span>
                  <span className="sm:hidden">4" · 1906</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
