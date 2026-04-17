'use client';

import React from 'react';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/shared/ui';
import { useAuthStore } from '@/shared/store';
import styles from './Header.module.scss';

const roleBadgeVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  guest: 'default',
  worker: 'success',
  lead: 'warning',
  manager: 'danger',
};

export const Header = () => {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logoIcon}>
          <Shield size={20} />
        </div>
        <span className={styles.logo}>CoreSupport</span>
      </div>

      <div className={styles.actions}>
        {user && (
          <>
            <div className={styles.profile}>
              <div className={styles.avatar}>
                <UserIcon size={16} />
              </div>
              <div className={styles.profileInfo}>
                <span className={styles.email}>{user.email}</span>
                <Badge variant={roleBadgeVariants[user.role] || 'default'} dot className={styles.roleBadge}>
                  {user.role}
                </Badge>
              </div>
            </div>

            <button className={styles.logoutBtn} onClick={handleLogout} id="logout-btn">
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
