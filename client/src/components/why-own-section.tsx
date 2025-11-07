import goldTextureImg2 from "@assets/stock_images/gold_texture_metalli_899f2d67.jpg";

export function WhyOwnSection() {
  const reasons = [
    {
      title: "The Personal Testament",
      description: "A tangible, prestigious marker of your commitment and pride. Display it on your desk or in your office as a subtle, powerful statement of your Alpha Phi Alpha journey.",
    },
    {
      title: "The Perfect Gift",
      description: "The ultimate gift for a graduating brother, a mentor, an elder, or a new initiate. A treasured heirloom marking a lifetime of brotherhood.",
    },
    {
      title: "Collector's Investment",
      description: "A strictly limited-edition collectible commemorating a monumental 120-year milestone. A non-negotiable addition to any Alpha artifact collection.",
    },
  ];

  return (
    <section className="py-20 md:py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-16 md:space-y-20">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-foreground tracking-tight leading-tight">
            A Legacy to Hold:
            <br />
            <span className="text-primary">For the Brother, For the Pride</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm hover-elevate transition-all duration-300"
              data-testid={`card-why-own-${index}`}
            >
              {/* Subtle gold texture on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                style={{
                  backgroundImage: `url(${goldTextureImg2})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              
              <div className="relative p-8 md:p-10 space-y-6">
                {/* Icon indicator */}
                <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center bg-primary/5">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-serif text-primary tracking-tight leading-tight">
                  {reason.title}
                </h3>
                
                <p className="text-foreground/70 text-base md:text-lg leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
