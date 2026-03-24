import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={classNames(
        styles.button,
        styles[variant],
        styles[size],
        { [styles.fullWidth]: fullWidth },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
