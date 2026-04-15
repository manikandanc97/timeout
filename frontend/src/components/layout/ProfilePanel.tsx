'use client';

import React from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '@/services/api';
import { clearAccessToken } from '@/lib/token';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building2, IdCard, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { formatPersonName, initialsFromPersonName } from '@/lib/personName';

const formatRole = (value?: string) => {
  if (!value) return 'Member';
  const label = value.toLowerCase().replace(/_/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const ProfilePanel = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = React.useState(user?.name ?? '');
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [savingName, setSavingName] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const displayName = formatPersonName(user?.name) || 'User';
  const displayEmail = user?.email?.trim() || 'Not available';
  const roleLabel = formatRole(user?.role);
  const organizationLabel =
    typeof user?.organizationId === 'number'
      ? `ORG-${user.organizationId}`
      : 'Not assigned';
  const userIdLabel = typeof user?.id === 'number' ? `#${user.id}` : 'Unavailable';
  const initials = initialsFromPersonName(displayName);

  React.useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      clearAccessToken();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const handleNameUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error('Name is required');
      return;
    }
    if (trimmedName.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    setSavingName(true);
    try {
      await api.patch('/auth/me/name', { name: trimmedName });
      toast.success('Name updated successfully');
      setIsEditingName(false);
      router.refresh();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to update name';
      toast.error(message);
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await api.patch('/auth/me/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setIsChangingPassword(false);
      toast.success('Password changed successfully');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to change password';
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='rounded-xl border border-border bg-muted/40 p-4'>
        <div className='flex items-center gap-3'>
          <span className='flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground'>
            {initials}
          </span>
          <div className='min-w-0'>
            <p className='truncate text-sm font-semibold text-card-foreground'>
              {displayName}
            </p>
            <p className='truncate text-xs text-muted-foreground'>{displayEmail}</p>
          </div>
        </div>
      </div>

      <div className='space-y-2'>
        <div className='rounded-lg border border-border bg-card px-3 py-2'>
          <div className='mb-2 flex items-center justify-between gap-2'>
            <span className='inline-flex items-center gap-2 text-xs font-medium text-muted-foreground'>
              <UserRound size={14} />
              Full name
            </span>
            <Button
              type='button'
              variant='ghost'
              className='h-auto! px-2! py-1! text-xs! text-primary!'
              onClick={() => {
                if (isEditingName) {
                  setName(user?.name ?? '');
                }
                setIsEditingName((prev) => !prev);
              }}
            >
              {isEditingName ? 'Cancel' : 'Change name'}
            </Button>
          </div>
          {isEditingName ? (
            <form onSubmit={handleNameUpdate} className='space-y-2'>
              <Input
                id='profile-name'
                type='text'
                label='Full name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Button type='submit' className='w-full' disabled={savingName}>
                {savingName ? 'Saving...' : 'Save name'}
              </Button>
            </form>
          ) : (
            <span className='block text-sm font-medium text-card-foreground'>{displayName}</span>
          )}
        </div>

        <div className='rounded-lg border border-border bg-card px-3 py-2'>
          <div className='mb-2 flex items-center justify-between gap-2'>
            <span className='inline-flex items-center gap-2 text-xs font-medium text-muted-foreground'>
              <ShieldCheck size={14} />
              Password
            </span>
            <Button
              type='button'
              variant='ghost'
              className='h-auto! px-2! py-1! text-xs! text-primary!'
              onClick={() => {
                if (isChangingPassword) {
                  setCurrentPassword('');
                  setNewPassword('');
                }
                setIsChangingPassword((prev) => !prev);
              }}
            >
              {isChangingPassword ? 'Cancel' : 'Change password'}
            </Button>
          </div>
          {isChangingPassword ? (
            <form onSubmit={handlePasswordUpdate} className='space-y-2'>
              <Input
                id='current-password'
                type='password'
                label='Current password'
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                id='new-password'
                type='password'
                label='New password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Button type='submit' className='w-full' disabled={savingPassword}>
                {savingPassword ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          ) : (
            <p className='text-sm text-muted-foreground'>Use a strong password for account safety.</p>
          )}
        </div>

        <div className='flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2'>
          <span className='inline-flex items-center gap-2 text-xs font-medium text-muted-foreground'>
            <Mail size={14} />
            Work email
          </span>
          <span className='max-w-[58%] truncate text-right text-sm font-medium text-card-foreground'>
            {displayEmail}
          </span>
        </div>
        <div className='flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2'>
          <span className='inline-flex items-center gap-2 text-xs font-medium text-muted-foreground'>
            <ShieldCheck size={14} />
            Role
          </span>
          <span className='max-w-[58%] truncate text-right text-sm font-medium text-card-foreground'>
            {roleLabel}
          </span>
        </div>
        <div className='flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2'>
          <span className='inline-flex items-center gap-2 text-xs font-medium text-muted-foreground'>
            <Building2 size={14} />
            Organization
          </span>
          <span className='max-w-[58%] truncate text-right text-sm font-medium text-card-foreground'>
            {organizationLabel}
          </span>
        </div>
        <div className='flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2'>
          <span className='inline-flex items-center gap-2 text-xs font-medium text-muted-foreground'>
            <IdCard size={14} />
            Employee ID
          </span>
          <span className='max-w-[58%] truncate text-right text-sm font-medium text-card-foreground'>
            {userIdLabel}
          </span>
        </div>
      </div>

      <Button type='button' variant='danger' onClick={handleLogout} className='w-full'>
        Logout
      </Button>
    </div>
  );
};

export default ProfilePanel;
