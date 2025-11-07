import fraternityImg from "@assets/stock_images/fraternity_brotherho_3214f1c2.jpg";

export function StorySection() {
  const stories = [
    {
      title: "The Jewel's Vision (1906)",
      content: "Our journey began at Cornell, founded by seven visionary Jewels who sought to build a strong bond for African descendants. This coin embodies the courage they displayed against prejudice, laying the foundation for our global impact.",
    },
    {
      title: "A Foundation of Principles",
      content: "The 120-year narrative is driven by our core tenets. This artifact connects you directly to the values of Scholarship, Fellowship, Good Character, and the Uplifting of Humanity, which continue to guide us today.",
    },
    {
      title: "The Global Force (2026)",
      content: "From a small study group to a significant force in civil rights and social justice—with over 700 chapters worldwide. Owning this coin is a recognition of the collective impact of thousands of brothers over twelve decades.",
    },
  ];

  return (
    <section className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden">
      {/* Background image with dark overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${fraternityImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95" />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-16 md:space-y-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h2 
            className="text-4xl md:text-5xl lg:text-7xl font-serif text-foreground tracking-tight leading-tight"
            data-testid="text-story-heading"
          >
            More Than a Coin:
            <br />
            <span className="text-primary">A Symbol of Enduring Brotherhood</span>
          </h2>
          <p className="text-xl md:text-2xl text-foreground/60">
            Celebrating 120 years of excellence, leadership, and service
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {stories.map((story, index) => (
            <div 
              key={index} 
              className="space-y-5 p-8 rounded-2xl border border-primary/10 bg-card/30 backdrop-blur-sm hover-elevate transition-all duration-300" 
              data-testid={`card-story-${index}`}
            >
              <div className="w-12 h-1 bg-primary rounded-full" />
              <h3 
                className="text-2xl md:text-3xl font-serif text-primary tracking-tight leading-tight"
                data-testid={`text-story-title-${index}`}
              >
                {story.title}
              </h3>
              <p 
                className="text-foreground/80 text-base md:text-lg leading-relaxed"
                data-testid={`text-story-content-${index}`}
              >
                {story.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
