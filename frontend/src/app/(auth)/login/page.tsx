'use client';

import AuthPageShell from '@/components/auth/AuthPageShell';
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
    } catch (error: unknown) {
      const axiosLike = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosLike.response?.data?.message ?? 'Login failed');
    }
  };

  return (
    <AuthPageShell
      title='Welcome Back'
      subtitle='Login to your Timeout account'
    >
      <form onSubmit={handleSubmit} className='space-y-6'>
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
          onChange={(e) => setPassword(e.target.value)}
          rightElement={
            <Button
              type='button'
              variant='ghost'
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className='!rounded !p-0 !text-gray-700 hover:!bg-transparent hover:!text-primary focus:outline-none'
            >
              {showPassword ? (
                <EyeOff color='gray' size={18} />
              ) : (
                <Eye color='gray' size={18} />
              )}
            </Button>
          }
        />
        <Button type='submit' className='w-full'>
          Login
        </Button>
        <p className='text-center text-sm text-gray-500'>
          Don’t have an account?{' '}
          <button
            type='button'
            onClick={() => router.push('/register')}
            className='cursor-pointer text-primary hover:underline'
          >
            Register
          </button>
        </p>
      </form>
    </AuthPageShell>
  );
};

export default Login;
