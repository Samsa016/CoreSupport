'use client';

import React, { useState } from 'react';
import { Modal, Button } from '@/shared/ui';
import { tasksApi } from '@/shared/api';
import { TaskPriority } from '@/shared/types';
import { useToast } from '@/shared/providers';
import styles from './CreateTaskModal.module.scss';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTaskModal = ({ isOpen, onClose, onSuccess }: CreateTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await tasksApi.create({
        title: title.trim(),
        content: content.trim() || null,
        priority,
      });
      showToast('Task created successfully', 'success');
      setTitle('');
      setContent('');
      setPriority('medium');
      onSuccess();
      onClose();
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to create task';
      setError(detail);
      showToast(detail, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            placeholder="Enter task title..."
            maxLength={255}
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textarea}
            placeholder="Optional task description..."
            rows={4}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Priority</label>
          <div className={styles.priorityGroup}>
            {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                className={`${styles.priorityBtn} ${priority === p ? styles.active : ''} ${styles[p]}`}
                onClick={() => setPriority(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
