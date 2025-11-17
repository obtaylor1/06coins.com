// Stripe checkout page - Reference: javascript_stripe blueprint
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackPurchase } from "@/lib/analytics";

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface CheckoutFormProps {
  quantity: number;
  totalAmount: number;
  useCartData: boolean;
}

function CheckoutForm({ quantity, totalAmount, useCartData }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, emptyCart } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Payment succeeded! Now decrement inventory (order is created server-side)
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        try {
          // Decrement inventory (with payment verification + order creation)
          const orderPayload = useCartData ? {
            paymentIntentId: paymentIntent.id,
            cartItems: items.map(item => ({
              id: item.id,
              quantity: item.quantity,
            })),
          } : {
            quantity,
            paymentIntentId: paymentIntent.id
          };

          // Submit order FIRST before clearing cart
          await apiRequest("POST", "/api/inventory/decrement", orderPayload);

          const itemCount = useCartData ? items.reduce((sum, item) => sum + item.quantity, 0) : quantity;
          
          // Track purchase in Google Analytics
          const purchaseItems = useCartData 
            ? items.map(item => ({
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity,
              }))
            : [{
                item_id: "main-coin",
                item_name: "Alpha Phi Alpha 120th Anniversary Commemorative Coin",
                price: totalAmount / quantity,
                quantity: quantity,
              }];
          
          trackPurchase(
            paymentIntent.id,
            totalAmount / 100, // Convert from cents to dollars
            purchaseItems
          );
          
          toast({
            title: "Payment Successful!",
            description: `Thank you for your purchase! Your order for ${itemCount} coin(s) has been confirmed.`,
          });

          // Clear cart ONLY AFTER order submission succeeds
          if (useCartData) {
            emptyCart();
          }

          // Redirect to home after success
          setTimeout(() => setLocation('/'), 2000);
        } catch (orderError: any) {
          console.error('Order processing error:', orderError);
          toast({
            title: "Order Processing Issue",
            description: "Payment succeeded but there was an issue recording your order. Please contact support.",
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        {useCartData ? (
          <>
            <h3 className="font-semibold text-foreground mb-2">Order Summary:</h3>
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-foreground/80 pb-2 border-b border-primary/10">
                <span>{item.name} × {item.quantity}</span>
                <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="flex justify-between text-foreground/80">
              <span>Quantity:</span>
              <span className="font-bold">{quantity}</span>
            </div>
            <div className="flex justify-between text-foreground/80">
              <span>Price per coin:</span>
              <span className="font-bold">$50.06</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-xl font-bold text-primary border-t border-primary/30 pt-2">
          <span>Total:</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <PaymentElement />
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full text-xl font-bold py-6"
        data-testid="button-submit-payment"
      >
        {isProcessing ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
      </Button>

      <p className="text-sm text-center text-foreground/70">
        Your payment is secured by Stripe. All transactions are encrypted.
      </p>
    </form>
  );
}

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { items, total } = useCart();

  // Determine if using cart data or query parameters
  const useCartData = items.length > 0;
  
  // Fallback to query params if cart is empty
  const params = new URLSearchParams(window.location.search);
  const queryQuantity = parseInt(params.get('quantity') || '1');
  
  const quantity = useCartData ? items.reduce((sum, item) => sum + item.quantity, 0) : queryQuantity;
  const totalAmount = useCartData ? total : (queryQuantity * 50.06);

  useEffect(() => {
    // Set dark mode
    document.documentElement.classList.add("dark");

    if (!stripePromise) {
      toast({
        title: "Payment Unavailable",
        description: "Stripe is not configured. Please contact support.",
        variant: "destructive",
      });
      setTimeout(() => setLocation('/'), 3000);
      return;
    }

    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const payload = useCartData ? {
          cartItems: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        } : {
          quantity: queryQuantity // Amount is calculated server-side for security
        };

        const response = await apiRequest("POST", "/api/create-payment-intent", payload);
        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No client secret returned');
        }
      } catch (error: any) {
        toast({
          title: "Checkout Error",
          description: error.message || "Failed to initialize checkout",
          variant: "destructive",
        });
        setTimeout(() => setLocation('/'), 3000);
      }
    };

    createPaymentIntent();
  }, [quantity, totalAmount, setLocation, toast, useCartData, items, queryQuantity]);

  if (!clientSecret || !stripePromise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-foreground/80">Preparing secure checkout...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-monumental">
            Secure Checkout
          </h1>
          <p className="text-foreground/80">
            Complete your purchase of the APA 120th Anniversary Commemorative Coin
          </p>
        </div>

        <Card className="p-8 space-y-6">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm quantity={quantity} totalAmount={totalAmount} useCartData={useCartData} />
          </Elements>
        </Card>

        <div className="text-center">
          <button
            onClick={() => setLocation('/')}
            className="text-primary hover:text-primary/80 underline"
            data-testid="link-back-home"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
