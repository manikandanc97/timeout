'use client';

import AuthPageShell from '@/components/auth/AuthPageShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/services/api';
import { Mail, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const router = useRouter();
  const submitLock = useRef(false);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    if (submitLock.current) return;
    submitLock.current = true;
    setIsSubmitting(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      toast.success('Password reset link sent! Check your inbox.');
    } catch (error: unknown) {
      const axiosLike = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosLike.response?.data?.message ?? 'Failed to send reset link');
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      title='Forgot Password'
      subtitle={
        isSubmitted
          ? 'Check your email for the password reset link.'
          : 'Enter your email Address to receive a password reset link.'
      }
      leading={
        <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner ring-1 ring-primary/15'>
          <Mail className='h-7 w-7' strokeWidth={1.75} aria-hidden />
        </div>
      }
    >
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className='space-y-5'>
          <Input
            id='email'
            type='email'
            label='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type='submit'
            disabled={isSubmitting}
            className='mt-1 w-full py-2.5 text-[15px]'
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <div className='mt-4 flex justify-center'>
             <button
              type='button'
              onClick={() => router.push('/login')}
              className='flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to log in
            </button>
          </div>
        </form>
      ) : (
        <div className='space-y-5'>
           <div className='rounded-lg bg-green-50 p-4 text-green-800 text-sm ring-1 ring-green-200'>
             We have sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam/junk folder.
           </div>
           <Button
            type='button'
            className='w-full py-2.5 text-[15px]'
            onClick={() => router.push('/login')}
          >
            Return to Log In
          </Button>
        </div>
      )}
    </AuthPageShell>
  );
};

export default ForgotPassword;
