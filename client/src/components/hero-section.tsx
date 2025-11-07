import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import coinFrontImg from "@assets/apa coin front_1762505793054.png";
import shieldImg from "@assets/IMG_0093_1762507090202.jpeg";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  const { data: inventory } = useQuery<{ remainingStock: number }>({
    queryKey: ['/api/inventory'],
    refetchInterval: 5000,
  });
  
  const stock = inventory?.remainingStock ?? 406;

  return (
    <section className="relative min-h-screen flex items-center px-6 py-20 md:px-12 lg:px-16 overflow-hidden bg-gradient-to-br from-background via-background to-background/80">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Shield Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `url(${shieldImg})`,
          backgroundPosition: 'center',
          backgroundSize: '50%',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <div className="space-y-8 text-left">
            {/* Edition Badge */}
            <Badge 
              variant="outline"
              className="border-primary/50 bg-primary/10 text-primary font-semibold px-4 py-1.5 text-sm w-fit"
              data-testid="badge-edition"
            >
              120th Anniversary Edition
            </Badge>

            {/* Main Headline */}
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary font-serif leading-tight"
              data-testid="text-hero-title"
            >
              120 Years Forged in Gold: The Official Commemorative Coin
            </h1>
            
            {/* Motto with left border */}
            <div className="border-l-4 border-primary pl-4 py-2">
              <p 
                className="text-xl md:text-2xl text-foreground/90 font-serif italic"
                data-testid="text-motto"
              >
                "First of All, Servants of All, We Shall Transcend All."
              </p>
            </div>

            {/* Description */}
            <p 
              className="text-base md:text-lg text-foreground/70 leading-relaxed"
              data-testid="text-hero-description"
            >
              Honor the Legacy of the Jewels and secure your piece of Alpha history.
            </p>

            {/* Limited Edition Text */}
            <p 
              className="text-sm md:text-base font-semibold text-foreground/80"
              data-testid="text-limited-edition"
            >
              <span className="font-bold">LIMITED EDITION.</span> Only {stock.toLocaleString()} available worldwide.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onCtaClick}
                size="lg"
                className="text-sm md:text-base font-bold bg-primary hover:bg-primary/90 text-black"
                data-testid="button-hero-cta-primary"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                SECURE YOUR COIN NOW
              </Button>
              <Button
                onClick={onCtaClick}
                size="lg"
                variant="outline"
                className="text-sm md:text-base font-bold border-foreground/30 hover:bg-foreground/10"
                data-testid="button-hero-cta-secondary"
              >
                VIEW DETAILS
              </Button>
            </div>
          </div>

          {/* Right Column: Coin Image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
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
              <div className="absolute bottom-4 right-4">
                <Badge 
                  className="bg-primary/90 text-black font-semibold px-4 py-2 text-xs md:text-sm backdrop-blur-sm border-0"
                  data-testid="badge-coin-details"
                >
                  6-inch Diameter commemorative 1906
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
