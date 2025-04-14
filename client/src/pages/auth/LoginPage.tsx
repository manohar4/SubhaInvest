import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestoreDb } from "../../firebaseConfig.js";

// Import assets
import subhaLogo from "@/assets/subha-logo.png";
import bgImage from "@/assets/subhaFarmsCover.jpg";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, updateUserState } = useAuth();

  // New states for enhanced functionality
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recaptchaVerifierRef = useRef<any>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Add redirect effect for authenticated users
  useEffect(() => {
    if (!loading && user && !isNewUser) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  const startOtpTimer = () => {
    setOtpTimer(30);
    timerRef.current = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const initializeRecaptcha = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
          "expired-callback": () => {
            recaptchaVerifierRef.current?.clear();
            recaptchaVerifierRef.current = null;
          },
        }
      );
      recaptchaVerifierRef.current.render();
    }
  };

  const handleLogin = async () => {
    if (phoneNumber.length !== 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    if (!showOtp) {
      try {
        initializeRecaptcha();
        const fullPhoneNumber = `+91${phoneNumber}`;
        const confirmation = await signInWithPhoneNumber(
          auth,
          fullPhoneNumber,
          recaptchaVerifierRef.current
        );
        setConfirmationResult(confirmation);
        setShowOtp(true);
        startOtpTimer();
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the OTP",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to send OTP",
          variant: "destructive",
        });
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const userCredential = await confirmationResult.confirm(otp);

      // Check if user exists in Firestore
      const userDoc = doc(firestoreDb, "users", userCredential.user.uid);
      const userSnapshot = await getDoc(userDoc);

      if (!userSnapshot.exists()) {
        setIsNewUser(true);
      } else {
        const userData = userSnapshot.data();
        setLocation(
          userData.role === "admin" ? "/admin-dashboard" : "/dashboard"
        );
      }
    } catch (error) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    try {
      await setDoc(doc(firestoreDb, "users", auth.currentUser!.uid), {
        name,
        email,
        phone: phoneNumber,
        role: "customer",
        investments: [],
      });

      await updateUserState();
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setShowOtp(false);
    setOtp("");
    if (timerRef.current) clearInterval(timerRef.current);
    setOtpTimer(0);
  };

  if (isNewUser) {
    return (
      <div className="flex flex-col min-h-screen relative">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 relative z-10">
          <div className="w-full max-w-md bg-[#f8f2ed] p-24 rounded-md">
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-5">
                <img src={subhaLogo} alt="Subha Logo" className="h-12" />
                <h1 className="text-3xl font-bold text-[#a3824a] self-end">
                  Invest
                </h1>
              </div>
              <p className="text-[#231elb] mt-2">COMPLETE YOUR PROFILE</p>
            </div>

            <div className="mt-8 space-y-6">
              <div className="rounded-md shadow-sm -space-y-px">
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mb-4"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-4"
                  required
                />
              </div>

              <Button
                type="button"
                onClick={handleCompleteProfile}
                className="w-full bg-[#231e1b] hover:bg-[#231e1b]/90"
                disabled={loading}
              >
                Complete Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex flex-col min-h-screen relative">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-md bg-[#f8f2ed] p-24 rounded-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-5">
              <img src={subhaLogo} alt="Subha Logo" className="h-12" />
              <h1 className="text-3xl font-bold text-[#a3824a] self-end">
                Invest
              </h1>
            </div>
            <p className="text-[#231elb] mt-2">YOUR FUTURE BEGINS HERE</p>
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
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) setPhoneNumber(value);
                  }}
                  disabled={loading}
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
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 6) setOtp(value);
                    }}
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            <div id="recaptcha-container" />

            <div className="space-y-3">
              <Button
                type="button"
                onClick={handleLogin}
                className="w-full bg-[#231e1b] hover:bg-[#231e1b]/90"
                disabled={loading || (showOtp && otp.length !== 6)}
              >
                {loading
                  ? "Please wait..."
                  : showOtp
                  ? "Verify OTP"
                  : "Continue"}
              </Button>

              {showOtp && (
                <Button
                  type="button"
                  onClick={handleReset}
                  className="w-full bg-transparent text-[#231e1b] border border-[#231e1b] hover:bg-[#231e1b]/10"
                  disabled={loading || otpTimer > 0}
                >
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
