import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <p 
          className="text-2xl md:text-3xl text-primary font-serif tracking-monumental"
          data-testid="text-motto"
        >
          "First of All, Servants of All, We Shall Transcend All."
        </p>
        
        <h2 
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground font-serif tracking-tight leading-none"
          data-testid="text-hero-title"
        >
          120 Years Forged in Gold
        </h2>
        
        {/* Coin render placeholder with gold pulse animation */}
        <div 
          className="mx-auto w-full max-w-lg aspect-square rounded-xl flex items-center justify-center p-12 border-4 border-primary animate-pulse-gold overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(42 48% 56% / 0.5), hsl(0 0% 7% / 0.8))'
          }}
          data-testid="container-coin-render"
        >
          <p className="text-lg md:text-xl text-primary text-center font-serif tracking-monumental">
            HIGH-FIDELITY 3D COIN RENDER HERE<br />
            (Sphinx Side Rotating)
          </p>
        </div>
        
        <p 
          className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto"
          data-testid="text-hero-description"
        >
          Honor the Legacy of the Jewels and secure your piece of <strong className="text-primary">Alpha history</strong>. 
          This six-inch artifact is a permanent testament to our enduring brotherhood.
        </p>
        
        <Button
          onClick={onCtaClick}
          size="lg"
          className="text-xl font-bold py-6 px-12 rounded-xl shadow-2xl hover:scale-105 transition-transform"
          data-testid="button-hero-cta"
        >
          SECURE YOUR COIN NOW
        </Button>
      </div>
    </section>
  );
}
