import React, { useState } from 'react';
import { Alert, Label, Spinner, TextInput } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import gymImage from '../assets/emplogin.jpg';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      return setErrorMessage('Please enter your email.');
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return setErrorMessage(data.message || 'Failed to send reset link');
      }
      setLoading(false);
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&type=reset`);
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message || 'An error occurred');
    }
  };

  return (
    <div className='min-h-screen mt-20 bg-gray-100'>
      <div className='flex flex-col max-w-3xl gap-10 p-3 mx-auto md:flex-row md:items-center'>
        {/* left */}
        <div className='flex-col hidden w-full mr-10 md:w-8/12 lg:w-6/12 md:flex'>
          <img src={gymImage} alt="ForgotPassword" className='object-cover w-full h-full' />
        </div>

        {/* right */}
        <div className='flex-1'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <h4 className='text-xl font-bold' style={{ color: 'black' }}>Forgot Password</h4>
            <p className='mt-2 text-sm' style={{ color: '#707070' }}>
              Enter your email address and we'll send you an OTP to reset your password.
            </p>
            <div>
              <Label value='Email' style={{ color: 'black' }} />
              <TextInput
                type='email'
                placeholder='name@company.com'
                id='email'
                onChange={(e) => setEmail(e.target.value.trim())}
                style={{ color: 'black' }}
              />
            </div>
            <button
              type="submit"
              className={`flex items-center justify-center text-white bg-red-900 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>Sending OTP...</span>
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
          <div className='flex gap-2 mt-5 text-sm'>
            <span>Remember your password?</span>
            <Link to='/signin' style={{ color: 'black' }} className='font-semibold hover:underline'>
              Sign In
            </Link>
          </div>
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
