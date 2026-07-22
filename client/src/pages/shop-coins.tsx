import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight, Sparkles, Award, Package, Star } from "lucide-react";
import { MAIN_COIN, JEWEL_SET, JEWEL_COINS } from "@/lib/products";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { CartSummary } from "@/components/cart-summary";
import { StickyHeader } from "@/components/sticky-header";
import { Footer } from "@/components/footer";
import { SEO } from "@/components/seo";
import { getAbsoluteUrl } from "@/../../shared/seo-config";
import heroBackgroundImg from "@assets/optimized-webp/0_2_1763332961118.webp";
import goldTextureImg from "@assets/optimized-webp/0_0-8_1763355352629.webp";
import museumDisplayImg from "@assets/optimized-webp/0_1_1763355638824.webp";
import egyptianPortalImg from "@assets/optimized-webp/0_0-9_1763355883898.webp";
import hieroglyphicsImg from "@assets/optimized-webp/0_0-10_1763356084962.webp";

export default function ShopCoins() {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantities, setQuantities] = useState<Record<string, number>>({
    [MAIN_COIN.id]: 1,
    [JEWEL_SET.id]: 1,
    ...Object.fromEntries(JEWEL_COINS.map((j) => [j.id, 1])),
  });
  const [selectedJewelIndex, setSelectedJewelIndex] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, Math.min(99, prev[id] + delta)),
    }));
  };

  const handleAddToCart = (product: typeof MAIN_COIN | typeof JEWEL_SET | typeof JEWEL_COINS[0]) => {
    const qty = quantities[product.id];
    addItem(product, qty);
    toast({
      title: "Added to Cart",
      description: `${qty}x ${product.name} ($${(product.price * qty).toFixed(2)})`,
    });
  };

  const handleAddAllJewels = () => {
    JEWEL_COINS.forEach((jewel) => {
      addItem(jewel, 1);
    });
    toast({
      title: "All Jewel Coins Added",
      description: "7 individual Jewel coins added to cart",
    });
  };

  const handleBuildCompleteCollection = () => {
    addItem(MAIN_COIN, 1);
    addItem(JEWEL_SET, 1);
    JEWEL_COINS.forEach((jewel) => {
      addItem(jewel, 1);
    });
    
    const totalItems = 1 + 1 + JEWEL_COINS.length;
    const totalPrice = MAIN_COIN.price + JEWEL_SET.price + (JEWEL_COINS[0].price * JEWEL_COINS.length);
    
    toast({
      title: "Complete Collection Added!",
      description: `${totalItems} items added to cart ($${totalPrice.toFixed(2)})`,
      duration: 5000,
    });
  };

  const scrollToProducts = () => {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextJewel = () => {
    setSelectedJewelIndex((prev) => (prev + 1) % JEWEL_COINS.length);
  };

  const prevJewel = () => {
    setSelectedJewelIndex((prev) => (prev - 1 + JEWEL_COINS.length) % JEWEL_COINS.length);
  };

  const selectedJewel = JEWEL_COINS[selectedJewelIndex];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": getAbsoluteUrl("/")
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop Coins",
        "item": getAbsoluteUrl("/shop-coins")
      }
    ]
  };

  const mainCoinSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Alpha Phi Alpha 120th Anniversary Commemorative Coin - 4 Inch Diameter",
    "description": "Exclusive limited edition 4-inch diameter commemorative coin celebrating 120 years of Alpha Phi Alpha Fraternity (1906-2026). Only 1906 coins minted.",
    "brand": {
      "@type": "Brand",
      "name": "Alpha Phi Alpha"
    },
    "offers": {
      "@type": "Offer",
      "price": "39.06",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": getAbsoluteUrl("/shop-coins")
    },
    "sku": "APA-120-COIN-4IN"
  };

  const jewelSetSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Alpha Phi Alpha Seven Jewels Complete Collector's Set",
    "description": "Complete set of seven 3-inch commemorative coins honoring the Seven Jewels - founding members of Alpha Phi Alpha Fraternity. Limited edition collection.",
    "brand": {
      "@type": "Brand",
      "name": "Alpha Phi Alpha"
    },
    "offers": {
      "@type": "Offer",
      "price": "120.06",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": getAbsoluteUrl("/shop-coins")
    },
    "sku": "APA-JEWEL-SET-7"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050505] to-[#111111] text-foreground">
      <SEO
        title="Shop Alpha Phi Alpha Commemorative Coins - 120th Anniversary Collection"
        description="Shop exclusive Alpha Phi Alpha 120th Anniversary commemorative coins. Limited edition 4-inch coin (1906 units), Seven Jewels collector's set, and individual Jewel coins. Museum-quality collectibles."
        canonical={getAbsoluteUrl("/shop-coins")}
        keywords="Alpha Phi Alpha coins, Seven Jewels coins, 120th anniversary, commemorative coins, fraternity collectibles, APA memorabilia, limited edition"
        structuredData={[breadcrumbSchema, mainCoinSchema, jewelSetSchema]}
      />
      <StickyHeader onCtaClick={scrollToProducts} />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden border-b border-primary/20">
        {/* Background with luxurious gold coin image and dark overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroBackgroundImg} 
            alt="" 
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-16 sm:py-20">
          <Badge className="mb-6 bg-primary/20 text-primary border border-primary/40 px-6 py-2 text-sm font-serif">
            <Sparkles className="w-4 h-4 mr-2 inline" />
            Est. 1906 - Limited Edition Collection
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-medium text-white mb-6 tracking-tight leading-tight">
            120-Year <span className="text-primary">Commemorative</span>
            <br />
            Coin Collection
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Museum-quality craftsmanship honoring a century of brotherhood. Limited edition coins designed with precision you can feel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={scrollToProducts}
              size="lg"
              className="bg-primary text-black font-bold hover:bg-primary/90 px-8 py-6 text-lg"
              data-testid="button-shop-now"
            >
              Shop All Coins
            </Button>
            <Button
              onClick={scrollToProducts}
              variant="outline"
              size="lg"
              className="border-primary/40 text-primary hover:bg-primary/10 px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:grid lg:grid-cols-[1fr_400px] lg:gap-12">
        {/* Products Section */}
        <div id="products-section" className="space-y-16 lg:space-y-20">
          
          {/* SEO-Rich Introduction Section */}
          <section className="prose prose-invert max-w-none">
            <div className="bg-card/50 border border-primary/20 rounded-lg p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-6 text-center">
                Celebrate 120 Years of Alpha Phi Alpha Legacy
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-4 text-lg">
                <p>
                  The <strong>Alpha Phi Alpha 120th Anniversary Commemorative Coin Collection</strong> represents a historic milestone for the first intercollegiate Greek-letter fraternity established by African American men. Founded on December 4, 1906, at Cornell University, Alpha Phi Alpha Fraternity, Incorporated has been a beacon of excellence, leadership, and service for 120 years.
                </p>
                <p>
                  Our <strong>exclusive limited edition commemorative coins</strong> honor this momentous occasion with museum-quality craftsmanship. Each coin in this collection is meticulously designed to celebrate the brotherhood's enduring legacy and the Seven Jewels who founded this historic organization.
                </p>
                <p>
                  The collection features three distinct offerings: the majestic <strong>4-inch diameter 120th Anniversary Commemorative Coin</strong> (limited to only 1906 units), the comprehensive <strong>Seven Jewels Complete Collector's Set</strong> honoring all seven founding members, and <strong>individual 3-inch Jewel coins</strong> allowing you to honor your favorite founder. Whether you're an Alpha man, a collector of fraternity memorabilia, or a supporter of African American history, these coins represent an unparalleled investment in heritage.
                </p>
                <p>
                  Each coin features intricate details, premium finishes, and symbolic elements that pay tribute to Alpha Phi Alpha's motto: "First of All, Servants of All, We Shall Transcend All." With only 1906 units of the centerpiece coin available - one for each year of the fraternity's history - this is a once-in-a-lifetime opportunity to own a piece of African American Greek-letter organization history.
                </p>
              </div>
            </div>
          </section>

          {/* Product 1: 120-Year 4" Coin */}
          <section className="scroll-mt-24">
            <div className="text-center mb-8">
              <div className="inline-block">
                <div className="h-px w-12 bg-primary/60 mx-auto mb-4" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-white mb-2">
                  The Centerpiece
                </h2>
                <div className="h-px w-12 bg-primary/60 mx-auto mt-4" />
              </div>
            </div>

            <Card className="overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card/95 to-card/80 shadow-2xl" data-testid="card-main-coin">
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-primary text-black font-bold px-4 py-2 text-sm">
                  <Award className="w-4 h-4 mr-2 inline" />
                  Museum Quality
                </Badge>
              </div>

              <div 
                className="grid md:grid-cols-2 gap-8 p-8 md:p-12 relative"
                style={{
                  backgroundImage: `linear-gradient(rgba(18, 18, 18, 0.85), rgba(18, 18, 18, 0.85)), url(${goldTextureImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Coin image */}
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <img
                      src={MAIN_COIN.image}
                      alt="Alpha Phi Alpha 120th Anniversary 4-inch commemorative coin - limited edition 1906 units"
                      className="relative w-full max-w-md h-auto object-contain drop-shadow-2xl"
                      loading="lazy"
                      decoding="async"
                      width="400"
                      height="400"
                      data-testid="img-main-coin"
                    />
                  </div>
                </div>

                {/* Product details */}
                <div className="flex flex-col justify-center space-y-6">
                  <div>
                    <Badge className="mb-4 bg-primary/10 text-primary border border-primary/30 text-xs px-3 py-1">
                      4-INCH DIAMETER
                    </Badge>
                    <h3 className="text-3xl sm:text-4xl font-serif font-medium text-white mb-4">
                      {MAIN_COIN.name}
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      {MAIN_COIN.description}
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-primary">${MAIN_COIN.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-400">Collector's centerpiece for the 120th Anniversary</span>
                    </div>
                  </div>

                  {/* Quantity and add to cart */}
                  <div className="space-y-4 pt-4 border-t border-primary/20">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-semibold text-gray-300">Quantity:</label>
                      <div className="flex items-center border-2 border-primary/30 rounded-lg overflow-hidden bg-background/50">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(MAIN_COIN.id, -1)}
                          className="hover:bg-primary/20 rounded-none border-r border-primary/30"
                          data-testid={`button-decrease-${MAIN_COIN.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="px-6 py-2 font-bold text-lg min-w-[60px] text-center">
                          {quantities[MAIN_COIN.id]}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(MAIN_COIN.id, 1)}
                          className="hover:bg-primary/20 rounded-none border-l border-primary/30"
                          data-testid={`button-increase-${MAIN_COIN.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(MAIN_COIN)}
                      className="w-full bg-primary text-black font-bold hover:bg-primary/90 py-6 text-lg"
                      data-testid={`button-add-cart-${MAIN_COIN.id}`}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Product 2: Jewel Set */}
          <section>
            <div className="text-center mb-8">
              <div className="inline-block">
                <div className="h-px w-12 bg-primary/60 mx-auto mb-4" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-white mb-2">
                  Best Collector Value
                </h2>
                <div className="h-px w-12 bg-primary/60 mx-auto mt-4" />
              </div>
            </div>

            <Card className="overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card/95 to-card/80 shadow-2xl" data-testid="card-jewel-set">
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-destructive text-white font-bold px-4 py-2 text-sm">
                  <Star className="w-4 h-4 mr-2 inline fill-white" />
                  Save $13.36
                </Badge>
              </div>

              <div 
                className="p-8 md:p-12 relative"
                style={{
                  backgroundImage: `linear-gradient(rgba(18, 18, 18, 0.88), rgba(18, 18, 18, 0.88)), url(${museumDisplayImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="grid md:grid-cols-[1fr_400px] gap-8">
                  {/* Coin grid */}
                  <div>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {JEWEL_COINS.slice(0, 7).map((jewel, idx) => (
                        <div key={jewel.id} className="aspect-square rounded-lg overflow-hidden border border-primary/20 bg-background/50">
                          <img
                            src={jewel.image}
                            alt={`Alpha Phi Alpha Seven Jewels ${jewel.name} commemorative coin - 3 inch diameter`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            width="100"
                            height="100"
                          />
                        </div>
                      ))}
                      <div className="aspect-square rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center">
                        <Package className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-400 bg-background/50 p-4 rounded-lg border border-primary/20">
                      <p><strong className="text-primary">Individual price:</strong> 7 × $19.06 = $133.42</p>
                      <p className="text-lg text-white mt-1"><strong>Complete Set:</strong> $120.06 (Save $13.36)</p>
                    </div>
                  </div>

                  {/* Product details */}
                  <div className="flex flex-col justify-center space-y-6">
                    <div>
                      <Badge className="mb-4 bg-primary/10 text-primary border border-primary/30 text-xs px-3 py-1">
                        7 COINS • 3-INCH EACH
                      </Badge>
                      <h3 className="text-3xl font-serif font-medium text-white mb-4">
                        {JEWEL_SET.name}
                      </h3>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        {JEWEL_SET.description}
                      </p>
                      <div className="text-5xl font-bold text-primary mb-2">
                        ${JEWEL_SET.price.toFixed(2)}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-primary/20">
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-semibold text-gray-300">Quantity:</label>
                        <div className="flex items-center border-2 border-primary/30 rounded-lg overflow-hidden bg-background/50">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(JEWEL_SET.id, -1)}
                            className="hover:bg-primary/20 rounded-none border-r border-primary/30"
                            data-testid={`button-decrease-${JEWEL_SET.id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <div className="px-6 py-2 font-bold text-lg min-w-[60px] text-center">
                            {quantities[JEWEL_SET.id]}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(JEWEL_SET.id, 1)}
                            className="hover:bg-primary/20 rounded-none border-l border-primary/30"
                            data-testid={`button-increase-${JEWEL_SET.id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleAddToCart(JEWEL_SET)}
                        className="w-full bg-primary text-black font-bold hover:bg-primary/90 py-6 text-lg"
                        data-testid={`button-add-cart-${JEWEL_SET.id}`}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add Complete Set to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Product 3: Individual Jewel Coins (Carousel) */}
          <section>
            <div className="text-center mb-8">
              <div className="inline-block">
                <div className="h-px w-12 bg-primary/60 mx-auto mb-4" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-white mb-2">
                  Individual Jewel Coins
                </h2>
                <p className="text-gray-400 mt-2">3-inch diameter • $19.06 each</p>
                <div className="h-px w-12 bg-primary/60 mx-auto mt-4" />
              </div>
            </div>

            <Card className="overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card/95 to-card/80 shadow-2xl">
              {/* Carousel */}
              <div 
                className="relative p-8 md:p-12"
                style={{
                  backgroundImage: `linear-gradient(rgba(18, 18, 18, 0.85), rgba(18, 18, 18, 0.85)), url(${hieroglyphicsImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Main coin display */}
                <div className="flex items-center justify-center gap-8 mb-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevJewel}
                    className="border-primary/40 text-primary hover:bg-primary/10 h-12 w-12"
                    data-testid="button-prev-jewel"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>

                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                      <img
                        src={selectedJewel.image}
                        alt={`Alpha Phi Alpha Seven Jewels ${selectedJewel.name} commemorative coin - 3 inch diameter limited edition`}
                        className="relative w-full h-auto object-contain drop-shadow-2xl transition-all duration-300"
                        loading="lazy"
                        decoding="async"
                        width="400"
                        height="400"
                        data-testid="img-selected-jewel"
                      />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextJewel}
                    className="border-primary/40 text-primary hover:bg-primary/10 h-12 w-12"
                    data-testid="button-next-jewel"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>

                {/* Thumbnail navigation */}
                <div className="grid grid-cols-7 gap-2 mb-8">
                  {JEWEL_COINS.map((jewel, idx) => (
                    <button
                      key={jewel.id}
                      onClick={() => setSelectedJewelIndex(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        idx === selectedJewelIndex
                          ? 'border-primary scale-105 shadow-lg shadow-primary/30'
                          : 'border-primary/20 hover:border-primary/40'
                      }`}
                      data-testid={`thumb-jewel-${idx}`}
                    >
                      <img
                        src={jewel.image}
                        alt={`Alpha Phi Alpha ${jewel.name} Jewel coin thumbnail`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width="80"
                        height="80"
                      />
                    </button>
                  ))}
                </div>

                {/* Product details */}
                <div className="text-center space-y-6 max-w-2xl mx-auto">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-medium text-white mb-3">
                      {selectedJewel.name}
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      {selectedJewel.description}
                    </p>
                    <div className="text-4xl font-bold text-primary">
                      ${selectedJewel.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-primary/20">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-semibold text-gray-300">Quantity:</label>
                      <div className="flex items-center border-2 border-primary/30 rounded-lg overflow-hidden bg-background/50">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(selectedJewel.id, -1)}
                          className="hover:bg-primary/20 rounded-none border-r border-primary/30"
                          data-testid={`button-decrease-${selectedJewel.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="px-6 py-2 font-bold text-lg min-w-[60px] text-center">
                          {quantities[selectedJewel.id]}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(selectedJewel.id, 1)}
                          className="hover:bg-primary/20 rounded-none border-l border-primary/30"
                          data-testid={`button-increase-${selectedJewel.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(selectedJewel)}
                      className="bg-primary text-black font-bold hover:bg-primary/90 px-8 py-6 text-lg"
                      data-testid={`button-add-cart-${selectedJewel.id}`}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add Coin to Cart
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add all seven button */}
              <div className="mt-8 pt-8 border-t-2 border-primary/20 text-center">
                <p className="text-gray-400 mb-4">Collect all seven Jewel coins at once</p>
                <Button
                  onClick={handleAddAllJewels}
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10 px-8 py-6 text-lg"
                  data-testid="button-add-all-jewels"
                >
                  Add All Seven Jewel Coins
                </Button>
              </div>
            </Card>
          </section>

          {/* Build Complete Collection CTA */}
          <section className="relative">
            <Card className="overflow-hidden border-2 border-primary bg-gradient-to-br from-primary/20 to-primary/10 shadow-2xl">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary" />

              <div 
                className="p-8 md:p-16 text-center space-y-6 relative z-10"
                style={{
                  backgroundImage: `linear-gradient(rgba(18, 18, 18, 0.75), rgba(18, 18, 18, 0.75)), url(${egyptianPortalImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <Badge className="bg-primary text-black font-bold px-6 py-2 text-sm">
                  <Sparkles className="w-4 h-4 mr-2 inline" />
                  Ultimate Collector's Package
                </Badge>

                <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium text-white">
                  Build My Complete Collection
                </h2>

                <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Own every piece of the legacy. The ultimate tribute to the Brotherhood.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm text-gray-400">
                  <span>1× 120-Year 4" Coin</span>
                  <span className="hidden sm:inline">•</span>
                  <span>1× Complete Jewel Set (7 coins)</span>
                  <span className="hidden sm:inline">•</span>
                  <span>7× Individual Jewel Coins</span>
                </div>

                <Button
                  onClick={handleBuildCompleteCollection}
                  size="lg"
                  className="bg-primary text-black font-bold hover:bg-primary/90 px-12 py-8 text-xl mt-4"
                  data-testid="button-build-collection"
                >
                  <ShoppingCart className="w-6 h-6 mr-3" />
                  Add Complete Collection to Cart
                </Button>
              </div>
            </Card>
          </section>
        </div>

        {/* Sticky Cart Summary */}
        <div className="mt-12 lg:mt-0 lg:sticky lg:top-24 lg:self-start">
          <CartSummary />
        </div>
      </div>

      {/* Contact CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-16">
        <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          
          <div className="relative p-8 md:p-12 text-center space-y-6">
            <div className="inline-block px-4 py-2 bg-primary/20 border border-primary/40 rounded-md">
              <p className="text-primary text-sm font-semibold uppercase tracking-wider">
                Questions? We're Here to Help
              </p>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Need Help or Bulk Order Support?
            </h2>

            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              If you have questions about the 120-Year Anniversary Coin, the Seven Jewels set, 
              shipping details, or bulk chapter orders, reach out and we'll assist you personally.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 text-lg"
                  data-testid="button-contact-cta"
                >
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Typical response time: 24-48 hours</span>
              </div>
            </div>
          </div>
        </Card>
      </section>
      
      <Footer />
    </div>
  );
}
