import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCw } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<boolean>;
  onResend: () => Promise<boolean>;
  onBack: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onVerify,
  onResend,
  onBack,
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (index === 5 && value) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').trim();
    // Extract only digits and take first 6
    const digits = pasteData.replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) {
      const newOtp = digits.split('');
      setOtp(newOtp);
      handleVerify(digits);
    }
  };

  const handleVerify = async (otpValue?: string) => {
    let otpString = otpValue || otp.join('');
    
    // Ensure we have exactly 6 digits (validation can be enforced server-side as well)
    // otpString = otpString.replace(/\D/g, ''); // Remove any non-digit characters
    // if (otpString.length !== 6) {
    //   setMessage({ text: 'Please enter a 6-digit OTP', isError: true });
    //   return;
    // }
    console.log(otpString);
    setIsLoading(true);
    setMessage({ text: '', isError: false });

    try {
      const success = await onVerify(otpString);
      if (!success) {
        setMessage({ text: 'Invalid OTP. Please try again.', isError: true });
        // Clear OTP on error
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again.', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setMessage({ text: 'Sending OTP...', isError: false });
    setCanResend(false);
    setResendTimer(30);

    try {
      const success = await onResend();
      if (success) {
        setMessage({ text: 'OTP resent successfully!', isError: false });
        // Start the timer
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setMessage({ text: 'Failed to resend OTP. Please try again.', isError: true });
        setCanResend(true);
      }
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again.', isError: true });
      setCanResend(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a 6-digit verification code to <span className="font-semibold">{email}</span>
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-center space-x-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-12 text-2xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {message.text && (
          <div
            className={`p-3 rounded-lg mb-4 text-sm ${
              message.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {message.isError ? <XCircle className="inline mr-1" size={16} /> : <CheckCircle className="inline mr-1" size={16} />}
            {message.text}
          </div>
        )}

        <div className="text-center text-sm text-gray-600 mb-6">
          {!canResend ? (
            <p>Resend OTP in {resendTimer} seconds</p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
            >
              {isLoading ? <RotateCw className="inline animate-spin mr-1" size={16} /> : null}
              Resend OTP
            </button>
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
            disabled={isLoading}
          >
            ← Back to registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
