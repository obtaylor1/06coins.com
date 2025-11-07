import { Card } from "@/components/ui/card";
import { Ruler, Scale, Sparkles, Globe, Star, Shield } from "lucide-react";
import coinFrontImg from "@assets/apa coin front_1762505793054.png";
import coinBackImg from "@assets/apa coin back_1762505793054.png";

export function ProductShowcase() {
  return (
    <section className="relative py-20 md:py-32 px-6 md:px-12">
      <div className="relative z-10 max-w-7xl mx-auto space-y-20 md:space-y-28">
        {/* Section Header */}
        <div className="text-center space-y-6">
          <p className="text-lg md:text-xl text-primary/80 font-serif tracking-wider">The Masterpiece</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground tracking-tight leading-tight">
            Six Inches of History.
            <br />
            <span className="text-primary">Unmatched Quality.</span>
          </h2>
          <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
            Behold the weight of brotherhood. A premium collectible worthy of the Black and Gold.
          </p>
        </div>

        {/* Introductory Text */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
            This coin is more than metal; it is a meticulously crafted artifact that encapsulates 120 years of Alpha history. Every line, inscription, and curve was designed to honor the legacy of the Jewels and the promise of the future.
          </p>
        </div>

        {/* The Scale and Significance */}
        <div className="space-y-12">
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground text-center">
            The Scale and Significance
          </h3>
          
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8 md:p-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Ruler className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl md:text-3xl font-serif font-bold text-primary">
                    6-Inch Diameter
                  </h4>
                  <p className="text-foreground/70 leading-relaxed">
                    This size was chosen to physically represent the founding year, <strong className="text-primary">1906</strong>, giving the coin a substantial presence that demands attention. It is designed not to be carried, but to be displayed—a true mantlepiece artifact.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 md:p-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Scale className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl md:text-3xl font-serif font-bold text-primary">
                    Substantial Weight
                  </h4>
                  <p className="text-foreground/70 leading-relaxed">
                    Crafted from a premium zinc alloy with a rich Old Gold finish, the coin possesses a noticeable heft, signifying the weight and gravity of the fraternity's history and its enduring influence.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Front (Obverse) */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Coin Image */}
          <div className="order-2 lg:order-1">
            <div className="aspect-square rounded-full overflow-hidden shadow-2xl">
              <img 
                src={coinFrontImg} 
                alt="Alpha Phi Alpha 120th Anniversary Commemorative Coin - Front (Obverse)" 
                className="w-full h-full object-cover"
                data-testid="img-coin-front-showcase"
              />
            </div>
          </div>

          {/* Details */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                The Front (Obverse): <span className="text-primary">Foundations & Global Impact</span>
              </h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xl font-serif font-bold text-primary mb-2">The Sphinx</h4>
                  <p className="text-foreground/70 leading-relaxed">
                    The iconic Great Sphinx of Giza, the cornerstone of our sacred bond, stands prominently in high relief, watching over the inscription.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xl font-serif font-bold text-primary mb-2">The Alpha Shield</h4>
                  <p className="text-foreground/70 leading-relaxed">
                    Subtly integrated in the background, the official Shield represents the Manly Deeds, Scholarship, and Love for All Mankind upon which we are built.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Globe className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xl font-serif font-bold text-primary mb-2">Global Reach</h4>
                  <p className="text-foreground/70 leading-relaxed">
                    Encircling the design are stylized lines hinting at a global map, recognizing Alpha Phi Alpha's expansion across the U.S., the Caribbean, Africa, and beyond since its founding.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xl font-serif font-bold text-primary mb-2">Inscriptions</h4>
                  <p className="text-foreground/70 leading-relaxed">
                    Clearly marked are the founding year <strong className="text-primary">1906</strong> and the commemorative year <strong className="text-primary">2026</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back (Reverse) */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Coin Image */}
          <div>
            <div className="aspect-square rounded-full overflow-hidden shadow-2xl">
              <img 
                src={coinBackImg} 
                alt="Alpha Phi Alpha 120th Anniversary Commemorative Coin - Back (Reverse)" 
                className="w-full h-full object-cover"
                data-testid="img-coin-back-showcase"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                The Back (Reverse): <span className="text-primary">Founders & Future Promise</span>
              </h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <Star className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xl font-serif font-bold text-primary mb-2">The Seven Jewels</h4>
                  <p className="text-foreground/70 leading-relaxed">
                    Seven distinct stars are arranged in formation to pay direct homage to our seven visionary founders—The Jewels—who dared to lay the foundation at Cornell.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xl font-serif font-bold text-primary mb-2">The Founding Seal</h4>
                  <p className="text-foreground/70 leading-relaxed">
                    The official Greek-letter seal is centrally placed, a constant reminder of our intercollegiate origins.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xl font-serif font-bold text-primary mb-2">The Motto</h4>
                  <p className="text-foreground/70 leading-relaxed">
                    The complete mantra, <em className="text-primary">"First of All, Servants of All, We Shall Transcend All,"</em> is elegantly inscribed along the perimeter, serving as the call to action for every brother who views it.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xl font-serif font-bold text-primary mb-2">Precision Engraving</h4>
                  <p className="text-foreground/70 leading-relaxed">
                    The entire surface features micro-engraving texture, designed to catch and reflect light, giving the Old Gold finish a vibrant, enduring luster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Display and Presentation */}
        <div className="bg-card border border-primary/20 rounded-3xl p-10 md:p-16 space-y-10">
          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Display and <span className="text-primary">Presentation</span>
            </h3>
            <p className="text-lg md:text-xl text-foreground/70">
              Your investment includes not just the coin, but an exclusive presentation package
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h4 className="text-2xl font-serif font-bold text-primary">Premium Presentation Box</h4>
              <p className="text-foreground/70 leading-relaxed">
                The coin arrives nestled in a custom, velvet-lined display box embossed with the fraternity's shield in gold foil. It is ready for immediate display in your home or office.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-2xl font-serif font-bold text-primary">Limited Edition Card</h4>
              <p className="text-foreground/70 leading-relaxed">
                Each coin is accompanied by a sequentially numbered certificate of authenticity, validating its place within the exclusive commemorative run.
              </p>
            </div>
          </div>

          <div className="text-center pt-6">
            <p className="text-lg text-primary/80 font-serif italic">
              Claim Your Masterpiece
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
