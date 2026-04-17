'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/shared/ui';
import { tasksApi } from '@/shared/api';
import { Task, TaskPriority, TaskStatus } from '@/shared/types';
import { useToast } from '@/shared/providers';
import styles from './EditTaskModal.module.scss';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: Task | null;
}

export const EditTaskModal = ({ isOpen, onClose, onSuccess, task }: EditTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setContent(task.content || '');
      setPriority(task.priority);
      setStatus(task.status);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setLoading(true);
    setError('');

    const updates: Record<string, any> = {};
    if (title !== task.title) updates.title = title;
    if ((content || null) !== task.content) updates.content = content || null;
    if (priority !== task.priority) updates.priority = priority;
    if (status !== task.status) updates.status = status;

    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    try {
      await tasksApi.update(task.id, updates);
      showToast('Task updated successfully', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to update task';
      setError(detail);
      showToast(detail, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            placeholder="Task title..."
            maxLength={255}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textarea}
            placeholder="Task description..."
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

        <div className={styles.field}>
          <label className={styles.label}>Status</label>
          <div className={styles.statusGroup}>
            {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.statusBtn} ${status === s ? styles.activeStatus : ''}`}
                onClick={() => setStatus(s)}
              >
                {s === 'todo' ? 'To Do' : s === 'in_progress' ? 'In Progress' : 'Done'}
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
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
