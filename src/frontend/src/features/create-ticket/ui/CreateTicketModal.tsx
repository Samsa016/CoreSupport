'use client';
import React, { useState } from 'react';
import { Modal, Button } from '@/shared/ui';
import styles from './CreateTicketModal.module.scss';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTicketModal = ({ isOpen, onClose }: CreateTicketModalProps) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API
    console.log('Creating ticket:', { title, priority, description });
    onClose();
    // Reset form
    setTitle('');
    setPriority('medium');
    setDescription('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Ticket">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="title">Title</label>
          <input 
            id="title"
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="What needs to be fixed?"
            required
          />
        </div>
        
        <div className={styles.field}>
          <label htmlFor="priority">Priority</label>
          <select 
            id="priority"
            value={priority} 
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="description">Description</label>
          <textarea 
            id="description"
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={4}
          />
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit">Create Ticket</Button>
        </div>
      </form>
    </Modal>
  );
};
