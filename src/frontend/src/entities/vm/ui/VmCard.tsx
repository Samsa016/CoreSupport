import React from 'react';
import { Card, Badge } from '@/shared/ui';
import { Server, Activity, User } from 'lucide-react';
import styles from './VmCard.module.scss';
import classNames from 'classnames';

export interface VmProps {
  id: string;
  os: string;
  status: 'running' | 'stopped' | 'provisioning';
  assignedTo?: string;
  resourceUsage?: number; // percentage 0-100
}

export const VmCard = ({ id, os, status, assignedTo, resourceUsage = 0 }: VmProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'running': return <Badge variant="success" dot>Running</Badge>;
      case 'provisioning': return <Badge variant="warning" dot>Provisioning</Badge>;
      case 'stopped': return <Badge variant="default">Stopped</Badge>;
    }
  };

  return (
    <Card padding="sm" interactive className={styles.vmCard}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <Server size={16} className={styles.icon} />
          <span className={styles.id}>{id}</span>
        </div>
        {getStatusBadge()}
      </div>
      
      <div className={styles.osName}>{os}</div>

      {status === 'running' && (
        <div className={styles.metrics}>
          <div className={styles.metricRow}>
            <Activity size={14} />
            <div className={styles.progressBar}>
              <div 
                className={classNames(styles.progressFill, resourceUsage > 80 ? styles.dangerBg : styles.successBg)} 
                style={{ width: `${resourceUsage}%` }} 
              />
            </div>
            <span className={styles.usageText}>{resourceUsage}%</span>
          </div>
        </div>
      )}

      <div className={styles.footer}>
        {assignedTo ? (
          <div className={styles.assignment}>
            <User size={12} />
            <span>Assigned: {assignedTo}</span>
          </div>
        ) : (
          <span className={styles.unassigned}>Unassigned Pool</span>
        )}
      </div>
    </Card>
  );
};
