'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { agentApi } from '@/shared/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Custom hook encapsulating all chat logic.
 * Follows SRP: ChatWidget becomes a pure presentation component.
 */
export function useChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await agentApi.chat({
        message: trimmed,
        context: { url: window.location.pathname },
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: response.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  return {
    // State
    isOpen,
    messages,
    input,
    loading,
    // Refs
    messagesEndRef,
    inputRef,
    // Actions
    open,
    close,
    toggle,
    setInput,
    sendMessage,
    handleKeyDown,
  };
}
