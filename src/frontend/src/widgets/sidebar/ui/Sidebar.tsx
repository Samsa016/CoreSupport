'use client';
import React from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Server, 
  CalendarDays,
  Settings
} from 'lucide-react';
import styles from './Sidebar.module.scss';

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/engineers', icon: Users, label: 'Engineers' },
    { href: '/schedule', icon: CalendarDays, label: 'Schedule' },
    { href: '/vm-allocation', icon: Server, label: 'VM Allocation' },
  ];

  return (
    <aside className={classNames(styles.sidebar, 'glass-panel')}>
      <div className={styles.brand}>
        <div className={styles.brandLogo}>SD</div>
        <div className={styles.brandText}>HelpDesk<br/><span>Planner</span></div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className={classNames(styles.navItem, { [styles.active]: pathname === item.href })}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <Link href="/settings" className={classNames(styles.navItem, { [styles.active]: pathname === '/settings' })}>
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};
