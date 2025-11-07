import { Card } from "@/components/ui/card";
import luxuryBgImg from "@assets/stock_images/luxury_black_and_gol_33f8eddd.jpg";

export function ProductShowcase() {
  return (
    <section className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden">
      {/* Background texture */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${luxuryBgImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-16 md:space-y-20">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-foreground tracking-tight leading-tight">
            Six Inches of History.
            <br />
            <span className="text-primary">Unmatched Quality.</span>
          </h2>
          <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto">
            A premium collectible worthy of the Black and Gold
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Product Renders/Video */}
          <div className="lg:w-1/2 space-y-6">
            {/* Video placeholder with elegant styling */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-primary/20 bg-card/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-3 p-8">
                <div className="w-20 h-20 mx-auto rounded-full border-2 border-primary/40 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <p className="text-sm text-primary/80 font-serif tracking-wider">
                  COIN SHOWCASE VIDEO
                </p>
              </div>
            </div>
            
            {/* Side-by-side coin renders with elegant borders */}
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-xl overflow-hidden border border-primary/20 bg-card/30 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full border-2 border-primary/40 flex items-center justify-center">
                    <span className="text-3xl text-primary/80">Α</span>
                  </div>
                  <p className="text-xs text-primary/60 font-serif tracking-wider">FRONT SIDE</p>
                </div>
              </div>
              <div className="aspect-square rounded-xl overflow-hidden border border-primary/20 bg-card/30 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full border-2 border-primary/40 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-1">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-primary/60 font-serif tracking-wider">BACK SIDE</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Symbolism with Premium Layout */}
          <div className="lg:w-1/2 space-y-10">
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif text-primary tracking-tight">
                The Scale and Significance
              </h3>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  <strong className="text-primary font-semibold">6-Inch Diameter:</strong> Chosen to physically represent the founding year, 1906. Designed to be a substantial, commanding display piece that makes an immediate impression.
                </p>
                <p>
                  <strong className="text-primary font-semibold">Substantial Weight:</strong> Crafted from premium zinc alloy with a rich Old Gold finish, symbolizing the gravity and permanence of our 120-year history.
                </p>
              </div>
            </div>

            <div className="h-px bg-primary/20 w-full" />

            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif text-primary tracking-tight">
                Obverse (Front) Details
              </h3>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  <strong className="text-primary font-semibold">The Sphinx:</strong> The iconic cornerstone of our sacred bond, rendered in striking high relief with intricate detailing.
                </p>
                <p>
                  <strong className="text-primary font-semibold">Global Reach:</strong> Stylized lines encircling the design recognize Alpha Phi Alpha's international expansion across six continents.
                </p>
                <p>
                  <strong className="text-primary font-semibold">Commemorative Dates:</strong> 1906 and 2026 prominently displayed, framing our 120-year journey of excellence.
                </p>
              </div>
            </div>

            <div className="h-px bg-primary/20 w-full" />

            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif text-primary tracking-tight">
                Reverse (Back) Details
              </h3>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  <strong className="text-primary font-semibold">The Seven Jewels:</strong> Seven distinct stars meticulously arranged in homage to our visionary founders who shaped history at Cornell.
                </p>
                <p>
                  <strong className="text-primary font-semibold">The Sacred Motto:</strong> Our complete mantra, "First of All, Servants of All, We Shall Transcend All" elegantly inscribed along the perimeter.
                </p>
                <p>
                  <strong className="text-primary font-semibold">Premium Presentation:</strong> Each coin arrives in a custom, velvet-lined display box with a numbered certificate of authenticity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
