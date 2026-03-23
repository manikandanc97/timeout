'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { setAccessToken } from '@/lib/token';
import api from '@/services/api';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email && !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      const res = await api.post('/auth/login', { email, password });
      setAccessToken(res.data.accessToken);
      toast.success('Login successful!');

      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className='flex justify-center items-center bg-background px-4 min-h-screen'>
      <form
        onSubmit={handleSubmit}
        className='space-y-6 bg-white shadow-lg p-8 rounded-2xl w-full max-w-md'
      >
        <div className='space-y-2 text-center'>
          <h2 className='font-bold text-primary text-3xl'>Welcome Back</h2>
          <p className='text-gray-500 text-sm'>Login to your Timeout account</p>
        </div>
        <Input
          id='email'
          type='email'
          label='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id='password'
          type={showPassword ? 'text' : 'password'}
          label='Password'
          value={password}
          inputClassName='pr-10'
          onChange={(e: any) => setPassword(e.target.value)}
          rightElement={
            <Button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className='bg-transparent hover:bg-transparent p-0 rounded focus:outline-none text-gray-700 hover:text-primary'
            >
              {showPassword ? (
                <EyeOff color='gray' size={18} />
              ) : (
                <Eye color='gray' size={18} />
              )}
            </Button>
          }
        />
        <Button type='submit'>Login</Button>
        <p className='text-gray-500 text-sm text-center'>
          Don’t have an account?{' '}
          <span
            onClick={() => router.push('/register')}
            className='text-primary hover:underline cursor-pointer'
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
