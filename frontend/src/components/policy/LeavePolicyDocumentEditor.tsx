'use client';

import { LEAVE_POLICY_ICON_OPTIONS } from '@/constants/leavePolicyIcons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type {
  LeavePolicyDocument,
  LeavePolicyIconKey,
  LeavePolicySection,
} from '@/types/leavePolicy';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';

type Props = {
  draft: LeavePolicyDocument;
  onChange: (next: LeavePolicyDocument) => void;
  disabled?: boolean;
};

function updateSectionAt(
  sections: LeavePolicySection[],
  index: number,
  patch: Partial<LeavePolicySection> | LeavePolicySection,
): LeavePolicySection[] {
  return sections.map((s, i) => (i === index ? ({ ...s, ...patch } as LeavePolicySection) : s));
}

export default function LeavePolicyDocumentEditor({
  draft,
  onChange,
  disabled = false,
}: Props) {
  const setIntro = (intro: string) => onChange({ ...draft, intro });
  const setFooter = (footer: string) => onChange({ ...draft, footer });
  const setSections = (sections: LeavePolicySection[]) =>
    onChange({ ...draft, sections });

  return (
    <div className='mt-4 space-y-8'>
      <div className='rounded-xl border border-gray-200 bg-gray-50/50 p-4'>
        <Input
          id='policy-intro'
          type='textarea'
          label='Intro (banner text)'
          value={draft.intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={4}
          inputClassName='min-h-[100px] resize-y'
          disabled={disabled}
        />
      </div>

      <div className='space-y-6'>
        <p className='text-sm font-medium text-gray-800'>Sections</p>
        {draft.sections.map((section, sIdx) => (
          <div
            key={`sec-${sIdx}`}
            className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm'
          >
            <div className='grid gap-4 sm:grid-cols-2'>
              <Input
                id={`sec-title-${sIdx}`}
                type='text'
                label='Section title'
                value={section.title}
                onChange={(e) =>
                  setSections(
                    updateSectionAt(draft.sections, sIdx, {
                      title: e.target.value,
                    }),
                  )
                }
                disabled={disabled}
              />
              <div>
                <label
                  htmlFor={`sec-icon-${sIdx}`}
                  className='mb-1 block text-sm font-medium text-gray-700'
                >
                  Icon
                </label>
                <select
                  id={`sec-icon-${sIdx}`}
                  className='w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 disabled:opacity-50'
                  value={section.iconKey}
                  disabled={disabled}
                  onChange={(e) =>
                    setSections(
                      updateSectionAt(draft.sections, sIdx, {
                        iconKey: e.target.value as LeavePolicyIconKey,
                      }),
                    )
                  }
                >
                  {LEAVE_POLICY_ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {section.kind === 'text' ? (
              <div className='mt-4'>
                <Input
                  id={`sec-body-${sIdx}`}
                  type='textarea'
                  label='Body (use a blank line between paragraphs)'
                  value={section.body}
                  onChange={(e) =>
                    setSections(
                      updateSectionAt(draft.sections, sIdx, {
                        kind: 'text',
                        body: e.target.value,
                      } as Partial<LeavePolicySection>),
                    )
                  }
                  rows={6}
                  inputClassName='min-h-[140px] resize-y'
                  disabled={disabled}
                />
              </div>
            ) : null}

            {section.kind === 'cards' ? (
              <div className='mt-4 space-y-4'>
                {section.cards.map((card, cIdx) => (
                  <div
                    key={`card-${sIdx}-${cIdx}`}
                    className='rounded-lg border border-gray-100 bg-gray-50/80 p-3'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
                        Card {cIdx + 1}
                      </p>
                      <Button
                        type='button'
                        variant='ghost'
                        unstyled
                        disabled={disabled || section.cards.length <= 1}
                        className='rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30'
                        aria-label='Remove card'
                        onClick={() => {
                          const nextCards = section.cards.filter((_, i) => i !== cIdx);
                          setSections(
                            updateSectionAt(draft.sections, sIdx, {
                              kind: 'cards',
                              cards: nextCards,
                            } as LeavePolicySection),
                          );
                        }}
                      >
                        <Trash2 size={16} aria-hidden />
                      </Button>
                    </div>
                    <div className='mt-2 space-y-3'>
                      <Input
                        id={`card-title-${sIdx}-${cIdx}`}
                        type='text'
                        label='Card title'
                        value={card.title}
                        onChange={(e) => {
                          const nextCards = section.cards.map((c, i) =>
                            i === cIdx ? { ...c, title: e.target.value } : c,
                          );
                          setSections(
                            updateSectionAt(draft.sections, sIdx, {
                              kind: 'cards',
                              cards: nextCards,
                            } as LeavePolicySection),
                          );
                        }}
                        disabled={disabled}
                      />
                      <Input
                        id={`card-body-${sIdx}-${cIdx}`}
                        type='textarea'
                        label='Card body'
                        value={card.body}
                        onChange={(e) => {
                          const nextCards = section.cards.map((c, i) =>
                            i === cIdx ? { ...c, body: e.target.value } : c,
                          );
                          setSections(
                            updateSectionAt(draft.sections, sIdx, {
                              kind: 'cards',
                              cards: nextCards,
                            } as LeavePolicySection),
                          );
                        }}
                        rows={4}
                        inputClassName='min-h-[96px] resize-y'
                        disabled={disabled}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type='button'
                  variant='outline'
                  disabled={disabled || section.cards.length >= 12}
                  className='inline-flex items-center gap-2 text-sm'
                  onClick={() => {
                    setSections(
                      updateSectionAt(draft.sections, sIdx, {
                        kind: 'cards',
                        cards: [...section.cards, { title: '', body: '' }],
                      } as LeavePolicySection),
                    );
                  }}
                >
                  <Plus size={16} aria-hidden />
                  Add card
                </Button>
              </div>
            ) : null}

            {section.kind === 'list' ? (
              <div className='mt-4 space-y-3'>
                {section.items.map((item, iIdx) => (
                  <div key={`li-${sIdx}-${iIdx}`} className='flex gap-2'>
                    <div className='min-w-0 flex-1'>
                      <Input
                        id={`list-${sIdx}-${iIdx}`}
                        type='textarea'
                        label={`Bullet ${iIdx + 1}`}
                        value={item}
                        onChange={(e) => {
                          const nextItems = section.items.map((it, j) =>
                            j === iIdx ? e.target.value : it,
                          );
                          setSections(
                            updateSectionAt(draft.sections, sIdx, {
                              kind: 'list',
                              items: nextItems,
                            } as LeavePolicySection),
                          );
                        }}
                        rows={2}
                        inputClassName='min-h-[72px] resize-y'
                        disabled={disabled}
                      />
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      unstyled
                      disabled={disabled || section.items.length <= 1}
                      className='mt-7 shrink-0 self-start rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30'
                      aria-label='Remove bullet'
                      onClick={() => {
                        const nextItems = section.items.filter((_, j) => j !== iIdx);
                        setSections(
                          updateSectionAt(draft.sections, sIdx, {
                            kind: 'list',
                            items: nextItems,
                          } as LeavePolicySection),
                        );
                      }}
                    >
                      <Trash2 size={18} aria-hidden />
                    </Button>
                  </div>
                ))}
                <Button
                  type='button'
                  variant='outline'
                  disabled={disabled || section.items.length >= 40}
                  className='inline-flex items-center gap-2 text-sm'
                  onClick={() => {
                    setSections(
                      updateSectionAt(draft.sections, sIdx, {
                        kind: 'list',
                        items: [...section.items, ''],
                      } as LeavePolicySection),
                    );
                  }}
                >
                  <Plus size={16} aria-hidden />
                  Add bullet
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className='rounded-xl border border-gray-200 bg-gray-50/50 p-4'>
        <Input
          id='policy-footer'
          type='textarea'
          label='Footer note'
          value={draft.footer}
          onChange={(e) => setFooter(e.target.value)}
          rows={3}
          inputClassName='min-h-[88px] resize-y'
          disabled={disabled}
        />
      </div>
    </div>
  );
}
