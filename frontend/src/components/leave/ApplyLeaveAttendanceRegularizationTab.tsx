'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Clock, Calendar, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

type Props = {
  regDate: string;
  setRegDate: (v: string) => void;
  regCheckIn: string;
  setRegCheckIn: (v: string) => void;
  regCheckOut: string;
  setRegCheckOut: (v: string) => void;
  regReason: string;
  setRegReason: (v: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onReset: () => void;
};

const ApplyLeaveAttendanceRegularizationTab = React.memo(({
  regDate,
  setRegDate,
  regCheckIn,
  setRegCheckIn,
  regCheckOut,
  setRegCheckOut,
  regReason,
  setRegReason,
  isSubmitting,
  onSubmit,
  onReset,
}: Props) => {
  return (
    <div className='flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300 will-change-[transform,opacity]'>
      <div className='bg-primary/5 rounded-2xl p-5 border border-primary/10 flex gap-4 items-start'>
        <div className='p-2.5 rounded-xl bg-primary/10 text-primary'>
          <AlertCircle className='w-5 h-5' />
        </div>
        <div>
          <h4 className='text-sm font-bold text-primary'>Attendance Correction</h4>
          <p className='text-xs text-muted-foreground mt-1 leading-relaxed font-medium'>
            Use this form to request corrections for missing or incorrect punch-in/out times. 
            All regularization requests require manager approval.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Date Section */}
        <div className='flex flex-col gap-5'>
          <div>
            <label className='text-sm font-semibold text-foreground flex items-center gap-2 mb-3'>
              <Calendar className='w-4 h-4 text-primary' />
              Select Date
            </label>
            <Input
              id='regDate'
              label='Correction Date'
              type='date'
              max={new Date().toISOString().split('T')[0]}
              value={regDate}
              onChange={(e) => setRegDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Input
                id='regCheckIn'
                label='Check-In Time'
                type='time'
                value={regCheckIn}
                onChange={(e) => setRegCheckIn(e.target.value)}
                disabled={isSubmitting}
                rightElement={<Clock className='w-4 h-4 text-muted-foreground' />}
              />
            </div>
            <div>
              <Input
                id='regCheckOut'
                label='Check-Out Time'
                type='time'
                value={regCheckOut}
                onChange={(e) => setRegCheckOut(e.target.value)}
                disabled={isSubmitting}
                rightElement={<Clock className='w-4 h-4 text-muted-foreground' />}
              />
            </div>
          </div>
        </div>

        {/* Reason Section */}
        <div className='flex flex-col gap-3'>
          <label className='text-sm font-semibold text-foreground flex items-center gap-2 mb-0.5'>
            <MessageSquare className='w-4 h-4 text-primary' />
            Reason for Regularization
          </label>
          <Input
            id='regReason'
            label='e.g. Forgot to punch in, Biometric system error...'
            type='textarea'
            rows={5}
            value={regReason}
            onChange={(e) => setRegReason(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className='flex items-center justify-between pt-6 border-t border-border'>
        <div className='flex items-center gap-2 text-[11px] font-semibold text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full'>
          <CheckCircle2 className='w-3.5 h-3.5 text-emerald-500' />
          Submission will be logged for audit
        </div>
        <div className='flex items-center gap-3'>
          <Button 
            type='button' 
            variant='outline' 
            onClick={onReset}
            disabled={isSubmitting}
            className='rounded-xl px-6'
          >
            Reset
          </Button>
          <Button 
            type='button' 
            onClick={onSubmit}
            loading={isSubmitting}
            disabled={!regDate || !regReason || (!regCheckIn && !regCheckOut)}
            className='rounded-xl px-8 bg-primary hover:bg-primary/90'
          >
            Apply Regularization
          </Button>
        </div>
      </div>
    </div>
  );
});

ApplyLeaveAttendanceRegularizationTab.displayName = 'ApplyLeaveAttendanceRegularizationTab';

export default ApplyLeaveAttendanceRegularizationTab;
