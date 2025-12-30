import React, { useState, useEffect } from 'react';
import { Alert, Label, Spinner, TextInput } from 'flowbite-react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import gymImage from '../assets/signup.jpg';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  // Security Guard: Check if OTP was verified
  useEffect(() => {
    const isVerified = sessionStorage.getItem('resetToken');
    if (!isVerified || !email) {
      navigate('/signin');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      return setErrorMessage('Please fill out all fields.');
    }

    if (password !== confirmPassword) {
      return setErrorMessage('Passwords do not match.');
    }

    // Strict Password validation: min 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return setErrorMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    }

    const otp = sessionStorage.getItem('reset_otp');
    if (!otp) {
      return setErrorMessage('Session expired. Please start the forgot password flow again.');
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setLoading(false);
      // Success Cleanup: Remove tokens from session storage
      sessionStorage.removeItem('resetToken');
      sessionStorage.removeItem('reset_otp');
      
      // Navigate to signin with success message
      navigate(`/signin?email=${encodeURIComponent(email)}&reset=success`);
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message || 'An error occurred');
    }
  };

  return (
    <div className='min-h-screen mt-20 bg-gray-100'>
      <div className="flex flex-col max-w-3xl gap-10 p-3 mx-auto md:flex-row md:items-center">
        {/* left */}
        <div className='flex-col hidden w-full mr-10 md:w-8/12 lg:w-6/12 md:flex'>
          <img src={gymImage} alt="ResetPassword" className='object-cover w-full h-full' />
        </div>

        {/* right */}
        <div className="flex-1">
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <h4 className='text-xl font-bold' style={{ color: 'black' }}>Set New Password</h4>
            <p className='mt-2 text-sm' style={{ color: '#707070' }}>
              Setting a new password for <strong>{email}</strong>
            </p>
            <div>
              <Label value='New Password' style={{ color: 'black' }} />
              <div className='relative'>
                <TextInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder='**********'
                  id='password'
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ color: 'black' }}
                />
                <button
                  type='button'
                  className='absolute right-2 top-2 text-gray-500'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <Label value='Confirm Password' style={{ color: 'black' }} />
              <div className='relative'>
                <TextInput
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='**********'
                  id='confirmPassword'
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ color: 'black' }}
                />
                <button
                  type='button'
                  className='absolute right-2 top-2 text-gray-500'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className={`flex items-center justify-center text-white bg-red-900 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>Updating...</span>
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
          {errorMessage && (
            <Alert className='mt-5' color='failure'>
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
