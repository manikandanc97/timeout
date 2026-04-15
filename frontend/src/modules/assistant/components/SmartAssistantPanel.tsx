'use client';

import { useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { ASSISTANT_INTRO_TEXT } from '../constants/messageTypes';
import AssistantMessageCards from './AssistantMessageCards';
import { useSmartAssistant } from '../hooks/useSmartAssistant';

const SmartAssistantPanel = () => {
  const { messages, draft, isTyping, error, setDraft, sendMessage } = useSmartAssistant();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, isTyping]);

  return (
    <div className='flex h-full min-h-0 flex-col overflow-hidden'>
      <div
        ref={scrollRef}
        className='min-h-0 flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-muted/30 p-3 pb-28'
      >
        {messages.length === 0 ? (
          <div className='rounded-2xl rounded-bl-md border border-border bg-card px-3 py-2 text-sm text-card-foreground'>
            {ASSISTANT_INTRO_TEXT}
          </div>
        ) : null}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[92%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                message.role === 'user'
                  ? 'rounded-br-md bg-primary text-primary-foreground'
                  : 'rounded-bl-md border border-border bg-card text-card-foreground'
              }`}
            >
              {message.content}
              {message.role === 'assistant' && message.cards ? (
                <AssistantMessageCards cards={message.cards} />
              ) : null}
            </div>
          </div>
        ))}
        {isTyping ? (
          <div className='rounded-2xl rounded-bl-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground'>
            Assistant is typing...
          </div>
        ) : null}
      </div>

      <form
        className='sticky bottom-0 mt-3 flex items-end gap-2 rounded-xl border border-border bg-card/95 p-2 backdrop-blur'
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage(draft);
        }}
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder='Ask HR queries or request actions like apply/approve/reject leave...'
          rows={2}
          className='min-h-[66px] max-h-36 flex-1 resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm leading-5 text-card-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary'
          disabled={isTyping}
        />
        <Button
          type='submit'
          variant='primary'
          className='h-[42px] shrink-0 rounded-xl! px-4!'
          disabled={isTyping || draft.trim() === ''}
        >
          Send
        </Button>
      </form>
      {error ? <p className='mt-2 text-xs text-destructive'>{error}</p> : null}
    </div>
  );
};

export default SmartAssistantPanel;
