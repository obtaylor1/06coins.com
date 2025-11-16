import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { Link } from "wouter";

interface CartSummaryProps {
  sticky?: boolean;
}

export function CartSummary({ sticky = false }: CartSummaryProps) {
  const { items, subtotal, total, updateQuantity, removeItem, emptyCart } = useCart();

  if (items.length === 0) {
    return (
      <Card className={sticky ? "lg:sticky lg:top-24" : ""} data-testid="card-cart-empty">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Your Cart</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
          <p className="text-foreground/70 mb-4">Your cart is empty</p>
          <Link href="/shop-coins">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black">
              Continue Shopping
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={sticky ? "lg:sticky lg:top-24" : ""} data-testid="card-cart-summary">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-serif">Your Cart ({items.length})</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={emptyCart}
          className="text-destructive hover:text-destructive"
          data-testid="button-empty-cart"
        >
          Clear All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 pb-4 border-b border-primary/20 last:border-0" data-testid={`cart-item-${item.id}`}>
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-md shrink-0"
              data-testid={`img-cart-${item.id}`}
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1 line-clamp-2" data-testid={`text-cart-name-${item.id}`}>
                {item.name}
              </h4>
              <p className="text-primary font-bold mb-2" data-testid={`text-cart-price-${item.id}`}>
                ${item.price.toFixed(2)}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-primary/30 rounded-md">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-7 w-7"
                    data-testid={`button-decrease-cart-${item.id}`}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-bold" data-testid={`text-cart-qty-${item.id}`}>
                    {item.quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-7 w-7"
                    data-testid={`button-increase-cart-${item.id}`}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeItem(item.id)}
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  data-testid={`button-remove-cart-${item.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold" data-testid={`text-cart-subtotal-${item.id}`}>
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex-col gap-4 pt-4">
        <div className="w-full space-y-2">
          <div className="flex justify-between text-base">
            <span className="text-foreground/70">Subtotal</span>
            <span className="font-semibold" data-testid="text-cart-subtotal-total">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary/20">
            <span>Total</span>
            <span className="text-primary" data-testid="text-cart-total">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
        <Link href="/checkout" className="w-full">
          <Button
            size="lg"
            className="w-full bg-primary text-black font-bold hover:bg-primary/90"
            data-testid="button-checkout"
          >
            Proceed to Checkout
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
