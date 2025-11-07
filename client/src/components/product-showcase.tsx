import { Card } from "@/components/ui/card";

export function ProductShowcase() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12 bg-card">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground tracking-monumental">
            Six Inches of History. Unmatched Quality.
          </h2>
          <p className="text-xl text-primary">
            Behold the weight of brotherhood. A premium collectible worthy of the Black and Gold.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Product Renders/Video */}
          <div className="lg:w-1/2 space-y-8">
            {/* Video placeholder */}
            <Card className="w-full p-8 aspect-video flex items-center justify-center border-2 border-primary">
              <p className="text-lg text-primary font-serif">VEO 3.1 COIN SHOWCASE VIDEO HERE</p>
            </Card>
            
            {/* Side-by-side renders */}
            <div className="flex gap-4">
              <Card className="w-1/2 p-4 flex items-center justify-center aspect-square">
                <p className="text-sm text-primary">FRONT SIDE RENDER</p>
              </Card>
              <Card className="w-1/2 p-4 flex items-center justify-center aspect-square">
                <p className="text-sm text-primary">BACK SIDE RENDER</p>
              </Card>
            </div>
          </div>

          {/* Detailed Symbolism */}
          <div className="lg:w-1/2 space-y-8 text-foreground">
            <div className="space-y-3">
              <h3 className="text-3xl font-serif text-primary tracking-monumental">
                The Scale and Significance
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4 text-foreground/90">
                <li>
                  <strong className="text-primary">6-Inch Diameter:</strong> Chosen to physically represent the founding year, 1906. Designed to be a substantial, commanding display piece.
                </li>
                <li>
                  <strong className="text-primary">Substantial Weight:</strong> Crafted from a premium zinc alloy with a rich Old Gold finish, symbolizing the gravity of our history.
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-3xl font-serif text-primary tracking-monumental">
                Obverse (Front) Details
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4 text-foreground/90">
                <li>
                  <strong className="text-primary">The Sphinx:</strong> The iconic cornerstone of our sacred bond, standing in high relief.
                </li>
                <li>
                  <strong className="text-primary">Global Reach:</strong> Stylized lines encircling the design recognize Alpha Phi Alpha's international expansion.
                </li>
                <li>
                  <strong className="text-primary">Dates:</strong> Clearly marked 1906 and 2026 frame the 120-year commemoration.
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-3xl font-serif text-primary tracking-monumental">
                Reverse (Back) Details
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4 text-foreground/90">
                <li>
                  <strong className="text-primary">The Seven Jewels:</strong> Seven distinct stars arranged in homage to our visionary founders.
                </li>
                <li>
                  <strong className="text-primary">The Motto:</strong> The complete mantra, "First of All, Servants of All..." elegantly inscribed along the perimeter.
                </li>
                <li>
                  <strong className="text-primary">Presentation:</strong> Arrives in a custom, velvet-lined display box with a numbered certificate of authenticity.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
