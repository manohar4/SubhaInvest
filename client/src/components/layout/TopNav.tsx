import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import UserMenu from "./UserMenu";
import { getInitials } from "@/lib/utils";
import subhaLogo from "../../assets/subha-logo.png";

interface TopNavProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  right?: React.ReactNode;
}

export default function TopNav({
  title,
  showBack = false,
  backTo = "",
  right,
}: TopNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      window.history.back();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-[#231e1b] border-b border-[#e3d4bb] p-4 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 rounded-full text-[#a3824a]"
              onClick={handleBack}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          <div className="flex items-center">
            <img src={subhaLogo} alt="Subha Logo" className="h-10 mr-3" />
            
          </div>
          
        </div>
        <h1 className="text-xl font-bold text-white">Grow With Us</h1>
        <div className="flex items-center gap-3">
          {right}
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full p-2"
            onClick={toggleMenu}
          >
            <div className="w-8 h-8 rounded-full bg-[#c7ab6e] flex items-center justify-center text-white font-medium">
              {user ? getInitials(user.name) : "SU"}
            </div>
          </Button>
        </div>

        <UserMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </div>
    </header>
  );
}
