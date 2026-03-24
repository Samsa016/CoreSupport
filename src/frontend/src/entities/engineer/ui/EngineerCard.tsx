import React from 'react';
import { Card, Badge } from '@/shared/ui';
import styles from './EngineerCard.module.scss';
import classNames from 'classnames';

export interface EngineerProps {
  id: string;
  name: string;
  level: 'L1' | 'L2' | 'Expert';
  status: 'available' | 'busy' | 'offline';
  activeTickets: number;
}

export const EngineerCard = ({ name, level, status, activeTickets }: EngineerProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'available': return styles.statusAvailable;
      case 'busy': return styles.statusBusy;
      case 'offline': return styles.statusOffline;
    }
  };

  return (
    <Card padding="sm" interactive className={styles.engineerCard}>
      <div className={styles.profile}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>
            {name.charAt(0)}
          </div>
          <div className={classNames(styles.statusIndicator, getStatusColor())} />
        </div>
        
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{name}</span>
            <Badge variant={level === 'Expert' ? 'warning' : 'default'} className={styles.levelBadge}>
              {level}
            </Badge>
          </div>
          <div className={styles.stats}>
            <span className={styles.label}>Active Workload:</span>
            <span className={styles.value}>{activeTickets} tickets</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
