'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/shared/ui';
import { tasksApi, usersApi } from '@/shared/api';
import { User, Task } from '@/shared/types';
import { useToast } from '@/shared/providers';
import { UserMinus, Check } from 'lucide-react';
import styles from './AssignTaskModal.module.scss';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: Task | null;
}

export const AssignTaskModal = ({ isOpen, onClose, onSuccess, task }: AssignTaskModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data.filter((u) => u.is_active));
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (userId: number | null) => {
    if (!task) return;
    setAssigning(true);
    try {
      await tasksApi.assign(task.id, { assignee_id: userId });
      showToast(userId ? 'Task assigned successfully' : 'Task unassigned', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to assign task';
      showToast(detail, 'error');
    } finally {
      setAssigning(false);
    }
  };

  const roleColors: Record<string, string> = {
    worker: 'var(--accent-primary)',
    lead: 'var(--accent-warning)',
    manager: 'var(--accent-secondary)',
    guest: 'var(--text-tertiary)',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Task">
      <div className={styles.container}>
        {task?.assignee_id && (
          <button
            className={styles.unassignBtn}
            onClick={() => handleAssign(null)}
            disabled={assigning}
          >
            <UserMinus size={16} />
            Unassign current worker
          </button>
        )}

        <div className={styles.userList}>
          {loading ? (
            <div className={styles.loading}>Loading users...</div>
          ) : users.length === 0 ? (
            <div className={styles.empty}>No active users found</div>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                className={`${styles.userItem} ${task?.assignee_id === user.id ? styles.current : ''}`}
                onClick={() => handleAssign(user.id)}
                disabled={assigning || task?.assignee_id === user.id}
              >
                <div className={styles.userAvatar}>
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userEmail}>{user.email}</span>
                  <span
                    className={styles.userRole}
                    style={{ color: roleColors[user.role] || 'var(--text-tertiary)' }}
                  >
                    {user.role}
                  </span>
                </div>
                {task?.assignee_id === user.id && (
                  <Check size={16} className={styles.checkIcon} />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
