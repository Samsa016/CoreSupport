'use client';

import React, { useCallback } from 'react';
import { Clock, User, AlertTriangle, CheckCircle, Circle } from 'lucide-react';
import { Task } from '@/shared/types';
import { Badge } from '@/shared/ui';
import styles from './TaskCard.module.scss';

interface TaskCardProps {
  task: Task;
  actions?: React.ReactNode;
  onDragStart?: (taskId: number) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

const priorityConfig = {
  high: { label: 'High', variant: 'danger' as const, icon: AlertTriangle, style: styles.priorityHigh },
  medium: { label: 'Medium', variant: 'warning' as const, icon: Circle, style: styles.priorityMedium },
  low: { label: 'Low', variant: 'success' as const, icon: CheckCircle, style: styles.priorityLow },
};

export const TaskCard = ({ task, actions, onDragStart, onDragEnd, isDragging }: TaskCardProps) => {
  const priority = priorityConfig[task.priority];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData('text/plain', String(task.id));
      e.dataTransfer.effectAllowed = 'move';
      onDragStart?.(task.id);
    },
    [task.id, onDragStart],
  );

  const handleDragEnd = useCallback(() => {
    onDragEnd?.();
  }, [onDragEnd]);

  const cardClasses = [
    styles.card,
    priority.style,
    isDragging ? styles.dragging : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
