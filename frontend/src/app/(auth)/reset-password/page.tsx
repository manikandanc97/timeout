'use client';

import AuthPageShell from '@/components/auth/AuthPageShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/services/api';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useRef, useState, Suspense } from 'react';
import toast from 'react-hot-toast';

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const submitLock = useRef(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid or missing reset token.');
      return;
    }

    if (!password || !confirmPassword) {
      toast.error('Please fill in all blanks');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (submitLock.current) return;
    submitLock.current = true;
    setIsSubmitting(true);

    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      toast.success('Password reset successfully! You can now log in.');
      router.push('/login');
    } catch (error: unknown) {
      const axiosLike = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosLike.response?.data?.message ?? 'Failed to reset password');
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className='flex flex-col items-center justify-center p-6 text-center space-y-4'>
         <p className='text-red-500 font-medium'>Invalid or missing reset token.</p>
         <Button onClick={() => router.push('/login')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      <Input
        id='password'
        type={showPassword ? 'text' : 'password'}
        label='New Password'
        value={password}
        inputClassName='pr-10'
        onChange={(e) => setPassword(e.target.value)}
        rightElement={
          <Button
            type='button'
            variant='ghost'
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className='!rounded !p-0 !text-card-foreground/90 hover:!bg-transparent hover:!text-primary focus:outline-none'
          >
            {showPassword ? (
              <EyeOff color='gray' size={18} />
            ) : (
              <Eye color='gray' size={18} />
            )}
          </Button>
        }
      />
      <Input
        id='confirmPassword'
        type={showConfirmPassword ? 'text' : 'password'}
        label='Confirm New Password'
        value={confirmPassword}
        inputClassName='pr-10'
        onChange={(e) => setConfirmPassword(e.target.value)}
        rightElement={
          <Button
            type='button'
            variant='ghost'
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            className='!rounded !p-0 !text-card-foreground/90 hover:!bg-transparent hover:!text-primary focus:outline-none'
          >
            {showConfirmPassword ? (
              <EyeOff color='gray' size={18} />
            ) : (
              <Eye color='gray' size={18} />
            )}
          </Button>
        }
      />
      <Button
        type='submit'
        disabled={isSubmitting}
        className='mt-1 w-full py-2.5 text-[15px]'
      >
        {isSubmitting ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
};

const ResetPassword = () => {
  return (
    <AuthPageShell
      title='Reset Password'
      subtitle='Please enter your new password.'
      leading={
        <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner ring-1 ring-primary/15'>
           {/* Fallback to Key since LockReset might not exist in lucide-react if old version */}
           <div className="font-bold text-2xl">***</div>
        </div>
      }
    >
      <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
};

export default ResetPassword;
