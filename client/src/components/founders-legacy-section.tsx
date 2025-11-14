import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import callisImg from "@assets/stock_images/gold_coin_close-up_d_04ec2cbe.jpg";
import chapmanImg from "@assets/stock_images/professional_portrai_5d1cea82.jpg";
import jonesImg from "@assets/stock_images/professional_portrai_6def0f3e.jpg";
import kelleyImg from "@assets/stock_images/professional_portrai_dfbec7f4.jpg";
import murrayImg from "@assets/stock_images/professional_portrai_2fed975a.jpg";
import ogleImg from "@assets/stock_images/gold_coin_close-up_d_77d8a5a8.jpg";
import tandyImg from "@assets/stock_images/professional_portrai_fec7d2d0.jpg";

interface FoundersLegacySectionProps {
  onCtaClick: () => void;
}

const founders = [
  { name: "Callis", image: callisImg, isCoin: true },
  { name: "Chapman", image: chapmanImg, isCoin: false },
  { name: "Jones", image: jonesImg, isCoin: false },
  { name: "Kelley", image: kelleyImg, isCoin: false },
  { name: "Murray", image: murrayImg, isCoin: false },
  { name: "Ogle", image: ogleImg, isCoin: true },
  { name: "Tandy", image: tandyImg, isCoin: false },
];

export function FoundersLegacySection({ onCtaClick }: FoundersLegacySectionProps) {
  return (
    <section 
      className="py-20 px-6 md:px-12 lg:px-16 bg-background"
      data-testid="section-founders-legacy"
    >
      <div className="max-w-6xl mx-auto text-center space-y-12">
        {/* Badge */}
        <div className="flex justify-center">
          <Badge 
            className="bg-destructive text-white px-4 py-1.5 font-semibold text-sm"
            data-testid="badge-complete-collection"
          >
            The Complete Collection
          </Badge>
        </div>

        {/* Title */}
        <h2 
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary font-serif leading-tight"
          data-testid="text-legacy-title"
        >
          The Founders' Legacy Set: Own All Seven Jewels
        </h2>

        {/* Subtitle */}
        <p 
          className="text-base md:text-lg text-foreground/70 max-w-3xl mx-auto"
          data-testid="text-legacy-subtitle"
        >
          Honor each of the Seven Visionary Founders with this exclusive museum-quality collection.
        </p>

        {/* Price Box */}
        <div 
          className="inline-block border-2 border-primary/50 rounded-lg px-8 py-6 bg-primary/5"
          data-testid="box-complete-set-price"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-foreground/80 text-sm font-medium">
              Complete Set Price:
            </span>
            <span className="text-4xl md:text-5xl font-bold text-primary">
              $120.06
            </span>
            <span className="text-sm text-foreground/60">
              Commemorating 1906 · Seven Individual Coins · Limited Edition
            </span>
          </div>
        </div>

        {/* Founders Grid */}
        <div className="flex justify-center items-end gap-4 md:gap-6 flex-wrap">
          {founders.map((founder) => (
            <div 
              key={founder.name}
              className="flex flex-col items-center gap-3"
              data-testid={`founder-${founder.name.toLowerCase()}`}
            >
              <div 
                className={`w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden ${
                  founder.isCoin 
                    ? 'border-2 border-primary/70' 
                    : 'border-2 border-foreground/40'
                }`}
              >
                <img 
                  src={founder.image}
                  alt={`${founder.name} portrait`}
                  className="w-full h-full object-cover"
                  data-testid={`img-founder-${founder.name.toLowerCase()}`}
                />
              </div>
              <span className="text-sm md:text-base text-primary font-semibold">
                {founder.name}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="pt-6">
          <Button
            onClick={onCtaClick}
            size="lg"
            className="bg-primary text-black font-bold border-0"
            data-testid="button-purchase-jewel-set"
          >
            PURCHASE JEWEL SET
          </Button>
        </div>

        {/* Bottom Text */}
        <p 
          className="text-sm text-foreground/60 pt-4"
          data-testid="text-craftsmanship-note"
        >
          Each coin features museum-quality craftsmanship with dramatic Old Gold finish
        </p>
      </div>
    </section>
  );
}
