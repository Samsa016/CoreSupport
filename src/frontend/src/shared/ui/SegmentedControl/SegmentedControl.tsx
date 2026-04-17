import React from 'react';
import styles from './SegmentedControl.module.scss';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Visual variant for active state coloring */
  variant?: 'priority' | 'status';
}

/**
 * Reusable segmented button group.
 * Replaces the duplicated priority/status selector markup
 * in both CreateTaskModal and EditTaskModal.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'status',
}: SegmentedControlProps<T>) {
  return (
    <div className={styles.group}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`
            ${styles.option}
            ${value === opt.value ? styles.active : ''}
            ${variant === 'priority' ? styles[`priority-${opt.value}`] || '' : ''}
            ${variant === 'status' && value === opt.value ? styles.statusActive : ''}
          `}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
