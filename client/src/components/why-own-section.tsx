import { Button } from "@/components/ui/button";
import coinFrontImg from "@assets/apa coin front_1762505793054.png";
import coinBackImg from "@assets/apa coin back_1762505793054.png";
import sectionBgImg from "@assets/0_0-5_1763342224856.jpg";

interface WhyOwnSectionProps {
  onCtaClick?: () => void;
}

export function WhyOwnSection({ onCtaClick }: WhyOwnSectionProps) {
  const reasons = [
    {
      label: "For the Brothers",
      title: "The Brother",
      subtitle: "Wear Your Pride",
      description: "Display your commitment to the ideals that have shaped leaders for 120 years. This coin is more than memorabilia—it's a declaration of your values.",
      bgImage: coinFrontImg,
    },
    {
      label: "Perfect Gift",
      title: "The Mentor",
      subtitle: "Gift the Legacy",
      description: "Present this distinguished piece to a graduating brother, a new initiate, or any man who embodies our values. It's a gift that honors the past and inspires the future.",
      bgImage: coinBackImg,
    },
    {
      label: "Limited Forever",
      title: "The Collector",
      subtitle: "Own Scarcity",
      description: "With only 1,906 remaining and never to be reproduced, this is a once-in-a-lifetime opportunity to own a piece of fraternal history.",
      bgImage: coinFrontImg,
    },
  ];

  return (
    <section 
      className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden"
      style={{
        backgroundImage: `url(${sectionBgImg})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/85 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-16 md:space-y-20">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground tracking-tight leading-tight">
            A Symbol of Brotherhood.
            <br />
            <span className="text-primary">A Legacy to Hold.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {reasons.map((reason, index) => {
            return (
              <div 
                key={index} 
                className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-card hover-elevate transition-all duration-300"
                data-testid={`card-why-own-${index}`}
              >
                {/* Background coin image */}
                <div 
                  className="absolute inset-0 bg-center bg-no-repeat bg-cover opacity-10"
                  style={{ backgroundImage: `url(${reason.bgImage})` }}
                />
                
                <div className="relative p-8 md:p-10 space-y-6 text-center z-10">
                  {/* Coin Image */}
                  <div className="mx-auto w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center bg-background/80 overflow-hidden">
                    <img 
                      src={coinBackImg} 
                      alt="Alpha Phi Alpha Coin" 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Label */}
                  <p className="text-sm text-foreground/60 font-semibold tracking-wider uppercase">
                    {reason.label}
                  </p>

                  {/* Title */}
                  <h3 
                    className="text-3xl md:text-4xl font-serif font-bold text-foreground"
                    data-testid={`text-why-own-title-${index}`}
                  >
                    {reason.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xl md:text-2xl font-serif text-primary italic">
                    {reason.subtitle}
                  </p>

                  {/* Description */}
                  <p 
                    className="text-foreground/70 text-base md:text-lg leading-relaxed"
                    data-testid={`text-why-own-description-${index}`}
                  >
                    {reason.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Button
            onClick={onCtaClick}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-black font-bold text-lg px-12 py-6"
            data-testid="button-join-legacy"
          >
            Join the Legacy - Order Now
          </Button>
        </div>
      </div>
    </section>
  );
}
