'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/shared/ui';
import { tasksApi, usersApi } from '@/shared/api';
import { User, Task } from '@/shared/types';
import { useToast } from '@/shared/providers';
import { extractApiError } from '@/shared/lib/api-error';
import { ROLE_COLORS } from '@/shared/lib/constants';
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
    if (isOpen) loadUsers();
  }, [isOpen]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data.filter((u) => u.is_active));
    } catch (err) {
      showToast(extractApiError(err, 'Failed to load users'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = useCallback(async (userId: number | null) => {
    if (!task) return;
    setAssigning(true);
    try {
      await tasksApi.assign(task.id, { assignee_id: userId });
      showToast(userId ? 'Task assigned successfully' : 'Task unassigned', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(extractApiError(err, 'Failed to assign task'), 'error');
    } finally {
      setAssigning(false);
    }
  }, [task, showToast, onSuccess, onClose]);

  const isCurrentAssignee = (userId: number) => task?.assignee_id === userId;

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
                className={`${styles.userItem} ${isCurrentAssignee(user.id) ? styles.current : ''}`}
                onClick={() => handleAssign(user.id)}
                disabled={assigning || isCurrentAssignee(user.id)}
              >
                <div className={styles.userAvatar}>
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userEmail}>{user.email}</span>
                  <span
                    className={styles.userRole}
                    style={{ color: ROLE_COLORS[user.role] }}
                  >
                    {user.role}
                  </span>
                </div>
                {isCurrentAssignee(user.id) && (
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
