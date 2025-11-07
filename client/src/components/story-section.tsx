export function StorySection() {
  const timeline = [
    {
      year: "1906",
      title: "The Jewels",
      description: "Seven visionary founders established the first intercollegiate Greek-letter fraternity for African Americans at Cornell University.",
    },
    {
      year: "1906-2026",
      title: "120 Years of Excellence",
      description: "Generations of brothers upholding the ideals of Scholarship, Fellowship, Good Character, and the Uplifting of Humanity.",
    },
    {
      year: "2026",
      title: "The Celebration",
      description: "This commemorative coin represents our past, present, and future—a symbol of brotherhood and a legacy to hold.",
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

        {/* Timeline Cards */}
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

        {/* CTA */}
        <div className="text-center pt-8">
          <p className="text-lg md:text-xl text-primary/80 font-serif italic">
            Honor the Legacy - Add to Cart
          </p>
        </div>
      </div>
    </section>
  );
}
