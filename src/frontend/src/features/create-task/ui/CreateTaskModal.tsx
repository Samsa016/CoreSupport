'use client';

import React, { useState, useCallback } from 'react';
import { Modal, Button, FormField, SegmentedControl } from '@/shared/ui';
import { tasksApi } from '@/shared/api';
import { TaskPriority } from '@/shared/types';
import { useApiAction } from '@/shared/hooks';
import { PRIORITY_OPTIONS } from '@/shared/lib/constants';
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

  const resetForm = useCallback(() => {
    setTitle('');
    setContent('');
    setPriority('medium');
  }, []);

  const createAction = useCallback(
    () => tasksApi.create({
      title: title.trim(),
      content: content.trim() || null,
      priority,
    }),
    [title, content, priority],
  );

  const { execute, loading, error, clearError } = useApiAction(createAction, {
    successMessage: 'Task created successfully',
    errorFallback: 'Failed to create task',
    onSuccess: () => {
      resetForm();
      onSuccess();
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    clearError();
    await execute();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormField
          label="Title *"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          maxLength={255}
          autoFocus
        />

        <FormField
          label="Description"
          as="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Optional task description..."
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

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading || !title.trim()}>
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
