import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import callisImg from "@assets/Henry Arthur Callis_1763159941951.png";
import chapmanImg from "@assets/Charles Henry Chapman_1763159941952.png";
import jonesImg from "@assets/Eugene Kincle Jones_1763159941953.png";
import kelleyImg from "@assets/george biddle kelley_1763159941952.png";
import murrayImg from "@assets/Nathaniel Allison Murray_1763159941952.png";
import ogleImg from "@assets/Robert Harold Ogle_1763159941950.png";
import tandyImg from "@assets/Vertner Woodson Tandy_1763159941953.png";

interface FoundersLegacySectionProps {
  onCtaClick: () => void;
}

const founders = [
  { name: "Callis", fullName: "Henry Arthur Callis", image: callisImg },
  { name: "Chapman", fullName: "Charles Henry Chapman", image: chapmanImg },
  { name: "Jones", fullName: "Eugene Kinckle Jones", image: jonesImg },
  { name: "Kelley", fullName: "George Biddle Kelley", image: kelleyImg },
  { name: "Murray", fullName: "Nathaniel Allison Murray", image: murrayImg },
  { name: "Ogle", fullName: "Robert Harold Ogle", image: ogleImg },
  { name: "Tandy", fullName: "Vertner Woodson Tandy", image: tandyImg },
];

export function FoundersLegacySection({ onCtaClick }: FoundersLegacySectionProps) {
  return (
    <section 
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-16 bg-white"
      data-testid="section-founders-legacy"
    >
      <div className="max-w-6xl mx-auto text-center space-y-8 sm:space-y-10 md:space-y-12">
        {/* Badge */}
        <div className="flex justify-center">
          <Badge 
            className="bg-destructive text-white px-6 sm:px-8 md:px-10 py-2 sm:py-3 md:py-3.5 font-semibold text-sm sm:text-base md:text-lg rounded-lg"
            data-testid="badge-complete-collection"
          >
            The Complete Collection
          </Badge>
        </div>

        {/* Title */}
        <h2 
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary font-serif leading-tight px-2"
          data-testid="text-legacy-title"
        >
          The Founders' Legacy Set: Own All Seven Jewels
        </h2>

        {/* Subtitle */}
        <p 
          className="text-sm sm:text-base md:text-lg text-gray-700 max-w-3xl mx-auto px-2"
          data-testid="text-legacy-subtitle"
        >
          Honor each of the Seven Visionary Founders with this exclusive museum-quality collection.
        </p>

        {/* Price Box */}
        <div 
          className="inline-block border-2 border-primary/50 rounded-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-primary/5 mx-2"
          data-testid="box-complete-set-price"
        >
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <span className="text-gray-800 text-xs sm:text-sm font-medium">
              Complete Set Price:
            </span>
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
              $120.06
            </span>
            <span className="text-xs sm:text-sm text-gray-600 text-center">
              Commemorating 1906 · Seven Individual Coins · Limited Edition
            </span>
          </div>
        </div>

        {/* Founders Grid */}
        <div className="flex justify-center items-end gap-2 sm:gap-3 md:gap-4 lg:gap-6 flex-wrap px-2">
          {founders.map((founder) => (
            <div 
              key={founder.name}
              className="flex flex-col items-center gap-1 sm:gap-2"
              data-testid={`founder-${founder.name.toLowerCase()}`}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-2 border-primary/70">
                <img 
                  src={founder.image}
                  alt={`Jewel ${founder.fullName} commemorative coin`}
                  className="w-full h-full object-cover"
                  data-testid={`img-founder-${founder.name.toLowerCase()}`}
                />
              </div>
              <span className="text-[0.6rem] sm:text-xs md:text-sm text-primary font-semibold text-center leading-tight max-w-[60px] sm:max-w-[80px] md:max-w-none">
                {founder.fullName}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="pt-4 sm:pt-6">
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
          className="text-xs sm:text-sm text-gray-600 pt-2 sm:pt-4 px-2"
          data-testid="text-craftsmanship-note"
        >
          Each 3-inch coin features museum-quality craftsmanship with dramatic Old Gold finish
        </p>
      </div>
    </section>
  );
}
