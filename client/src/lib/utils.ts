import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return new Date(dateString).toLocaleDateString('en-US', options);
}

export function calculateProjectedAmount(
  principal: number, 
  roi: number, 
  years: number
): number {
  // Simple interest calculation
  const interest = principal * (roi / 100) * years;
  return principal + interest;
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  if (phone.startsWith('+91')) return phone;
  return `+91 ${phone}`;
}

export function getInitials(name: string): string {
  if (!name) return '';
  
  const names = name.split(' ');
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}
