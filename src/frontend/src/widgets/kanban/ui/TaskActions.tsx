'use client';

import React from 'react';
import { Hand, ArrowDownRight, UserPlus, Edit3, Trash2 } from 'lucide-react';
import { Task } from '@/shared/types';
import { usePermissions } from '@/shared/hooks';
import { Button } from '@/shared/ui';

interface TaskActionsProps {
  task: Task;
  mode: 'all' | 'my';
  onTake: (id: number) => void;
  onRelease: (id: number) => void;
  onAssign: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

/**
 * Renders conditional action buttons for a task card.
 * Extracted from KanbanBoard to follow SRP — presentation-only,
 * delegates all mutations to parent via callbacks.
 */
export const TaskActions = ({
  task,
  mode,
  onTake,
  onRelease,
  onAssign,
  onEdit,
  onDelete,
}: TaskActionsProps) => {
  const { canTake, canRelease, canAssign, canUpdate, canDelete, isTaskFree } = usePermissions();

  return (
    <>
      {mode !== 'my' && isTaskFree(task) && canTake && (
        <Button variant="secondary" size="sm" onClick={() => onTake(task.id)}>
          <Hand size={14} /> Take
        </Button>
      )}

      {canRelease(task) && (
        <Button variant="secondary" size="sm" onClick={() => onRelease(task.id)}>
          <ArrowDownRight size={14} /> Release
        </Button>
      )}

      {canAssign && (
        <Button variant="secondary" size="sm" onClick={() => onAssign(task)}>
          <UserPlus size={14} /> Assign
        </Button>
      )}

      {canUpdate && (
        <Button variant="secondary" size="sm" onClick={() => onEdit(task)}>
          <Edit3 size={14} /> Edit
        </Button>
      )}

      {canDelete && (
        <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
          <Trash2 size={14} />
        </Button>
      )}
    </>
  );
};
