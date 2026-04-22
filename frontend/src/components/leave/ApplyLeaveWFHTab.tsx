'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Home, Calendar, MessageSquare, Info, ShieldCheck, Clock } from 'lucide-react';

type Props = {
  todayIso: string;
  wfhStartDate: string;
  setWfhStartDate: (v: string) => void;
  wfhEndDate: string;
  setWfhEndDate: (v: string) => void;
  wfhReason: string;
  setWfhReason: (v: string) => void;
  wfhAvailability: string;
  setWfhAvailability: (v: string) => void;
  wfhManagerVisible: boolean;
  setWfhManagerVisible: (v: boolean) => void;
  wfhRemarks: string;
  setWfhRemarks: (v: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onReset: () => void;
};

const ApplyLeaveWFHTab = React.memo(({
  todayIso,
  wfhStartDate,
  setWfhStartDate,
  wfhEndDate,
  setWfhEndDate,
  wfhReason,
  setWfhReason,
  wfhAvailability,
  setWfhAvailability,
  wfhManagerVisible,
  setWfhManagerVisible,
  wfhRemarks,
  setWfhRemarks,
  isSubmitting,
  onSubmit,
  onReset,
}: Props) => {
  return (
    <div className='flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300 will-change-[transform,opacity]'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Date Section */}
        <div className='flex flex-col gap-4'>
          <label className='text-sm font-semibold text-foreground flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-primary' />
            Work From Home Period
          </label>
          <div className='grid grid-cols-2 gap-3'>
            <Input
              id='wfhStartDate'
              label='From'
              type='date'
              min={todayIso}
              value={wfhStartDate}
              onChange={(e) => setWfhStartDate(e.target.value)}
              disabled={isSubmitting}
            />
            <Input
              id='wfhEndDate'
              label='To'
              type='date'
              min={wfhStartDate || todayIso}
              value={wfhEndDate}
              onChange={(e) => setWfhEndDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Reason Section */}
        <div className='flex flex-col gap-4'>
          <label className='text-sm font-semibold text-foreground flex items-center gap-2'>
            <MessageSquare className='w-4 h-4 text-primary' />
            Reason for WFH
          </label>
          <Input
            id='wfhReason'
            label='Briefly explain why you need to work from home...'
            type='textarea'
            rows={3}
            value={wfhReason}
            onChange={(e) => setWfhReason(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Availability Details */}
        <div className='flex flex-col gap-4'>
          <label className='text-sm font-semibold text-foreground flex items-center gap-2'>
            <Clock className='w-4 h-4 text-primary' />
            Work Availability Details
          </label>
          <Input
            id='wfhAvailability'
            label='e.g. Available on Slack/Teams from 9 AM to 6 PM...'
            type='textarea'
            rows={3}
            value={wfhAvailability}
            onChange={(e) => setWfhAvailability(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Remarks & Visibility */}
        <div className='flex flex-col gap-4'>
          <label className='text-sm font-semibold text-foreground flex items-center gap-2'>
            <Info className='w-4 h-4 text-primary' />
            Additional Remarks & Settings
          </label>
          <div className='flex flex-col gap-4'>
            <Input
              id='wfhRemarks'
              label='Any other notes for the reviewer...'
              type='textarea'
              rows={1}
              value={wfhRemarks}
              onChange={(e) => setWfhRemarks(e.target.value)}
              disabled={isSubmitting}
            />
            
            <div 
              onClick={() => !isSubmitting && setWfhManagerVisible(!wfhManagerVisible)}
              className={`flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 transition-colors ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/50'}`}
            >
              <div className='flex items-center gap-3'>
                <div className={`p-2 rounded-lg ${wfhManagerVisible ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <ShieldCheck className='w-4 h-4' />
                </div>
                <div>
                  <p className='text-xs font-semibold'>Visible to Reporting Manager</p>
                  <p className='text-[10px] text-muted-foreground'>Reviewer can see full request details</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full p-1 transition-colors ${wfhManagerVisible ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${wfhManagerVisible ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-end gap-3 pt-4 border-t border-border'>
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
          disabled={!wfhStartDate || !wfhEndDate || !wfhReason || !wfhAvailability}
          className='rounded-xl px-8 bg-primary hover:bg-primary/90'
        >
          Submit WFH Request
        </Button>
      </div>

      <div className='p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3'>
        <Info className='w-5 h-5 text-amber-500 shrink-0 mt-0.5' />
        <div className='text-xs text-amber-600/80 leading-relaxed font-medium'>
          WFH requests follow the standard approval hierarchy. Managers cannot self-approve; their requests will be routed to HR/Admin for final review.
        </div>
      </div>
    </div>
  );
});

ApplyLeaveWFHTab.displayName = 'ApplyLeaveWFHTab';

export default ApplyLeaveWFHTab;
