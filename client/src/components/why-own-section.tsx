import { User, Gift, Trophy } from "lucide-react";

export function WhyOwnSection() {
  const reasons = [
    {
      icon: User,
      label: "For the Brothers",
      title: "The Brother",
      subtitle: "Wear Your Pride",
      description: "Display your commitment to the ideals that have shaped leaders for 120 years. This coin is more than memorabilia—it's a declaration of your values.",
    },
    {
      icon: Gift,
      label: "Perfect Gift",
      title: "The Mentor",
      subtitle: "Gift the Legacy",
      description: "Present this distinguished piece to a graduating brother, a new initiate, or any man who embodies our values. It's a gift that honors the past and inspires the future.",
    },
    {
      icon: Trophy,
      label: "Limited Forever",
      title: "The Collector",
      subtitle: "Own Scarcity",
      description: "With only 1,906 remaining and never to be reproduced, this is a once-in-a-lifetime opportunity to own a piece of fraternal history.",
    },
  ];

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-gradient-to-b from-background/95 to-background">
      <div className="max-w-7xl mx-auto space-y-16 md:space-y-20">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground tracking-tight leading-tight">
            A Symbol of Brotherhood.
            <br />
            <span className="text-primary">A Legacy to Hold.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div 
                key={index} 
                className="group relative overflow-visible rounded-2xl border border-primary/20 bg-card hover-elevate transition-all duration-300"
                data-testid={`card-why-own-${index}`}
              >
                <div className="relative p-8 md:p-10 space-y-6 text-center">
                  {/* Icon */}
                  <div className="mx-auto w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center bg-primary/10">
                    <Icon className="w-10 h-10 text-primary" />
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
          <p className="text-lg md:text-xl text-primary/80 font-serif italic">
            Join the Legacy - Order Now
          </p>
        </div>
      </div>
    </section>
  );
}
