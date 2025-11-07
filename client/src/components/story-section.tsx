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
    <section className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <h2 
          className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary text-center tracking-monumental"
          data-testid="text-story-heading"
        >
          More Than a Coin: A Symbol of Enduring Brotherhood
        </h2>
        
        <div className="grid md:grid-cols-3 gap-10">
          {stories.map((story, index) => (
            <div key={index} className="space-y-4" data-testid={`card-story-${index}`}>
              <h3 
                className="text-2xl font-serif text-primary tracking-monumental"
                data-testid={`text-story-title-${index}`}
              >
                {story.title}
              </h3>
              <p 
                className="text-foreground/90 text-lg leading-relaxed"
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
