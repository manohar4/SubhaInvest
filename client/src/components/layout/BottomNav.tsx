import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, User } from "lucide-react";

export default function BottomNav() {
  const [location, navigate] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-[#f8f2ed] border-t border-[#e3d4bb] fixed bottom-0 left-0 right-0 z-30 md:hidden">
      <div className="grid grid-cols-2 h-16">
        <button 
          className={cn(
            "flex flex-col items-center justify-center", 
            isActive("/dashboard") ? "text-[#a3824a] font-medium" : "text-[#6b5c3e]"
          )}
          onClick={() => navigate("/dashboard")}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button 
          className={cn(
            "flex flex-col items-center justify-center", 
            isActive("/profile") ? "text-[#a3824a] font-medium" : "text-[#6b5c3e]"
          )}
          onClick={() => navigate("/profile")}
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
}
