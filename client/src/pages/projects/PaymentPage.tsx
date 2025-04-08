import { useState } from "react";
import { useInvestment } from "@/context/InvestmentContext";
import { formatCurrency } from "@/lib/utils";
import TopNav from "@/components/layout/TopNav";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PAYMENT_METHODS = [
  { id: "upi", name: "UPI", isSelected: true },
  { id: "card", name: "Credit/Debit Card", isSelected: false },
  { id: "netbanking", name: "Net Banking", isSelected: false },
];

export default function PaymentPage() {
  const { selectedProject, selectedModel, totalAmount, selectedSlots, createInvestment, isLoading } = useInvestment();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi");

  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value);
  };

  const handlePayment = async () => {
    await createInvestment();
  };

  if (!selectedProject || !selectedModel) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav 
        title="Payment" 
        showBack 
        backTo={`/projects/${selectedProject.id}/model/${selectedModel.id}`} 
      />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 md:pb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Complete Your Payment</h2>
          <p className="text-neutral-500">Invest in your future with secure payment</p>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Payment Summary</h3>
            
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center">
                <p className="text-neutral-600">Project</p>
                <p className="font-medium">{selectedProject.name}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-neutral-600">Investment Model</p>
                <div className="flex items-center">
                  <span className="font-medium mr-1">{selectedModel.name}</span>
                  <Badge variant="secondary" className="text-white">
                    {selectedModel.roi}% p.a.
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                <p className="text-neutral-600">Slots</p>
                <p className="font-medium">{selectedSlots} × {formatCurrency(selectedModel.minInvestment)}</p>
              </div>
              
              <div className="flex justify-between items-center pt-1">
                <p className="font-semibold text-lg">Total Amount</p>
                <p className="font-bold text-lg">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Payment Method</h3>
            
            <RadioGroup 
              value={selectedPaymentMethod} 
              onValueChange={handlePaymentMethodChange}
              className="space-y-3"
            >
              {PAYMENT_METHODS.map((method) => (
                <div 
                  key={method.id}
                  className={`flex items-center p-3 border rounded-md ${
                    selectedPaymentMethod === method.id 
                      ? 'border-primary-200 bg-primary-50' 
                      : 'border-neutral-200'
                  }`}
                >
                  <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                  <Label 
                    htmlFor={`payment-${method.id}`} 
                    className="ml-3 flex flex-1 items-center justify-between"
                  >
                    <span className="font-medium">{method.name}</span>
                    <div className="flex space-x-1">
                      <div className="w-8 h-6 bg-neutral-200 rounded"></div>
                      {method.id !== "netbanking" && (
                        <div className="w-8 h-6 bg-neutral-200 rounded"></div>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
        
        <Button 
          className="w-full py-3"
          onClick={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : `Pay ${formatCurrency(totalAmount)}`}
        </Button>
        
        <p className="text-center text-sm text-neutral-500 mt-4">
          By completing this payment, you agree to our 
          <Button variant="link" className="px-1 py-0 h-auto">Terms of Service</Button> 
          and 
          <Button variant="link" className="px-1 py-0 h-auto">Privacy Policy</Button>
        </p>
      </main>
    </div>
  );
}
