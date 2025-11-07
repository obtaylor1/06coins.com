import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 py-20 md:px-12 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* Logo/Branding */}
        <div className="space-y-3">
          <h2 
            className="text-2xl md:text-3xl font-bold text-primary font-serif tracking-widest"
            data-testid="text-brand"
          >
            Alpha Phi Alpha
          </h2>
          <p className="text-base md:text-lg text-foreground/80 font-semibold">
            120th Anniversary Edition
          </p>
        </div>

        {/* Main Headline */}
        <div className="space-y-6">
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground font-serif tracking-tight leading-tight"
            data-testid="text-hero-title"
          >
            120 Years Forged in Gold:
            <br />
            <span className="text-primary">The Official Commemorative Coin</span>
          </h1>
          
          {/* Motto */}
          <p 
            className="text-xl md:text-2xl lg:text-3xl text-primary/90 font-serif italic tracking-wide max-w-4xl mx-auto"
            data-testid="text-motto"
          >
            "First of All, Servants of All, We Shall Transcend All."
          </p>
        </div>

        {/* Description */}
        <p 
          className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed"
          data-testid="text-hero-description"
        >
          Honor the Legacy of the Jewels and secure your piece of Alpha history.
        </p>

        {/* Limited Edition Badge */}
        <div className="flex flex-col items-center gap-3">
          <Badge 
            variant="outline" 
            className="text-lg md:text-xl px-6 py-2 border-primary/50 bg-primary/10"
            data-testid="badge-limited-edition"
          >
            <span className="font-bold">LIMITED EDITION.</span>
            <span className="ml-2">Only {stock} available worldwide.</span>
          </Badge>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={onCtaClick}
            size="lg"
            className="text-base md:text-lg font-bold"
            data-testid="button-hero-cta-primary"
          >
            Secure Your Coin Now
          </Button>
          <Button
            onClick={onCtaClick}
            size="lg"
            variant="outline"
            className="text-base md:text-lg font-bold"
            data-testid="button-hero-cta-secondary"
          >
            View Details
          </Button>
        </div>

        {/* Price and Trust Signals */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center text-sm md:text-base">
          <div className="flex items-center gap-2 text-primary font-bold text-2xl">
            $50.00 <span className="text-lg text-foreground/60 font-normal">Each</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 text-foreground/60">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Secure Checkout
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Authenticity Guaranteed
            </span>
          </div>
        </div>

        {/* Coin Image Placeholder */}
        <div className="mx-auto w-full max-w-xl px-4 pt-8">
          <div 
            className="relative aspect-square rounded-3xl flex items-center justify-center overflow-hidden border-4 border-primary/30 shadow-2xl"
            style={{
              background: 'radial-gradient(circle at center, hsl(42 48% 56% / 0.2) 0%, hsl(0 0% 7%) 70%)'
            }}
            data-testid="container-coin-image"
          >
            {/* Premium Placeholder */}
            <div className="text-center space-y-4 p-8">
              <div className="w-40 h-40 md:w-56 md:h-56 mx-auto rounded-full border-8 border-primary/40 flex items-center justify-center animate-pulse-gold">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-primary/60 flex items-center justify-center bg-primary/5">
                  <span className="text-7xl md:text-9xl text-primary font-serif font-bold">Α</span>
                </div>
              </div>
              <p className="text-sm md:text-base text-primary/60 font-serif tracking-widest">
                6-Inch Diameter: Commemorating 1906
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
