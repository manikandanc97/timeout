'use client';

import AuthPageShell from '@/components/auth/AuthPageShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { setAccessToken } from '@/lib/token';
import api from '@/services/api';
import { Eye, EyeOff, LogIn } from 'lucide-react';
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
      title='Welcome back'
      subtitle='Sign in with your work email to manage leaves and time off.'
      leading={
        <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner ring-1 ring-primary/15'>
          <LogIn className='h-7 w-7' strokeWidth={1.75} aria-hidden />
        </div>
      }
    >
      <form onSubmit={handleSubmit} className='space-y-5'>
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
        <Button type='submit' className='mt-1 w-full py-2.5 text-[15px]'>
          Sign in
        </Button>
        <p className='pt-1 text-center text-sm text-gray-500'>
          New here?{' '}
          <button
            type='button'
            onClick={() => router.push('/register')}
            className='cursor-pointer font-medium text-primary underline-offset-4 transition-colors hover:text-primary-dark hover:underline'
          >
            Create an account
          </button>
        </p>
      </form>
    </AuthPageShell>
  );
};

export default Login;
