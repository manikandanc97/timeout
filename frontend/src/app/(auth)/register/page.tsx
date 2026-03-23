'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/services/api';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const Register = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      });

      toast.success('Account created successfully');

      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className='flex justify-center items-center bg-background px-4 min-h-screen'>
      <form
        onSubmit={handleSubmit}
        className='space-y-6 bg-white shadow-lg p-8 rounded-2xl w-full max-w-md'
      >
        <div className='space-y-2 text-center'>
          <h2 className='font-bold text-primary text-3xl'>Create Account</h2>
          <p className='text-gray-500 text-sm'>
            Register for your Timeout account
          </p>
        </div>

        <Input
          id='name'
          type='text'
          label='Name'
          value={name}
          onChange={(e: any) => setName(e.target.value)}
        />

        <Input
          id='email'
          type='email'
          label='Email'
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
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

        <Input
          id='confirmPassword'
          type={showConfirmPassword ? 'text' : 'password'}
          label='Confirm Password'
          value={confirmPassword}
          onChange={(e: any) => setConfirmPassword(e.target.value)}
          rightElement={
            <Button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className='bg-transparent hover:bg-transparent p-0 rounded focus:outline-none text-gray-700 hover:text-primary'
            >
              {showConfirmPassword ? (
                <EyeOff color='gray' size={18} />
              ) : (
                <Eye color='gray' size={18} />
              )}
            </Button>
          }
        />

        <Button type='submit'>Register</Button>

        <p className='text-gray-500 text-sm text-center'>
          Already have an account?{' '}
          <span
            onClick={() => router.push('/login')}
            className='text-primary hover:underline cursor-pointer'
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
