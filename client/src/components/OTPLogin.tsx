import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OTPLogin: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleContinue = () => {
        if (!phoneNumber) {
            setError('Please enter a phone number');
            return;
        }
        setShowOtpInput(true);
    };

    const handleLogin = () => {
        if (otp === '123456') {
            navigate('/dashboard');
        } else {
            setError('Invalid OTP');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {showOtpInput ? 'Enter OTP' : 'Enter Phone Number'}
                    </h2>
                </div>
                <div className="mt-8 space-y-6">
                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        {!showOtpInput ? (
                            <div>
                                <label htmlFor="phone" className="sr-only">Phone Number</label>
                                <input
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
                        ) : (
                            <div>
                                <label htmlFor="otp" className="sr-only">OTP</label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter OTP (123456)"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={showOtpInput ? handleLogin : handleContinue}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {showOtpInput ? 'Login' : 'Continue'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPLogin; 