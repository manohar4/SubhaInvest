import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const [, navigate] = useLocation();

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white to-[#f8f2ed]">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md flex flex-col items-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-[#231e1b] mb-4">Success!</h2>
        <p className="text-[#6b5c3e] mb-6">
          Your investment process is successfully started. Our sales executive will assist you with the further process.
        </p>
        <Button
          onClick={handleGoToDashboard}
          className="bg-[#231e1b] hover:bg-[#524b47] text-white"
        >
          My Investments
        </Button>
      </div>
    </div>
  );
} 