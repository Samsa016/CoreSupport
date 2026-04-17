import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import styles from './FormField.module.scss';

interface BaseProps {
  label: string;
  error?: string;
}

type InputFieldProps = BaseProps & {
  as?: 'input';
} & InputHTMLAttributes<HTMLInputElement>;

type TextareaFieldProps = BaseProps & {
  as: 'textarea';
  rows?: number;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

type FormFieldProps = InputFieldProps | TextareaFieldProps;

/**
 * Reusable form field with label and error display.
 * Eliminates the duplicated field/label/input markup
 * from CreateTaskModal and EditTaskModal.
 */
export const FormField = (props: FormFieldProps) => {
  const { label, error, as = 'input', ...rest } = props;

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {as === 'textarea' ? (
        <textarea
          className={`${styles.input} ${styles.textarea} ${error ? styles.hasError : ''}`}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={`${styles.input} ${error ? styles.hasError : ''}`}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
