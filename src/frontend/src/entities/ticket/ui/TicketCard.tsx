import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Card, Badge } from '@/shared/ui';
import styles from './TicketCard.module.scss';
import classNames from 'classnames';

export interface TicketProps {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeElapsed: string;
  assignee?: string;
}

export const TicketCard = ({ id, title, priority, timeElapsed, assignee }: TicketProps) => {
  const getPriorityBadge = () => {
    switch (priority) {
      case 'critical': return <Badge variant="danger" dot>Critical SLA</Badge>;
      case 'high': return <Badge variant="warning" dot>High Priority</Badge>;
      case 'medium': return <Badge variant="default">Medium</Badge>;
      case 'low': return <Badge variant="success">Low</Badge>;
    }
  };

  return (
    <Card padding="sm" interactive className={classNames(styles.ticketCard, styles[priority])}>
      <div className={styles.header}>
        <span className={styles.id}>#{id}</span>
        {getPriorityBadge()}
      </div>
      <h4 className={styles.title}>{title}</h4>
      
      <div className={styles.footer}>
        <div className={styles.meta}>
          <Clock size={14} />
          <span>{timeElapsed}</span>
        </div>
        
        <div className={styles.assignee}>
          {assignee ? (
            <div className={styles.avatar} title={assignee}>
              {assignee.charAt(0)}
            </div>
          ) : (
            <div className={styles.unassigned}>
              <AlertCircle size={14} />
              <span>Unassigned</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
