import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Users, ShieldCheck } from "lucide-react";

interface StorySectionProps {
  onCtaClick?: () => void;
}

export function StorySection({ onCtaClick }: StorySectionProps) {
  const timeline = [
    {
      year: "1906",
      title: "The Jewels",
      description: "Seven visionary founders established the first intercollegiate Greek-letter fraternity for African Americans at Cornell University.",
      icon: User,
    },
    {
      year: "1906-2026",
      title: "120 Years of Excellence",
      description: "Generations of brothers upholding the ideals of Scholarship, Fellowship, Good Character, and the Uplifting of Humanity.",
      icon: Users,
    },
    {
      year: "2026",
      title: "The Celebration",
      description: "This commemorative coin represents our past, present, and future—a symbol of brotherhood and a legacy to hold.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-gradient-to-b from-background to-background/95">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-6">
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground tracking-tight"
            data-testid="text-story-title"
          >
            From the Jewels' Vision to a <span className="text-primary">Global Force</span>
          </h2>
          <p className="text-xl md:text-2xl text-foreground/70">
            1906-2026: A legacy of Scholarship, Fellowship, and Service
          </p>
        </div>

        {/* Three-Card Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {timeline.map((item, index) => (
            <div 
              key={index}
              className="group relative bg-card border border-primary/20 rounded-2xl p-8 md:p-10 space-y-6 hover-elevate transition-all duration-300"
              data-testid={`card-timeline-${index}`}
            >
              {/* Year */}
              <div className="text-center">
                <h3 className="text-5xl md:text-6xl font-serif font-bold text-primary">
                  {item.year}
                </h3>
              </div>

              {/* Title */}
              <h4 className="text-2xl md:text-3xl font-serif font-bold text-foreground text-center">
                {item.title}
              </h4>

              {/* Description */}
              <p className="text-base md:text-lg text-foreground/70 leading-relaxed text-center">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Vertical Timeline */}
        <div className="max-w-4xl mx-auto pt-16">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 transform -translate-x-1/2 hidden md:block" />

            {/* Timeline Items */}
            <div className="space-y-16 md:space-y-24">
              {timeline.map((item, index) => {
                const Icon = item.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div 
                    key={index}
                    className="relative"
                    data-testid={`timeline-item-${index}`}
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-4">
                      <Badge 
                        className="bg-primary text-black font-bold px-4 py-2 text-sm w-fit"
                        data-testid={`badge-year-mobile-${index}`}
                      >
                        {item.year}
                      </Badge>
                      <h3 className="text-2xl font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-base text-foreground/70 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid md:grid-cols-2 md:gap-8 items-center">
                      {isEven ? (
                        <>
                          {/* Left Side - Content */}
                          <div className="text-right space-y-4">
                            <Badge 
                              className="bg-primary text-black font-bold px-4 py-2 text-sm ml-auto w-fit"
                              data-testid={`badge-year-desktop-${index}`}
                            >
                              {item.year}
                            </Badge>
                            <h3 className="text-2xl font-bold text-foreground">
                              {item.title}
                            </h3>
                            <p className="text-base text-foreground/70 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          {/* Right Side - Icon */}
                          <div className="flex justify-start">
                            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary text-black">
                              <Icon className="w-8 h-8" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Left Side - Icon */}
                          <div className="flex justify-end">
                            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary text-black">
                              <Icon className="w-8 h-8" />
                            </div>
                          </div>
                          {/* Right Side - Content */}
                          <div className="text-left space-y-4">
                            <Badge 
                              className="bg-primary text-black font-bold px-4 py-2 text-sm w-fit"
                              data-testid={`badge-year-desktop-${index}`}
                            >
                              {item.year}
                            </Badge>
                            <h3 className="text-2xl font-bold text-foreground">
                              {item.title}
                            </h3>
                            <p className="text-base text-foreground/70 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center pt-8">
          <Button
            onClick={onCtaClick}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-black font-bold text-base px-8"
            data-testid="button-story-cta"
          >
            Honor the Legacy - Add to Cart
          </Button>
        </div>
      </div>
    </section>
  );
}
