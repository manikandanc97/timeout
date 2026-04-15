'use client';

import { useState } from 'react';
import { postAssistantChat } from '../services/assistantApi';
import type { AssistantMessage } from '../types';
import {
  requestDashboardRefresh,
  type DashboardRefreshScope,
} from '@/lib/dashboardRealtimeBus';
import { createMessageId, normalizeAssistantContent } from '../utils/format';
import toast from 'react-hot-toast';

const refreshScopesByAction: Partial<Record<string, DashboardRefreshScope[]>> = {
  apply_leave: [
    'employeeDashboard',
    'employeeLeavesPage',
    'leaveRequestsPage',
    'adminDashboardStats',
    'adminPendingRequests',
  ],
  approve_leave: ['adminDashboardStats', 'adminPendingRequests', 'leaveRequestsPage'],
  reject_leave: ['adminDashboardStats', 'adminPendingRequests', 'leaveRequestsPage'],
};

const triggerRefreshForActions = (actions: string[]) => {
  const scopeSet = new Set<DashboardRefreshScope>();
  for (const action of actions) {
    const scopes = refreshScopesByAction[action];
    if (!scopes) continue;
    for (const scope of scopes) scopeSet.add(scope);
  }
  if (scopeSet.size > 0) requestDashboardRefresh([...scopeSet]);
};

const showActionToast = (actions: string[], reply: string) => {
  if (actions.includes('apply_leave')) {
    toast.success('Leave request submitted successfully.');
    return;
  }
  if (actions.includes('approve_leave')) {
    toast.success('Leave request approved.');
    return;
  }
  if (actions.includes('reject_leave')) {
    toast.success('Leave request rejected.');
    return;
  }
  const text = reply.toLowerCase();
  if (text.includes('leave applied') || text.includes('submitted')) {
    toast.success('Leave request submitted successfully.');
  }
};

export const useSmartAssistant = () => {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCardType = (item: AssistantMessage | undefined, type: string) =>
    Boolean(item?.cards?.some((card) => card.type === type));

  const sendMessage = async (value: string) => {
    const content = value.trim();
    if (!content || isTyping) return;
    const userMessage: AssistantMessage = {
      id: createMessageId(),
      role: 'user',
      content,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft('');
    setError(null);
    setIsTyping(true);

    try {
      const data = await postAssistantChat(nextMessages);
      const assistantContent = normalizeAssistantContent(data.reply);
      if (assistantContent !== '' || data.cards.length > 0) {
        setMessages((prev) => {
          const nextAssistant: AssistantMessage = {
            id: createMessageId(),
            role: 'assistant',
            content: assistantContent,
            cards: data.cards,
          };

          // Keep a single live confirmation/approval card as source of truth.
          const last = prev[prev.length - 1];
          const replacingConfirmation =
            hasCardType(nextAssistant, 'confirmation_card') &&
            last?.role === 'assistant' &&
            hasCardType(last, 'confirmation_card');
          const replacingApproval =
            hasCardType(nextAssistant, 'approval_card') &&
            last?.role === 'assistant' &&
            hasCardType(last, 'approval_card');

          if (replacingConfirmation || replacingApproval) {
            return [...prev.slice(0, -1), nextAssistant];
          }
          return [...prev, nextAssistant];
        });
      }
      triggerRefreshForActions(data.executedActions);
      showActionToast(data.executedActions, assistantContent);

      // Defensive fallback: if backend misses executedActions but confirms submit text.
      if (
        data.executedActions.length === 0 &&
        /leave applied|submitted|request submitted/i.test(assistantContent)
      ) {
        requestDashboardRefresh([
          'employeeDashboard',
          'employeeLeavesPage',
          'leaveRequestsPage',
          'adminDashboardStats',
          'adminPendingRequests',
        ]);
      }
    } catch (err: unknown) {
      const exactError =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        String((err as { message?: string })?.message ?? '');
      setError(exactError);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages,
    draft,
    isTyping,
    error,
    setDraft,
    sendMessage,
  };
};
