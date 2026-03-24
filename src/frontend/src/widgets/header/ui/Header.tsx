import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Badge } from '@/shared/ui';
import styles from './Header.module.scss';

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search requests, VMs, engineers..." 
          className={styles.searchInput}
        />
      </div>

      <div className={styles.actions}>
        <div className={styles.iconButton}>
          <Bell size={20} />
          <div className={styles.notificationDot} />
        </div>
        
        <div className={styles.profile}>
          <div className={styles.avatar}>
            <User size={18} />
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.name}>Manager</span>
            <Badge variant="success" dot className={styles.status}>Online</Badge>
          </div>
        </div>
      </div>
    </header>
  );
};
