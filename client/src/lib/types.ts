// User types
export interface User {
  id: number;
  phoneNumber: string;
  name: string;
  createdAt: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  location: string;
  minimumInvestment: number;
  estimatedReturns: number;
  lockInPeriod: number;
  availableSlots: number;
  image: string;
}

// Investment model types
export interface InvestmentModel {
  id: string;
  name: string;
  minInvestment: number;
  maxInvestment: number;
  roi: number;
  lockInPeriod: number;
  availableSlots: number;
  projectId: string;
  paymentPlan?: string; 
}

// Investment types
export interface Investment {
  id: number;
  userId: number;
  projectId: string;
  projectName: string;
  modelId: string;
  modelName: string;
  slots: number;
  amount: number;
  expectedReturns: number;
  lockInPeriod: number;
  maturityDate: string;
  createdAt: string;
  status: 'active' | 'completed';
}

// OTP types
export interface OtpRequest {
  phoneNumber: string;
}

export interface OtpVerification {
  phoneNumber: string;
  otp: string;
}

export interface ProfileCreation {
  phoneNumber: string;
  name: string;
}
