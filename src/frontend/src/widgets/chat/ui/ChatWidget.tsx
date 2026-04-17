'use client';

import React from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from '@/shared/hooks';
import styles from './ChatWidget.module.scss';

/**
 * AI Chat Widget — now a pure presentation component.
 * All state and logic lives in useChat hook.
 */
export const ChatWidget = () => {
  const {
    isOpen,
    messages,
    input,
    loading,
    messagesEndRef,
    inputRef,
    open,
    close,
    setInput,
    sendMessage,
    handleKeyDown,
  } = useChat();

  return (
    <>
      <button
        className={`${styles.fab} ${isOpen ? styles.fabHidden : ''}`}
        onClick={open}
        id="chat-fab"
      >
        <MessageSquare size={22} />
        <span className={styles.fabPulse} />
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.botAvatar}>
                <Bot size={18} />
              </div>
              <div>
                <h3 className={styles.headerTitle}>AI Assistant</h3>
                <span className={styles.headerStatus}>Online</span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={close}>
              <X size={18} />
            </button>
          </div>

          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <Bot size={40} className={styles.emptyIcon} />
                <p>Hi! I&apos;m your AI assistant. How can I help you today?</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                <div className={styles.messageAvatar}>
                  {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className={styles.messageContent}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.messageAvatar}><Bot size={14} /></div>
                <div className={styles.typing}><span /><span /><span /></div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.input}
              placeholder="Type a message..."
              disabled={loading}
            />
            <button
              className={styles.sendBtn}
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
