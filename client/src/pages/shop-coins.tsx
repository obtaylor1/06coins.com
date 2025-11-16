import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { MAIN_COIN, JEWEL_SET, JEWEL_COINS } from "@/lib/products";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { CartSummary } from "@/components/cart-summary";
import { StickyHeader } from "@/components/sticky-header";

export default function ShopCoins() {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantities, setQuantities] = useState<Record<string, number>>({
    [MAIN_COIN.id]: 1,
    [JEWEL_SET.id]: 1,
    ...Object.fromEntries(JEWEL_COINS.map((j) => [j.id, 1])),
  });

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StickyHeader onCtaClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16 lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
        <div>
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge className="mb-4 bg-primary text-black font-bold px-4 py-2">
              Official Collection
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
              Shop All <span className="text-primary">Commemorative Coins</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto mb-6">
              Own a piece of Alpha Phi Alpha history with our exclusive commemorative coin collection
            </p>
            <Button
              size="lg"
              onClick={handleBuildCompleteCollection}
              className="bg-primary text-black font-bold hover:bg-primary/90 text-base px-8"
              data-testid="button-complete-collection"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Build My Complete Collection
            </Button>
            <p className="text-sm text-foreground/60 mt-3">
              1× 120-Year Coin + 1× Jewel Set + All 7 Individual Jewels
            </p>
          </div>

          <div className="space-y-12 md:space-y-16">
            <Card className="overflow-hidden" data-testid="card-main-coin">
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="p-6 md:p-8 flex items-center justify-center bg-card/50">
                  <img
                    src={MAIN_COIN.image}
                    alt={MAIN_COIN.name}
                    className="w-full max-w-sm h-auto object-contain"
                    data-testid="img-main-coin"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center space-y-4">
                  <div>
                    <Badge className="mb-3 bg-primary/20 text-primary border border-primary/30">
                      4-Inch Diameter
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-2">
                      {MAIN_COIN.name}
                    </h2>
                    <p className="text-foreground/70 mb-4">{MAIN_COIN.description}</p>
                    <p className="text-3xl font-bold text-primary">
                      ${MAIN_COIN.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex items-center border border-primary/30 rounded-md">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateQuantity(MAIN_COIN.id, -1)}
                        data-testid="button-decrease-coin120year"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold" data-testid="text-quantity-coin120year">
                        {quantities[MAIN_COIN.id]}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateQuantity(MAIN_COIN.id, 1)}
                        data-testid="button-increase-coin120year"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      size="lg"
                      className="flex-1 bg-primary text-black font-bold hover:bg-primary/90"
                      onClick={() => handleAddToCart(MAIN_COIN)}
                      data-testid="button-add-cart-coin120year"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-2 border-primary/40" data-testid="card-jewel-set">
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="p-6 md:p-8 flex items-center justify-center bg-card/50">
                  <div className="grid grid-cols-3 gap-3 max-w-sm">
                    {JEWEL_COINS.slice(0, 7).map((jewel) => (
                      <img
                        key={jewel.id}
                        src={jewel.image}
                        alt={jewel.name}
                        className="w-full h-auto object-contain rounded-full"
                      />
                    ))}
                  </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center space-y-4">
                  <div>
                    <Badge className="mb-3 bg-primary text-black font-bold">
                      BEST VALUE - Save $13.36
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-2">
                      {JEWEL_SET.name}
                    </h2>
                    <p className="text-foreground/70 mb-2">{JEWEL_SET.description}</p>
                    <p className="text-sm text-primary font-semibold mb-4">
                      <Check className="w-4 h-4 inline mr-1" />
                      Save $13.36 compared to individual coins
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      ${JEWEL_SET.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex items-center border border-primary/30 rounded-md">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateQuantity(JEWEL_SET.id, -1)}
                        data-testid="button-decrease-jewelset7"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold" data-testid="text-quantity-jewelset7">
                        {quantities[JEWEL_SET.id]}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateQuantity(JEWEL_SET.id, 1)}
                        data-testid="button-increase-jewelset7"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      size="lg"
                      className="flex-1 bg-primary text-black font-bold hover:bg-primary/90"
                      onClick={() => handleAddToCart(JEWEL_SET)}
                      data-testid="button-add-cart-jewelset7"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <Badge className="mb-2 bg-primary/20 text-primary border border-primary/30">
                    3-Inch Diameter - $19.06 Each
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold">
                    Individual <span className="text-primary">Jewel Coins</span>
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-black font-bold"
                  onClick={handleAddAllJewels}
                  data-testid="button-add-all-jewels"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add All 7 Jewels
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {JEWEL_COINS.map((jewel) => (
                  <Card key={jewel.id} className="overflow-hidden hover-elevate" data-testid={`card-${jewel.id}`}>
                    <CardHeader className="p-4">
                      <div className="w-full aspect-square rounded-full overflow-hidden bg-card/50 mb-4">
                        <img
                          src={jewel.image}
                          alt={jewel.fullName}
                          className="w-full h-full object-cover"
                          data-testid={`img-${jewel.id}`}
                        />
                      </div>
                      <CardTitle className="text-xl font-serif">{jewel.fullName}</CardTitle>
                      <CardDescription className="text-sm">{jewel.years}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-foreground/70 mb-3 line-clamp-2">{jewel.description}</p>
                      <p className="text-2xl font-bold text-primary">${jewel.price.toFixed(2)}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex-col gap-3">
                      <div className="flex items-center justify-center w-full border border-primary/30 rounded-md">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(jewel.id, -1)}
                          data-testid={`button-decrease-${jewel.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-bold" data-testid={`text-quantity-${jewel.id}`}>
                          {quantities[jewel.id]}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(jewel.id, 1)}
                          data-testid={`button-increase-${jewel.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        className="w-full bg-primary text-black font-bold hover:bg-primary/90"
                        onClick={() => handleAddToCart(jewel)}
                        data-testid={`button-add-cart-${jewel.id}`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <CartSummary sticky />
        </div>
      </div>
      
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-primary/20 z-40">
        <CartSummary />
      </div>
    </div>
  );
}
