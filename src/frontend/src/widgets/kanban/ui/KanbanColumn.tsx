'use client';

import React, { useState, useCallback } from 'react';
import { Task, TaskStatus } from '@/shared/types';
import { TaskCard } from '@/entities/task';
import styles from './KanbanBoard.module.scss';

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  renderActions: (task: Task) => React.ReactNode;
  draggedTaskId: number | null;
  onDragStart: (taskId: number) => void;
  onDragEnd: () => void;
  onDrop: (taskId: number, newStatus: TaskStatus) => void;
}

/**
 * Single Kanban column — acts as a scrollable feed and a drop-zone.
 * Highlights when a card is being dragged over it.
 */
export const KanbanColumn = ({
  status,
  label,
  tasks,
  renderActions,
  draggedTaskId,
  onDragStart,
  onDragEnd,
  onDrop,
}: KanbanColumnProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set false when we actually leave the column (not child elements)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const taskId = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (!isNaN(taskId)) {
        onDrop(taskId, status);
      }
    },
    [onDrop, status],
  );

  return (
    <div
      className={`${styles.column} ${isDragOver ? styles.dragOver : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.columnHeader}>
        <div className={styles.columnTitle}>
          <span className={`${styles.columnDot} ${styles[status]}`} />
          {label}
        </div>
        <span className={styles.columnCount}>{tasks.length}</span>
      </div>
      <div className={styles.columnContent}>
        {tasks.length === 0 ? (
          <div className={styles.emptyColumn}>
            {isDragOver ? 'Drop here' : 'No tasks'}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              actions={renderActions(task)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggedTaskId === task.id}
            />
          ))
        )}
      </div>
    </div>
  );
};
