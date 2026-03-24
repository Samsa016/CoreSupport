import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Badge.module.scss';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  dot?: boolean;
  className?: string;
}

export const Badge = ({
  children,
  variant = 'default',
  dot = false,
  className,
}: BadgeProps) => {
  return (
    <div className={classNames(styles.badge, styles[variant], className)}>
      {dot && <span className={styles.dot} />}
      {children}
    </div>
  );
};
