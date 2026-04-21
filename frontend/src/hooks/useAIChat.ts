'use client';

import { useState, useCallback, useRef } from 'react';
import {
  sendMessage,
  confirmAction,
  cancelAction,
  type ChatMessage,
  type ChatResponse,
} from '@/services/aiService';

const generateId = () => Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

const createUserMessage = (content: string): ChatMessage => ({
  id: generateId(),
  role: 'user',
  content,
  timestamp: new Date(),
  phase: 'IDLE',
});

const createAssistantMessage = (content: string, data?: Partial<ChatMessage>): ChatMessage => ({
  id: generateId(),
  role: 'assistant',
  content,
  timestamp: new Date(),
  ...data,
});

const createLoadingMessage = (): ChatMessage => ({
  id: generateId(),
  role: 'assistant',
  content: '',
  timestamp: new Date(),
  isLoading: true,
});

export function useAIChat(userRole?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<string>('IDLE');
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);
  const sessionId = useRef<string>(generateId());
  const loadingMsgId = useRef<string | null>(null);

  /** Remove loading bubble */
  const removeLoading = useCallback(() => {
    if (loadingMsgId.current) {
      setMessages((prev) => prev.filter((m) => m.id !== loadingMsgId.current));
      loadingMsgId.current = null;
    }
  }, []);

  /** Apply API response to state */
  const applyResponse = useCallback((response: ChatResponse) => {
    removeLoading();
    const msg = createAssistantMessage(response.response, {
      phase: response.phase,
      intent: response.intent,
      collectedFields: response.collectedFields,
      missingFields: response.missingFields,
      actionResult: response.actionResult,
      dataType: response.dataType,
      confirmationMessage: response.confirmationMessage,
      suggestions: response.suggestions,
    });
    setMessages((prev) => [...prev, msg]);
    setPhase(response.phase || 'IDLE');
    setCurrentIntent(response.intent || null);
  }, [removeLoading]);

  /** Send a text message */
  const send = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMsg = createUserMessage(message);
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const loadingMsg = createLoadingMessage();
    loadingMsgId.current = loadingMsg.id;
    setMessages((prev) => [...prev, loadingMsg]);

    try {
      const isOtpPhase = phase === 'AWAITING_OTP';
      const response = await sendMessage(message, sessionId.current, isOtpPhase ? message : undefined);
      applyResponse(response);
    } catch {
      removeLoading();
      const errMsg = createAssistantMessage(
        '⚠️ Connection error. Please check your network and try again.',
        { isError: true, phase: 'ERROR' },
      );
      setMessages((prev) => [...prev, errMsg]);
      setPhase('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, applyResponse, removeLoading]);

  /** Confirm the pending action */
  const confirm = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    const loadingMsg = createLoadingMessage();
    loadingMsgId.current = loadingMsg.id;
    setMessages((prev) => [...prev, loadingMsg]);

    try {
      const response = await confirmAction(sessionId.current);
      applyResponse(response);
    } catch {
      removeLoading();
      setMessages((prev) => [
        ...prev,
        createAssistantMessage('⚠️ Failed to execute action. Please try again.', {
          isError: true,
          phase: 'ERROR',
        }),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, applyResponse, removeLoading]);

  /** Cancel the current action */
  const cancel = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await cancelAction(sessionId.current);
      applyResponse(response);
    } catch {
      setMessages((prev) => [
        ...prev,
        createAssistantMessage('❌ Action cancelled.', { phase: 'IDLE' }),
      ]);
      setPhase('IDLE');
      setCurrentIntent(null);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, applyResponse]);

  /** Clear chat and start fresh */
  const clearChat = useCallback(() => {
    setMessages([]);
    setPhase('IDLE');
    setCurrentIntent(null);
    sessionId.current = generateId();
  }, []);

  /** Send a suggestion chip as a message */
  const sendSuggestion = useCallback(
    (suggestion: string) => {
      send(suggestion);
    },
    [send],
  );

  return {
    messages,
    isLoading,
    phase,
    currentIntent,
    sessionId: sessionId.current,
    send,
    confirm,
    cancel,
    clearChat,
    sendSuggestion,
  };
}
