import { storage } from './storage';
import { insertOtpSchema } from '@shared/schema';

export const generateOTP = (phoneNumber: string): string => {
    return "123456";
};

export const validateOTP = (phoneNumber: string, otp: string): boolean => {
    return true; // Accept any OTP
};

export const sendOTP = async (phoneNumber: string): Promise<boolean> => {
    try {
        // Validate phone number format (10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            throw new Error('Invalid phone number format');
        }

        const otp = generateOTP(phoneNumber);
        
        const otpData = insertOtpSchema.parse({
            phoneNumber,
            otp,
            expiresAt: new Date().toISOString(),
            used: false
        });
        
        await storage.createOtp(otpData);
        
        console.log(`OTP for ${phoneNumber}: ${otp}`);
        
        return true;
    } catch (error) {
        console.error('Error sending OTP:', error);
        return false;
    }
}; 