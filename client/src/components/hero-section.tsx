import { Button } from "@/components/ui/button";
import goldTextureImg from "@assets/stock_images/gold_texture_metalli_7e23be74.jpg";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 py-20 md:px-12 md:py-24 overflow-hidden">
      {/* Subtle background texture */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url(${goldTextureImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-12 md:space-y-16">
        {/* Fraternity Motto */}
        <p 
          className="text-xl md:text-2xl lg:text-3xl text-primary font-serif tracking-[0.08em] leading-relaxed"
          data-testid="text-motto"
        >
          "First of All, Servants of All, We Shall Transcend All."
        </p>
        
        {/* Main Headline */}
        <div className="space-y-4">
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-foreground font-serif tracking-tight leading-[0.95]"
            data-testid="text-hero-title"
          >
            120 Years
            <br />
            <span className="text-primary">Forged in Gold</span>
          </h1>
          <p 
            className="text-lg md:text-xl lg:text-2xl text-foreground/70 font-serif italic"
            data-testid="text-hero-subtitle"
          >
            Alpha Phi Alpha • 1906–2026
          </p>
        </div>
        
        {/* Premium coin placeholder with museum-quality presentation */}
        <div className="mx-auto w-full max-w-2xl px-4 md:px-8">
          <div 
            className="relative aspect-square rounded-2xl flex items-center justify-center overflow-hidden border border-primary/20"
            style={{
              background: 'radial-gradient(circle at center, hsl(42 48% 56% / 0.15) 0%, hsl(0 0% 7%) 70%)'
            }}
            data-testid="container-coin-render"
          >
            {/* Placeholder content */}
            <div className="text-center space-y-4 p-8">
              <div className="w-32 h-32 md:w-48 md:h-48 mx-auto rounded-full border-4 border-primary/40 flex items-center justify-center animate-pulse-gold">
                <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-2 border-primary/60 flex items-center justify-center">
                  <span className="text-6xl md:text-8xl text-primary/80">Α</span>
                </div>
              </div>
              <p className="text-sm md:text-base text-primary/60 font-serif tracking-wider">
                COMMEMORATIVE COIN IMAGE
              </p>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p 
          className="text-lg md:text-xl lg:text-2xl text-foreground/80 max-w-4xl mx-auto leading-relaxed"
          data-testid="text-hero-description"
        >
          Honor the legacy of the Seven Jewels and secure your piece of{" "}
          <strong className="text-primary font-semibold">Alpha history</strong>. 
          This six-inch commemorative artifact stands as a permanent testament to our enduring brotherhood.
        </p>
        
        {/* Primary CTA */}
        <div className="pt-4">
          <Button
            onClick={onCtaClick}
            size="lg"
            className="text-lg md:text-xl font-bold rounded-xl shadow-2xl hover:scale-105 transition-all duration-300"
            data-testid="button-hero-cta"
          >
            SECURE YOUR COIN NOW
          </Button>
        </div>
      </div>
    </section>
  );
}
