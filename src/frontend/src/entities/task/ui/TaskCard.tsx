'use client';

import React from 'react';
import { Clock, User, AlertTriangle, CheckCircle, Circle } from 'lucide-react';
import { Task, User as UserType } from '@/shared/types';
import { Badge } from '@/shared/ui';
import styles from './TaskCard.module.scss';

interface TaskCardProps {
  task: Task;
  actions?: React.ReactNode;
}

const priorityConfig = {
  high: { label: 'High', variant: 'danger' as const, icon: AlertTriangle },
  medium: { label: 'Medium', variant: 'warning' as const, icon: Circle },
  low: { label: 'Low', variant: 'success' as const, icon: CheckCircle },
};

const statusLabels: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export const TaskCard = ({ task, actions }: TaskCardProps) => {
  const priority = priorityConfig[task.priority];
  const PriorityIcon = priority.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Badge variant={priority.variant} dot>
          {priority.label}
        </Badge>
        <span className={styles.id}>#{task.id}</span>
      </div>

      <h3 className={styles.title}>{task.title}</h3>

      {task.content && (
        <p className={styles.content}>{task.content}</p>
      )}

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <Clock size={14} />
          <span>{formatDate(task.updated_at)}</span>
        </div>
        {task.assignee_id ? (
          <div className={styles.metaItem}>
            <User size={14} />
            <span>Assigned #{task.assignee_id}</span>
          </div>
        ) : (
          <div className={`${styles.metaItem} ${styles.free}`}>
            <span className={styles.freeDot} />
            <span>Free</span>
          </div>
        )}
      </div>

      {actions && (
        <div className={styles.actions}>
          {actions}
        </div>
      )}
    </div>
  );
};
