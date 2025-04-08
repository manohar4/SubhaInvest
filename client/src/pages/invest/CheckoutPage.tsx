import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

// Load Stripe outside of a component's render to avoid recreating the Stripe object on every render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm = ({ amount, onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/dashboard',
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentError(error.message || 'An error occurred with your payment');
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Thank you for your investment!",
        });
        onSuccess();
      }
    } catch (err: any) {
      setPaymentError(err.message || 'An error occurred with your payment');
      toast({
        title: "Payment Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-[#f8f2ed] rounded-lg mb-4">
        <h3 className="font-semibold text-[#231e1b] mb-2">Payment Amount</h3>
        <p className="text-2xl font-bold text-[#a3824a]">{formatCurrency(amount)}</p>
      </div>

      <div className="space-y-4">
        <PaymentElement />

        {paymentError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {paymentError}
          </div>
        )}

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            className="border-[#c7ab6e] text-[#a3824a]"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#231e1b] hover:bg-[#231e1b]/90 text-white"
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? "Processing..." : "Complete Payment"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get payment information from URL or sessionStorage
    const paymentData = sessionStorage.getItem('investmentPayment');
    
    if (paymentData) {
      try {
        const { amount } = JSON.parse(paymentData);
        setAmount(amount);
        
        // Create a PaymentIntent on the server
        apiRequest("POST", "/api/create-payment-intent", { amount })
          .then((res) => {
            if (!res.ok) {
              throw new Error("Failed to create payment intent");
            }
            return res.json();
          })
          .then((data) => {
            setClientSecret(data.clientSecret);
          })
          .catch((err) => {
            setError(err.message);
            toast({
              title: "Payment Setup Failed",
              description: "There was an error setting up the payment. Please try again.",
              variant: "destructive",
            });
          });
      } catch (err) {
        setError("Invalid payment data");
        toast({
          title: "Payment Setup Failed",
          description: "There was an error with the payment data. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setError("No payment information found");
      toast({
        title: "Payment Information Missing",
        description: "No payment information was found. Please start the investment process again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handlePaymentSuccess = () => {
    // Clear the stored payment data
    sessionStorage.removeItem('investmentPayment');
    // Navigate to success page or dashboard
    navigate('/dashboard');
  };

  const handleCancel = () => {
    // Return to the investment page
    navigate('/dashboard');
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopNav 
          title="Payment Failed" 
          showBack 
          backTo="/dashboard" 
        />
        
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 md:pb-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Payment Setup Failed</CardTitle>
              <CardDescription>
                There was an error setting up your payment. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{error}</p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-[#c7ab6e] hover:bg-[#a3824a] text-white"
              >
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </main>
        
        <BottomNav />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopNav 
          title="Processing Payment" 
          showBack 
          backTo="/dashboard" 
        />
        
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 md:pb-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-[#c7ab6e] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#6b5c3e]">Setting up your payment...</p>
          </div>
        </main>
        
        <BottomNav />
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#c7ab6e',
        colorBackground: '#ffffff',
        colorText: '#231e1b',
        colorDanger: '#df1b41',
        fontFamily: 'Raleway, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav 
        title="Complete Payment" 
        showBack 
        backTo="/dashboard" 
      />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 md:pb-6">
        <Card className="border-[#e3d4bb]">
          <CardHeader>
            <CardTitle className="text-[#231e1b]">Complete Your Investment</CardTitle>
            <CardDescription>
              Please provide your payment details to finalize your investment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm 
                amount={amount} 
                onSuccess={handlePaymentSuccess} 
                onCancel={handleCancel}
              />
            </Elements>
          </CardContent>
        </Card>
      </main>
      
      <BottomNav />
    </div>
  );
}