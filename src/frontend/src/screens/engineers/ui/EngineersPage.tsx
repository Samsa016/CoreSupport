'use client';
import React from 'react';
import { Sidebar } from '@/widgets/sidebar';
import { Header } from '@/widgets/header';
import { EngineerCard } from '@/entities/engineer';
import styles from './EngineersPage.module.scss';

const MOCK_ENGINEERS = [
  { id: 'e1', name: 'Alex R.', level: 'Expert' as const, status: 'busy' as const, activeTickets: 3 },
  { id: 'e2', name: 'Sarah M.', level: 'L2' as const, status: 'available' as const, activeTickets: 1 },
  { id: 'e3', name: 'Mike T.', level: 'L1' as const, status: 'offline' as const, activeTickets: 0 },
  { id: 'e4', name: 'Elena K.', level: 'Expert' as const, status: 'available' as const, activeTickets: 2 },
  { id: 'e5', name: 'David W.', level: 'L2' as const, status: 'busy' as const, activeTickets: 4 },
];

export const EngineersPage = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <main className={styles.content}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Engineering Staff</h1>
            <p className={styles.subtitle}>Manage and monitor your technical team</p>
          </div>
          
          <div className={styles.grid}>
            {MOCK_ENGINEERS.map(eng => (
              <EngineerCard key={eng.id} {...eng} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
