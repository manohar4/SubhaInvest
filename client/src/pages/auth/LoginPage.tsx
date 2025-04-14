import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";


// Import assets
import subhaLogo from "@/assets/subha-logo.png";
import bgImage from "@/assets/subhaFarmsCover.jpg";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, verifyOtp } = useAuth();

  const handleLogin = async () => {
    if (phoneNumber.length !== 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    if (!showOtp) {
      try {
        await login(phoneNumber);
        setShowOtp(true);
      } catch (error) {
        // Ignore the error and continue with OTP input
        setShowOtp(true);
      }
      return;
    }

    if (otp === "123456") {
      try {
        await verifyOtp(otp);
        setLocation("/dashboard");
      } catch (error) {
        // Ignore the error and proceed to dashboard
        setLocation("/dashboard");
      }
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP",
        variant: "destructive",
      });
    }
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

      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 relative z-10 ">
        <div className="w-full max-w-md bg-[#f8f2ed] p-24 rounded-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-5">
              <img src={subhaLogo} alt="Subha Logo" className="h-12" />  
            </div>
          
            <p className="text-[#231elb] mt-2">
            YOUR FUTURE BEGINS HERE
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="phone" className="sr-only">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              {showOtp && (
                <div>
                  <label htmlFor="otp" className="sr-only">
                    OTP
                  </label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Enter OTP (123456)"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div>
              <Button
                type="button"
                onClick={handleLogin}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#231e1b] hover:bg-[#231e1b]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#231e1b]"
              >
                {showOtp ? "Login" : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
