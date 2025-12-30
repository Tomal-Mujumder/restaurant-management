import React, { useState, useRef, useEffect } from 'react';
import { Alert, Label, Spinner } from 'flowbite-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import otpImage from '../assets/signup.jpg';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type'); // signup or reset

  // Redirect if no email in URL
  useEffect(() => {
    if (!email) {
      navigate(type === 'reset' ? '/forgot-password' : '/signup');
    }
  }, [email, navigate, type]);

  // Auto-focus on first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      return setErrorMessage('Please enter all 6 digits.');
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      setLoading(false);
      
      if (type === 'reset') {
        setSuccessMessage('OTP verified! Please set your new password.');
        // Store verification token for security guard
        sessionStorage.setItem('resetToken', 'true');
        sessionStorage.setItem('reset_otp', otpCode);
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setSuccessMessage('Email verified successfully! You can now log in.');
        setTimeout(() => {
          navigate(`/signin?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message || 'An error occurred');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      setResendLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setResendLoading(false);
      setSuccessMessage('New OTP sent to your email!');
      setResendCooldown(60); // 60 second cooldown
      setOtp(['', '', '', '', '', '']); // Clear OTP inputs
      inputRefs.current[0]?.focus(); // Focus first input
    } catch (error) {
      setResendLoading(false);
      setErrorMessage(error.message || 'An error occurred');
    }
  };

  return (
    <>
      <div className='min-h-screen mt-20 bg-gray-100'>
        <div className="flex flex-col max-w-3xl gap-10 p-3 mx-auto md:flex-row md:items-center">
          {/* left */}
          <div className='flex-col hidden w-full mr-10 md:w-8/12 lg:w-6/12 md:flex'>
            <img src={otpImage} alt="Verification" className='object-cover w-full h-full' />
          </div>

          {/* right */}
          <div className="flex-1">
            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
              <h4 className='text-xl font-bold' style={{ color: 'black' }}>
                {type === 'reset' ? 'Verify Password Reset' : 'Verify Your Email'}
              </h4>
              <p className='text-sm text-center' style={{ color: '#707070' }}>
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>
              
              <div>
                <Label value='Enter OTP Code' style={{ color: 'black' }} />
                <div className='flex gap-2 mt-2' onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type='text'
                      inputMode='numeric'
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className='w-12 h-12 text-2xl font-bold text-center border-2 border-gray-300 rounded-lg focus:border-red-900 focus:ring-2 focus:ring-red-900'
                      style={{ color: 'black' }}
                    />
                  ))}
                </div>
                <p className='mt-2 text-xs' style={{ color: '#707070' }}>
                  Code expires in 5 minutes
                </p>
              </div>

              <button
                type="submit"
                className={`flex items-center justify-center text-white bg-red-900 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size='sm' />
                    <span className='pl-3'>Verifying...</span>
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>

              <button
                type="button"
                onClick={handleResend}
                className={`flex items-center justify-center text-red-900 bg-white border-2 border-red-900 hover:bg-red-50 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center ${(resendLoading || resendCooldown > 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={resendLoading || resendCooldown > 0}
              >
                {resendLoading ? (
                  <>
                    <Spinner size='sm' color='failure' />
                    <span className='pl-3'>Sending...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend Code (${resendCooldown}s)`
                ) : (
                  'Resend Code'
                )}
              </button>
            </form>

            {successMessage && (
              <Alert className='mt-5' color='success'>
                {successMessage}
              </Alert>
            )}
            
            {errorMessage && (
              <Alert className='mt-5' color='failure'>
                {errorMessage}
              </Alert>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
