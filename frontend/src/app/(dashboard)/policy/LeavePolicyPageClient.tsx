'use client';

import LeavePolicyDocumentEditor from '@/components/policy/LeavePolicyDocumentEditor';
import LeavePolicyDocumentView from '@/components/policy/LeavePolicyDocumentView';
import PageCard from '@/components/ui/PageCard';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import type { LeavePolicyDocument } from '@/types/leavePolicy';
import api from '@/services/api';
import { Pencil, RotateCcw } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function LeavePolicyPageClient() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [policy, setPolicy] = useState<LeavePolicyDocument | null>(null);
  const [usingDefault, setUsingDefault] = useState(true);
  const [draft, setDraft] = useState<LeavePolicyDocument | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPolicy = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ policy: LeavePolicyDocument; usingDefault: boolean }>(
        '/organization/leave-policy',
      );
      setPolicy(res.data.policy);
      setUsingDefault(res.data.usingDefault);
    } catch {
      toast.error('Could not load leave policy');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPolicy();
  }, [loadPolicy]);

  const startEdit = () => {
    if (!policy) return;
    setDraft(structuredClone(policy));
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(null);
    setEditing(false);
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await api.put<{ policy: LeavePolicyDocument; usingDefault: boolean }>(
        '/organization/leave-policy',
        draft,
      );
      setPolicy(res.data.policy);
      setUsingDefault(res.data.usingDefault);
      setDraft(null);
      setEditing(false);
      toast.success('Leave policy saved');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Could not save leave policy';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (
      !window.confirm(
        'Reset leave policy to the built-in default? Your custom text will be removed for everyone in the organisation.',
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const res = await api.post<{ policy: LeavePolicyDocument; usingDefault: boolean }>(
        '/organization/leave-policy/reset',
      );
      setPolicy(res.data.policy);
      setUsingDefault(true);
      if (editing && draft) {
        setDraft(structuredClone(res.data.policy));
      }
      toast.success('Policy reset to default');
    } catch {
      toast.error('Could not reset policy');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !policy) {
    return (
      <PageCard title='Leave Policy'>
        <div className='mt-6 animate-pulse space-y-4'>
          <div className='h-20 rounded-xl bg-gray-100' />
          <div className='h-40 rounded-xl bg-gray-100' />
          <div className='h-32 rounded-xl bg-gray-100' />
        </div>
      </PageCard>
    );
  }

  return (
    <PageCard
      title='Leave Policy'
      titleTrailing={
        isAdmin && !editing ? (
          <>
            <Button
              type='button'
              variant='outline'
              className='inline-flex items-center gap-2 text-sm'
              onClick={startEdit}
            >
              <Pencil size={16} aria-hidden />
              Edit
            </Button>
            {!usingDefault ? (
              <Button
                type='button'
                variant='outline'
                className='inline-flex items-center gap-2 text-sm'
                onClick={() => void resetToDefault()}
                disabled={saving}
              >
                <RotateCcw size={16} aria-hidden />
                Reset to default
              </Button>
            ) : null}
          </>
        ) : null
      }
    >
      {isAdmin && editing && draft ? (
        <>
          <div className='flex flex-wrap items-center justify-end gap-2 border-b border-gray-100 pb-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => void resetToDefault()}
              disabled={saving}
              className='text-sm'
            >
              Reset to default
            </Button>
            <Button type='button' variant='outline' onClick={cancelEdit} disabled={saving}>
              Cancel
            </Button>
            <Button type='button' onClick={() => void save()} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
          <LeavePolicyDocumentEditor
            draft={draft}
            onChange={setDraft}
            disabled={saving}
          />
        </>
      ) : (
        <>
          {isAdmin && usingDefault ? (
            <p className='mb-2 rounded-lg border border-dashed border-primary/25 bg-primary/5 px-3 py-2 text-xs text-gray-600'>
              Showing the default policy. Use <strong className='text-gray-800'>Edit</strong> to
              customise it for your organisation.
            </p>
          ) : null}
          <LeavePolicyDocumentView document={policy} />
        </>
      )}
    </PageCard>
  );
}
