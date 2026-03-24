import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Card.module.scss';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const Card = ({
  children,
  className,
  padding = 'md',
  interactive = false,
}: CardProps) => {
  return (
    <div
      className={classNames(
        styles.card,
        styles[`padding-${padding}`],
        { [styles.interactive]: interactive },
        className
      )}
    >
      {children}
    </div>
  );
};
