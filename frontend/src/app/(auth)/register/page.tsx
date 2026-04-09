'use client';

import AuthPageShell from '@/components/auth/AuthPageShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/services/api';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const Register = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!gender) {
      toast.error('Please select gender');
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
        name,
        email,
        password,
        gender,
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
        <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner ring-1 ring-primary/15 sm:h-12 sm:w-12 sm:rounded-2xl'>
          <UserPlus className='h-6 w-6' strokeWidth={1.75} aria-hidden />
        </div>
      }
    >
      <form
        onSubmit={handleSubmit}
        className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3'
      >
        <Input
          id='name'
          type='text'
          label='Name'
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          id='email'
          type='email'
          label='Email'
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
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
                showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
              }
              className='!rounded !p-0 !text-gray-700 hover:!bg-transparent hover:!text-primary focus:outline-none'
            >
              {showConfirmPassword ? (
                <EyeOff color='gray' size={18} />
              ) : (
                <Eye color='gray' size={18} />
              )}
            </Button>
          }
        />

        <fieldset className='min-w-0 space-y-1.5 border-0 p-0 pt-0.5 sm:col-span-2'>
          <legend className='text-xs font-medium text-gray-500'>Gender</legend>
          <div className='flex flex-wrap items-center gap-x-5 gap-y-1'>
            <label className='flex cursor-pointer items-center gap-2 text-sm text-gray-700'>
              <input
                type='radio'
                name='gender'
                value='MALE'
                checked={gender === 'MALE'}
                onChange={() => setGender('MALE')}
                required
                className='h-4 w-4 shrink-0 border-gray-300 accent-primary focus:ring-2 focus:ring-primary/35 focus:ring-offset-0 focus:outline-none'
              />
              Male
            </label>
            <label className='flex cursor-pointer items-center gap-2 text-sm text-gray-700'>
              <input
                type='radio'
                name='gender'
                value='FEMALE'
                checked={gender === 'FEMALE'}
                onChange={() => setGender('FEMALE')}
                className='h-4 w-4 shrink-0 border-gray-300 accent-primary focus:ring-2 focus:ring-primary/35 focus:ring-offset-0 focus:outline-none'
              />
              Female
            </label>
          </div>
        </fieldset>

        <Button type='submit' className='col-span-full w-full py-2.5 text-[15px]'>
          Create account
        </Button>

        <p className='col-span-full -mt-0.5 text-center text-sm text-gray-500'>
          Already have an account?{' '}
          <button
            type='button'
            onClick={() => router.push('/login')}
            className='cursor-pointer font-medium text-primary underline-offset-4 transition-colors hover:text-primary-dark hover:underline'
          >
            Sign in
          </button>
        </p>
      </form>
    </AuthPageShell>
  );
};

export default Register;
