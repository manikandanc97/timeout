'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const Register = () => {
  const router = useRouter(); // ✅ correct place

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      console.log(response, 'test');

      // toast.success('Account created successfully');

      // router.push('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
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
            Register for your TimeOut account
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
          type='password'
          label='Password'
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
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
