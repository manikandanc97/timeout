'use client';

import AuthPageShell from '@/components/auth/AuthPageShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/services/api';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Register = () => {
  const router = useRouter();

  const [organizationName, setOrganizationName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !organizationName ||
      !adminName ||
      !workEmail ||
      !password ||
      !confirmPassword
    ) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await api.post('/auth/register', {
        organizationName,
        adminName,
        workEmail,
        password,
      });

      toast.success('Account created successfully');

      router.push('/login');
    } catch (error: unknown) {
      const axiosLike = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosLike.response?.data?.message ?? 'Registration failed');
    }
  };

  return (
    <AuthPageShell
      compact
      maxWidthClassName='max-w-lg'
      title='Create account'
      subtitle='Request and track leave in one place.'
      leading={
        <div className='flex justify-center items-center bg-primary/10 shadow-inner rounded-xl sm:rounded-2xl ring-1 ring-primary/15 w-11 sm:w-12 h-11 sm:h-12 text-primary'>
          <UserPlus className='w-6 h-6' strokeWidth={1.75} aria-hidden />
        </div>
      }
    >
      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-3 sm:gap-x-4 sm:gap-y-3'
      >
        <Input
          id='organizationName'
          type='text'
          label='Organization Name'
          value={organizationName}
          required
          onChange={(e) => setOrganizationName(e.target.value)}
        />

        <Input
          id='adminName'
          type='text'
          label='Admin Name'
          value={adminName}
          required
          onChange={(e) => setAdminName(e.target.value)}
        />

        <Input
          id='email'
          type='email'
          label='Email'
          value={workEmail}
          required
          onChange={(e) => setWorkEmail(e.target.value)}
        />

        <Input
          id='password'
          type={showPassword ? 'text' : 'password'}
          label='Password'
          value={password}
          required
          inputClassName='pr-10'
          onChange={(e) => setPassword(e.target.value)}
          rightElement={
            <Button
              type='button'
              variant='ghost'
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className='hover:!bg-transparent !p-0 !rounded focus:outline-none !text-card-foreground/90 hover:!text-primary'
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
          label='Confirm'
          value={confirmPassword}
          required
          inputClassName='pr-10'
          onChange={(e) => setConfirmPassword(e.target.value)}
          rightElement={
            <Button
              type='button'
              variant='ghost'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword
                  ? 'Hide confirm password'
                  : 'Show confirm password'
              }
              className='hover:!bg-transparent !p-0 !rounded focus:outline-none !text-card-foreground/90 hover:!text-primary'
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
          className='col-span-full py-2.5 w-full text-[15px]'
        >
          Create account
        </Button>

        <p className='col-span-full -mt-0.5 text-muted-foreground text-sm text-center'>
          Already have an account?{' '}
          <button
            type='button'
            onClick={() => router.push('/login')}
            className='font-medium text-primary hover:text-primary-dark hover:underline underline-offset-4 transition-colors cursor-pointer'
          >
            Sign in
          </button>
        </p>
      </form>
    </AuthPageShell>
  );
};

export default Register;
