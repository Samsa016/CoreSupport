'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, FormField, SegmentedControl } from '@/shared/ui';
import { tasksApi } from '@/shared/api';
import { Task, TaskPriority, TaskStatus, TaskUpdateRequest } from '@/shared/types';
import { useApiAction } from '@/shared/hooks';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/shared/lib/constants';
import styles from './EditTaskModal.module.scss';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: Task | null;
}

/** Computes only the fields that actually changed (partial update). */
function computeChanges(
  task: Task,
  title: string,
  content: string,
  priority: TaskPriority,
  status: TaskStatus,
): TaskUpdateRequest | null {
  const updates: TaskUpdateRequest = {};

  if (title !== task.title) updates.title = title;
  if ((content || null) !== task.content) updates.content = content || null;
  if (priority !== task.priority) updates.priority = priority;
  if (status !== task.status) updates.status = status;

  return Object.keys(updates).length > 0 ? updates : null;
}

export const EditTaskModal = ({ isOpen, onClose, onSuccess, task }: EditTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setContent(task.content || '');
      setPriority(task.priority);
      setStatus(task.status);
    }
  }, [task]);

  const updateAction = useCallback(
    () => {
      if (!task) return Promise.reject(new Error('No task'));
      const changes = computeChanges(task, title, content, priority, status);
      if (!changes) {
        onClose();
        return Promise.resolve(task);
      }
      return tasksApi.update(task.id, changes);
    },
    [task, title, content, priority, status, onClose],
  );

  const { execute, loading, error, clearError } = useApiAction(updateAction, {
    successMessage: 'Task updated successfully',
    errorFallback: 'Failed to update task',
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await execute();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormField
          label="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title..."
          maxLength={255}
        />

        <FormField
          label="Description"
          as="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Task description..."
          rows={4}
        />

        <div className={styles.field}>
          <label className={styles.label}>Priority</label>
          <SegmentedControl
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={setPriority}
            variant="priority"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Status</label>
          <SegmentedControl
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
            variant="status"
          />
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
