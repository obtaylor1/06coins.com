import { useEffect, useRef, useState } from "react";
import callisImg from "@assets/optimized-webp/Henry Arthur Callis_1763159941951.webp";
import chapmanImg from "@assets/optimized-webp/Charles Henry Chapman_1763159941952.webp";
import jonesImg from "@assets/optimized-webp/Eugene Kincle Jones_1763159941953.webp";
import kelleyImg from "@assets/optimized-webp/george biddle kelley_1763159941952.webp";
import murrayImg from "@assets/optimized-webp/Nathaniel Allison Murray_1763159941952.webp";
import ogleImg from "@assets/optimized-webp/Robert Harold Ogle_1763159941950.webp";
import tandyImg from "@assets/optimized-webp/Vertner Woodson Tandy_1763159941953.webp";
import legacyPosterImg from "@/assets/founders-legacy-poster.png";

interface FoundersLegacySectionProps {
  onCtaClick: () => void;
}

const founders = [
  { fullName: "Henry Arthur Callis", image: callisImg, left: "17%" },
  { fullName: "Charles Henry Chapman", image: chapmanImg, left: "28.2%" },
  { fullName: "Eugene Kinckle Jones", image: jonesImg, left: "38.8%" },
  { fullName: "George Biddle Kelley", image: kelleyImg, left: "49.4%" },
  { fullName: "Nathaniel Allison Murray", image: murrayImg, left: "60%" },
  { fullName: "Robert Harold Ogle", image: ogleImg, left: "70.4%" },
  { fullName: "Vertner Woodson Tandy", image: tandyImg, left: "80.9%" },
];

export function FoundersLegacySection({ onCtaClick }: FoundersLegacySectionProps) {
  const figureRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(figure);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="bg-[#f4f0e6] py-0"
      data-testid="section-founders-legacy"
      aria-label="The Seven Jewels of Alpha Phi Alpha Founders' Legacy Set"
    >
      <figure
        ref={figureRef}
        className={`founders-poster-reveal relative mx-auto w-full max-w-[1417px] overflow-visible ${isVisible ? "is-visible" : ""}`}
      >
        <img
          src={legacyPosterImg}
          alt="The Seven Jewels of Alpha Phi Alpha Founders' Legacy Set collector package, seven-coin presentation case, and founder portraits"
          className="block h-auto w-full"
          data-testid="img-founders-legacy-poster"
          loading="lazy"
          decoding="async"
        />
        <span className="founders-headline-shimmer" aria-hidden="true"/>

        <button
          type="button"
          onClick={onCtaClick}
          className="absolute left-[18.1%] top-[51.2%] z-20 h-[4.6%] w-[21.2%] cursor-pointer rounded-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#f4d47b]"
          aria-label="Claim your Jewel Set collector's package"
          data-testid="button-purchase-jewel-set"
        />

        {founders.map((founder) => (
          <button
            key={founder.fullName}
            type="button"
            className="group founder-coin-hotspot absolute top-[64.9%] z-20 aspect-square w-[8.5%] -translate-x-1/2 cursor-zoom-in rounded-full focus-visible:z-40 focus-visible:outline-none hover:z-40"
            style={{ left: founder.left }}
            aria-label={`Enlarge the ${founder.fullName} commemorative coin`}
          >
            <img
              src={founder.image}
              alt=""
              aria-hidden="true"
              className="founder-coin-enlargement absolute inset-0 h-full w-full rounded-full border border-[#d4ad55] object-cover opacity-0 shadow-[0_12px_35px_rgba(0,0,0,.65)] transition duration-300 ease-out group-hover:scale-[2.25] group-hover:opacity-100 group-focus-visible:scale-[2.25] group-focus-visible:opacity-100 motion-reduce:transition-none"
            />
            <span className="founder-coin-glint" aria-hidden="true"/>
          </button>
        ))}

        <figcaption className="sr-only">
          Purchase the 4-inch Limited-Edition Commemorative Coin with the Complete Seven Jewels
          Founders Set to receive 30% off the combined price.
        </figcaption>
      </figure>
    </section>
  );
}
