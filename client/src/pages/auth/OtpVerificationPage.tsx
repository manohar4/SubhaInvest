import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Import assets
import subhaLogo from "@/assets/subha-logo.svg";
import bgImage from "@/assets/subhaFarmsCover.jpg";

export default function OtpVerificationPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyOtp, phoneNumber, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!phoneNumber) {
      navigate("/login");
      return;
    }
    
    // Focus on the first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [phoneNumber, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input if current input is filled
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (pastedData.length <= 6 && /^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus on the appropriate input after pasting
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a complete 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await verifyOtp(otpString);
      if (!success) {
        toast({
          title: "Verification failed",
          description: "The OTP you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "There was an error verifying your OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (response.ok) {
        toast({
          title: "OTP resent",
          description: "A new OTP has been sent to your phone.",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Failed to resend OTP",
          description: data.error || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to resend OTP",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-5">
              <img src={subhaLogo} alt="Subha Logo" className="h-12" />
            </div>
            <h1 className="text-3xl font-bold text-white">Subha Invest</h1>
            <p className="text-[#e2d5be] mt-2">
              Verify your phone to continue
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/95 shadow-xl">
            <CardContent className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="otp" className="block text-sm font-medium text-[#6b5c3e]">
                    Verification Code
                  </label>
                  <button 
                    type="button" 
                    className="text-xs text-[#a3824a] hover:text-[#c7ab6e]"
                    onClick={handleResendOtp}
                  >
                    Resend
                  </button>
                </div>

                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      type="text"
                      className="w-12 h-12 text-center border-[#e3d4bb] focus:ring-[#c7ab6e] focus:border-[#c7ab6e]"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      ref={(el) => (inputRefs.current[index] = el)}
                    />
                  ))}
                </div>

                <p className="text-xs text-[#6b5c3e] mt-2">
                  OTP sent to: <span className="font-medium">{phoneNumber}</span>
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full bg-[#231e1b] hover:bg-[#231e1b]/90 text-white" 
                  onClick={handleVerify}
                  disabled={isLoading || otp.some(digit => !digit)}
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-[#e3d4bb] text-[#a3824a] hover:bg-[#f8f4ed] hover:text-[#6b5c3e]"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
