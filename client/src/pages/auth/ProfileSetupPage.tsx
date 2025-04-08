import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// Import assets
import subhaLogo from "@/assets/subha-logo.svg";
import bgImage from "@/assets/subhaFarmsCover.jpg";

export default function ProfileSetupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { createProfile, phoneNumber, isLoading } = useAuth();
  const { toast } = useToast();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleCreateProfile = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation if provided
    if (email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address or leave it blank",
        variant: "destructive",
      });
      return;
    }

    try {
      await createProfile(name, email);
    } catch (error) {
      toast({
        title: "Profile creation failed",
        description: "There was an error creating your profile. Please try again.",
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

      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-5">
              <img src={subhaLogo} alt="Subha Logo" className="h-12" />
            </div>
            <h1 className="text-3xl font-bold text-white">Subha Invest</h1>
            <p className="text-[#e2d5be] mt-2">
              Almost there! Complete your profile to continue
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/95 shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-[#231e1b]">Create your profile</h2>

              <div className="space-y-4 mb-6">
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-sm font-medium text-[#6b5c3e] mb-1">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    id="fullName"
                    placeholder="John Doe"
                    value={name}
                    onChange={handleNameChange}
                    className="border-[#e3d4bb] focus:ring-[#c7ab6e] focus:border-[#c7ab6e]"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-[#6b5c3e] mb-1">
                    Email (Optional)
                  </label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    className="border-[#e3d4bb] focus:ring-[#c7ab6e] focus:border-[#c7ab6e]"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-[#231e1b] hover:bg-[#231e1b]/90 text-white"
                onClick={handleCreateProfile}
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? "Creating profile..." : "Complete Setup"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
