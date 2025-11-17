import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Minus, Plus, ArrowRight } from "lucide-react";
import callisImg from "@assets/Henry Arthur Callis_1763159941951.png";
import chapmanImg from "@assets/Charles Henry Chapman_1763159941952.png";
import jonesImg from "@assets/Eugene Kincle Jones_1763159941953.png";
import kelleyImg from "@assets/george biddle kelley_1763159941952.png";
import murrayImg from "@assets/Nathaniel Allison Murray_1763159941952.png";
import ogleImg from "@assets/Robert Harold Ogle_1763159941950.png";
import tandyImg from "@assets/Vertner Woodson Tandy_1763159941953.png";

interface Jewel {
  id: string;
  name: string;
  fullName: string;
  years: string;
  title: string;
  description: string;
  price: number;
  coinImage: string;
}

const JEWELS: Jewel[] = [
  {
    id: "callis",
    name: "Callis",
    fullName: "Henry Arthur Callis",
    years: "1887 - 1974",
    title: "Visionary Founder and First Vice President",
    description: "Medical pioneer and dedicated fraternity leader who helped establish Alpha Phi Alpha.",
    price: 19.06,
    coinImage: callisImg,
  },
  {
    id: "chapman",
    name: "Chapman",
    fullName: "Charles Henry Chapman",
    years: "1870 - 1934",
    title: "Founding Jewel",
    description: "One of the seven visionary founders who established the first intercollegiate Greek-letter fraternity for African Americans.",
    price: 19.06,
    coinImage: chapmanImg,
  },
  {
    id: "jones",
    name: "Jones",
    fullName: "Eugene Kincle Jones",
    years: "1885 - 1954",
    title: "Social Work Pioneer and Founding Jewel",
    description: "Influential social reformer who co-founded the National Urban League and championed civil rights.",
    price: 19.06,
    coinImage: jonesImg,
  },
  {
    id: "kelley",
    name: "Kelley",
    fullName: "George Biddle Kelley",
    years: "1884 - 1963",
    title: "Engineering Pioneer and Founding Jewel",
    description: "First African American engineer registered in the state of New York and civil rights advocate.",
    price: 19.06,
    coinImage: kelleyImg,
  },
  {
    id: "murray",
    name: "Murray",
    fullName: "Nathaniel Allison Murray",
    years: "1884 - 1959",
    title: "Founding Jewel",
    description: "Dedicated educator and fraternity leader who helped shape Alpha Phi Alpha's early foundation.",
    price: 19.06,
    coinImage: murrayImg,
  },
  {
    id: "ogle",
    name: "Ogle",
    fullName: "Robert Harold Ogle",
    years: "1886 - 1936",
    title: "Founding Jewel",
    description: "Committed educator and one of the seven visionaries who founded Alpha Phi Alpha at Cornell University.",
    price: 19.06,
    coinImage: ogleImg,
  },
  {
    id: "tandy",
    name: "Tandy",
    fullName: "Vertner Woodson Tandy",
    years: "1885 - 1949",
    title: "Architectural Pioneer and Founding Jewel",
    description: "First African American registered architect in New York State and designer of notable Harlem landmarks.",
    price: 19.06,
    coinImage: tandyImg,
  },
];

interface JewelCarouselSectionProps {
  onAddToCart?: (jewel: Jewel, quantity: number) => void;
  onViewSet?: () => void;
}

export function JewelCarouselSection({ onAddToCart, onViewSet }: JewelCarouselSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const activeJewel = JEWELS[activeIndex];

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % JEWELS.length);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + JEWELS.length) % JEWELS.length);
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 99));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(activeJewel, quantity);
    }
  };

  const scrollToCarousel = () => {
    const element = document.getElementById("jewel-carousel");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section 
      className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12 bg-white"
      data-testid="section-jewel-carousel"
    >
      <div className="max-w-5xl mx-auto">
        {/* Hero Text Block */}
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <Badge 
            className="bg-primary/20 text-primary border-primary/40 px-3 sm:px-4 py-1 sm:py-1.5 text-xs uppercase tracking-wider"
            data-testid="badge-individual-pricing"
          >
            Individual Pricing
          </Badge>
          
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary tracking-tight px-2"
            data-testid="text-carousel-title"
          >
            Honor Your Favorite Jewel
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto px-2">
            Select and purchase individual 3-inch founder coins to celebrate the legacy of a specific Jewel.
          </p>

          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
              $19.06 <span className="text-xl sm:text-2xl md:text-3xl text-gray-600">Each</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Commemorating the founding year 1906
            </p>
          </div>

          <Button
            onClick={scrollToCarousel}
            size="lg"
            className="bg-primary text-black font-bold mt-2 sm:mt-4"
            data-testid="button-browse-jewels"
          >
            Browse Founder Jewels
          </Button>
        </div>

        {/* Side-by-Side Layout: Carousel Left, Details Right */}
        <div 
          id="jewel-carousel"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-8 sm:mt-12 items-start"
        >
          {/* LEFT: Carousel Container */}
          <div className="flex flex-col items-center gap-6 sm:gap-8 border-2 border-primary/60 rounded-2xl sm:rounded-3xl bg-transparent backdrop-blur px-4 sm:px-6 py-6 sm:py-8">
            {/* Carousel Navigation */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-12 w-full">
              {/* Left Arrow */}
              <Button
                variant="outline"
                size="icon"
                onClick={goPrev}
                className="rounded-full border-primary/40 shrink-0 min-h-11 min-w-11"
                aria-label="Previous jewel"
                data-testid="button-carousel-prev"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </Button>

              {/* Center Coin Display */}
              <div className="relative flex items-center justify-center">
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl -z-10" />
                
                {/* Coin Container */}
                <div 
                  className="relative h-40 w-40 xs:h-48 xs:w-48 sm:h-56 sm:w-56 lg:h-64 lg:w-64 rounded-full border-2 border-primary/60 bg-gradient-to-b from-primary/10 to-white flex items-center justify-center shadow-2xl overflow-hidden"
                  data-testid={`carousel-coin-${activeJewel.id}`}
                >
                  <img
                    src={activeJewel.coinImage}
                    alt={`${activeJewel.fullName} commemorative coin`}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              {/* Right Arrow */}
              <Button
                variant="outline"
                size="icon"
                onClick={goNext}
                className="rounded-full border-primary/40 shrink-0 min-h-11 min-w-11"
                aria-label="Next jewel"
                data-testid="button-carousel-next"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </Button>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 max-w-full px-2 sm:px-4 scrollbar-hide">
              {JEWELS.map((jewel, index) => (
                <button
                  key={jewel.id}
                  onClick={() => setActiveIndex(index)}
                  className={`h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full border-2 transition-all shrink-0 overflow-hidden ${
                    index === activeIndex
                      ? "border-primary ring-2 ring-primary/30 scale-110"
                      : "border-gray-300 hover:border-primary/50 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View ${jewel.name} coin`}
                  data-testid={`thumbnail-${jewel.id}`}
                >
                  <img
                    src={jewel.coinImage}
                    alt={jewel.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Detail & Add-to-Cart Panel */}
          <div className="w-full">
            <div 
              className="rounded-2xl sm:rounded-3xl border-2 border-primary/60 bg-transparent backdrop-blur px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-4 sm:gap-6"
              data-testid="card-jewel-detail"
            >
              {/* Name & Title */}
              <div className="text-center space-y-1 sm:space-y-2">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-primary">
                  {activeJewel.fullName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  {activeJewel.years}
                </p>
                <p className="text-sm sm:text-base text-gray-700">
                  {activeJewel.title}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm md:text-base text-gray-600 text-center leading-relaxed">
                {activeJewel.description}
              </p>

              {/* Price & Quantity */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                <div className="text-center sm:text-left">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Price per Coin
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    ${activeJewel.price.toFixed(2)}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex flex-col items-center gap-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">
                    Quantity
                  </label>
                  <div className="inline-flex items-center rounded-full border border-gray-300 bg-white">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="rounded-full min-h-11 min-w-11"
                      aria-label="Decrease quantity"
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span 
                      className="px-4 sm:px-6 text-base sm:text-lg font-semibold min-w-[2.5rem] sm:min-w-[3rem] text-center"
                      data-testid="text-quantity"
                    >
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={quantity >= 99}
                      className="rounded-full min-h-11 min-w-11"
                      aria-label="Increase quantity"
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full bg-primary text-black font-bold text-sm sm:text-base rounded-full"
                data-testid="button-add-coin-to-cart"
              >
                Add Coin to Cart
              </Button>

              {/* Microcopy */}
              <p className="text-xs text-gray-500 text-center">
                Ships in 5–7 days • Commemorative packaging included
              </p>
            </div>
          </div>
        </div>

        {/* Upsell Banner */}
        <div 
          className="mt-6 sm:mt-8 max-w-xl mx-auto rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-4"
          data-testid="banner-collect-all"
        >
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
              Collect All 7 Founder Coins
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Special set pricing available
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={onViewSet}
            className="shrink-0 text-primary font-semibold text-sm sm:text-base"
            data-testid="button-view-founder-set"
          >
            <span className="hidden sm:inline">View Founder Set</span>
            <span className="sm:hidden">View Set</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
