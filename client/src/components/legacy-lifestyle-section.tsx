import professionalDeskImg1 from "@assets/stock_images/professional_mahogan_4bd46e85.jpg";
import giftPresentationImg from "@assets/stock_images/elegant_gift_present_ca12998c.jpg";
import homeMantleImg from "@assets/stock_images/elegant_home_mantle__9166904c.jpg";
import coinDetailImg from "@assets/stock_images/gold_coin_close-up_d_04ec2cbe.jpg";

export function LegacyLifestyleSection() {
  const displays = [
    {
      title: "The Professional Display",
      subtitle: "A Symbol of Achievement",
      description: "Displayed on a polished mahogany desk, this coin commands attention alongside your professional accomplishments. The 6-inch diameter makes a dignified statement in any office setting.",
      features: [
        "Premium acrylic display stand included",
        "Museum-quality finish catches natural light",
        "Conversation starter with colleagues and clients",
      ],
      images: {
        lifestyle: professionalDeskImg1,
        alt: "Professional desk display",
      },
    },
    {
      title: "The Thoughtful Gift",
      subtitle: "The Ultimate Brotherhood Present",
      description: "Presented in a custom velvet-lined box, this coin becomes the perfect gift for new initiates, graduating brothers, or long-time mentors. A moment they'll treasure forever.",
      features: [
        "Velvet-lined presentation box",
        "Certificate of authenticity & edition number",
        "Perfect for graduations & milestone celebrations",
      ],
      images: {
        lifestyle: giftPresentationImg,
        alt: "Gift presentation",
      },
    },
    {
      title: "The Heritage Mantlepiece",
      subtitle: "A Distinguished Heirloom",
      description: "Displayed on your mantle or library shelf, the coin's impressive 6-inch scale commands presence alongside your most cherished items. A permanent marker of fraternity pride.",
      features: [
        "Substantial 6-inch diameter visible from across the room",
        "Complements formal home settings",
        "Becomes a treasured family heirloom",
      ],
      images: {
        lifestyle: homeMantleImg,
        alt: "Home display",
      },
    },
    {
      title: "Museum-Quality Craftsmanship",
      subtitle: "Precision You Can Feel",
      description: "Every detail — from the founding date \"1906\" to the intricate motto engraving — is executed with microscopic precision. This level of craftsmanship justifies the premium investment.",
      features: [
        "High-relief engraving technique",
        "24K gold finish with protective coating",
        "Each coin individually inspected for quality",
      ],
      images: {
        lifestyle: coinDetailImg,
        alt: "Coin detail",
      },
    },
  ];

  return (
    <section className="py-20 md:py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Section Header */}
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground tracking-tight leading-tight">
            A Legacy to Hold
          </h2>
          <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
            More than a commemorative coin — this is a museum-quality display piece, a meaningful gift, and a permanent marker of pride.
          </p>
        </div>

        {/* Display Scenarios */}
        <div className="space-y-24">
          {displays.map((display, index) => (
            <div 
              key={index}
              className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image */}
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                  <img
                    src={display.images.lifestyle}
                    alt={display.images.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </div>

              {/* Content */}
              <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="space-y-3">
                  <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                    {display.title}
                  </h3>
                  <p className="text-xl md:text-2xl font-serif text-primary italic">
                    {display.subtitle}
                  </p>
                </div>

                <p className="text-lg text-foreground/70 leading-relaxed">
                  {display.description}
                </p>

                <ul className="space-y-3">
                  {display.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3 text-foreground/80">
                      <span className="text-primary mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center space-y-6 pt-12">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            This Is More Than a Purchase
          </h3>
          <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
            You're acquiring a piece of history, a symbol of excellence, and a legacy that transcends generations.
          </p>
          <p className="text-lg md:text-xl text-primary/80 font-serif italic pt-4">
            Secure Your Legacy Now
          </p>
        </div>
      </div>
    </section>
  );
}
