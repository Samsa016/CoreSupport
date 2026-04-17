import React from 'react';
import { Task, TaskStatus } from '@/shared/types';
import { TaskCard } from '@/entities/task';
import styles from './KanbanBoard.module.scss';

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  renderActions: (task: Task) => React.ReactNode;
}

/**
 * Single Kanban column — extracted from KanbanBoard for SRP.
 * Pure presentational component: receives data, renders UI.
 */
export const KanbanColumn = ({ status, label, tasks, renderActions }: KanbanColumnProps) => (
  <div className={styles.column}>
    <div className={styles.columnHeader}>
      <div className={styles.columnTitle}>
        <span className={`${styles.columnDot} ${styles[status]}`} />
        {label}
      </div>
      <span className={styles.columnCount}>{tasks.length}</span>
    </div>
    <div className={styles.columnContent}>
      {tasks.length === 0 ? (
        <div className={styles.emptyColumn}>No tasks</div>
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} actions={renderActions(task)} />
        ))
      )}
    </div>
  </div>
);
