import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { formatPhoneNumber } from "@/lib/utils";
import { User, Building2, LogOut, Phone } from "lucide-react";
import { Navigate } from "react-router-dom";

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserMenu({ isOpen, onClose }: UserMenuProps) {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute right-4 top-16 w-64 bg-[#f8f2ed] rounded-lg shadow-lg border border-[#e3d4bb] py-1 z-50 overflow-hidden"
    >
      <div className="px-4 py-4 border-b border-[#e3d4bb]">
        <p className="font-medium text-[#231e1b] text-base">{user?.name || "Subha User"}</p>
        <div className="flex items-center mt-1 text-[#6b5c3e]">
          <Phone className="h-3 w-3 mr-1" />
          <p className="text-sm">{user ? formatPhoneNumber(user.phoneNumber) : "+91 98765 43210"}</p>
        </div>
      </div>
      <ul className="py-1">
        <li>
          <button 
            onClick={() => handleNavigate("/profile")}
            className="flex items-center w-full text-left px-4 py-2.5 text-sm text-[#231e1b] hover:bg-[#f0e7dc]"
          >
            <User className="h-4 w-4 mr-3 text-[#a3824a]" />
            <span>My Profile</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => handleNavigate("/dashboard")}
            className="flex items-center w-full text-left px-4 py-2.5 text-sm text-[#231e1b] hover:bg-[#f0e7dc]"
          >
            <Building2 className="h-4 w-4 mr-3 text-[#a3824a]" />
            <span>My Investments</span>
          </button>
        </li>
        <li className="mt-1 pt-1 border-t border-[#e3d4bb]">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full text-left px-4 py-2.5 text-sm text-[#a3824a] font-medium hover:bg-[#f0e7dc]"
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
