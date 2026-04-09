'use client';

import AuthPageShell from '@/components/auth/AuthPageShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import api from '@/services/api';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
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

    if (!name || !email || !password) {
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
      title='Create Account'
      subtitle='Register for your Timeout account'
    >
      <form onSubmit={handleSubmit} className='space-y-6'>
        <Input
          id='name'
          type='text'
          label='Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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

        <Input
          id='confirmPassword'
          type={showConfirmPassword ? 'text' : 'password'}
          label='Confirm Password'
          value={confirmPassword}
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

        <Select
          id='gender'
          label='Gender'
          placeholder='Select gender'
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          options={[
            { label: 'Male', value: 'MALE' },
            { label: 'Female', value: 'FEMALE' },
          ]}
          rightElement={<ChevronDown size={18} className='text-gray-500' />}
        />

        <Button type='submit' className='w-full'>
          Register
        </Button>

        <p className='text-center text-sm text-gray-500'>
          Already have an account?{' '}
          <button
            type='button'
            onClick={() => router.push('/login')}
            className='cursor-pointer text-primary hover:underline'
          >
            Login
          </button>
        </p>
      </form>
    </AuthPageShell>
  );
};

export default Register;
