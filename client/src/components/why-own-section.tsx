import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function WhyOwnSection() {
  const reasons = [
    {
      title: "The Personal Testament",
      mockup: "Lifestyle Mockup: Desk/Office",
      description: "A tangible, prestigious marker of your commitment and pride. Display it on your desk or in your office as a subtle, powerful statement of your Alpha Phi Alpha journey.",
    },
    {
      title: "The Perfect Gift",
      mockup: "Lifestyle Mockup: Gifting Moment",
      description: "The ultimate gift for a graduating brother, a mentor, an elder, or a new initiate. It's a treasured heirloom that is passed down, marking a lifetime of brotherhood.",
    },
    {
      title: "Collector's Investment",
      mockup: "Lifestyle Mockup: Mantlepiece",
      description: "As a strictly limited-edition collectible commemorating a monumental 120-year milestone, this coin is a non-negotiable addition to any Alpha artifact collection.",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-16">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground text-center tracking-monumental">
          A Legacy to Hold: For the Brother, For the Pride
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {reasons.map((reason, index) => (
            <Card 
              key={index} 
              className="shadow-xl border-t-4 border-primary space-y-4 overflow-hidden"
              data-testid={`card-why-own-${index}`}
            >
              <CardHeader className="p-0">
                <div className="w-full h-40 bg-background flex items-center justify-center border-b border-primary/50">
                  <p className="text-sm text-primary">{reason.mockup}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <h3 className="text-2xl font-serif text-primary tracking-monumental">
                  {reason.title}
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  {reason.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
