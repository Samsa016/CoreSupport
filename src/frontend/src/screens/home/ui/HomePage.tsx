'use client';
import React, { useState } from 'react';
import { Sidebar } from '@/widgets/sidebar';
import { Header } from '@/widgets/header';
import { TicketCard } from '@/entities/ticket';
import { EngineerCard } from '@/entities/engineer';
import { VmCard } from '@/entities/vm';
import styles from './HomePage.module.scss';
import { Card, Badge, Button } from '@/shared/ui';
import { CreateTicketModal } from '@/features/create-ticket';

const MOCK_TICKETS = [
  { id: 'INC-1042', title: 'Database connection timeout in production', priority: 'critical' as const, timeElapsed: '12m ago' },
  { id: 'INC-1043', title: 'User authentication failing for VPN', priority: 'high' as const, timeElapsed: '45m ago' },
  { id: 'INC-1044', title: 'Request new test environment for QA', priority: 'medium' as const, timeElapsed: '2h ago' },
];

const MOCK_ACTIVE_TICKETS = [
  { id: 'INC-1039', title: 'Payment gateway sync issue', priority: 'high' as const, timeElapsed: '3h ago', assignee: 'Alex R.' },
  { id: 'INC-1040', title: 'Update internal SSL certificates', priority: 'medium' as const, timeElapsed: '4h ago', assignee: 'Sarah M.' },
];

const MOCK_ENGINEERS = [
  { id: 'e1', name: 'Alex R.', level: 'Expert' as const, status: 'busy' as const, activeTickets: 3 },
  { id: 'e2', name: 'Sarah M.', level: 'L2' as const, status: 'available' as const, activeTickets: 1 },
  { id: 'e3', name: 'Mike T.', level: 'L1' as const, status: 'offline' as const, activeTickets: 0 },
];

const MOCK_VMS = [
  { id: 'VM-QA-01', os: 'Ubuntu 22.04 LTS', status: 'running' as const, assignee: 'Alex R.', resourceUsage: 92 },
  { id: 'VM-STG-02', os: 'Windows Server 2022', status: 'running' as const, assignee: 'Sarah M.', resourceUsage: 45 },
  { id: 'VM-TST-03', os: 'CentOS 8', status: 'stopped' as const },
];

export const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <main className={styles.dashboard}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>Welcome back, Manager</h1>
              <p className={styles.subtitle}>Here's the current Service Desk status</p>
            </div>
            <div className={styles.actions}>
              <Button onClick={() => setIsModalOpen(true)}>Create Ticket</Button>
            </div>
          </div>
          
          <div className={styles.kpiGrid}>
            <Card className={styles.kpiCard}>
              <h3 className={styles.kpiTitle}>Active Incidents</h3>
              <div className={styles.kpiValue}>24</div>
              <Badge variant="danger" dot>8 High Priority</Badge>
            </Card>
            <Card className={styles.kpiCard}>
              <h3 className={styles.kpiTitle}>Available Engineers</h3>
              <div className={styles.kpiValue}>12</div>
              <Badge variant="success" dot>5 L2 Experts</Badge>
            </Card>
            <Card className={styles.kpiCard}>
              <h3 className={styles.kpiTitle}>Free Test Stands (VMs)</h3>
              <div className={styles.kpiValue}>7</div>
              <Badge variant="warning" dot>Nearing Limit</Badge>
            </Card>
          </div>

          <div className={styles.boards}>
            <div className={styles.boardColumn}>
              <h2 className={styles.boardTitle}>Incident Queue</h2>
              {MOCK_TICKETS.map(ticket => (
                <TicketCard key={ticket.id} {...ticket} />
              ))}
            </div>
            
            <div className={styles.boardColumn}>
              <h2 className={styles.boardTitle}>In Progress</h2>
              {MOCK_ACTIVE_TICKETS.map(ticket => (
                <TicketCard key={ticket.id} {...ticket} />
              ))}
              
              <h2 className={styles.boardTitle} style={{ marginTop: '1rem' }}>Test Stands (VMs)</h2>
              {MOCK_VMS.map(vm => (
                <VmCard 
                  key={vm.id} 
                  id={vm.id} 
                  os={vm.os} 
                  status={vm.status} 
                  assignedTo={vm.assignee} 
                  resourceUsage={vm.resourceUsage} 
                />
              ))}
            </div>
            
            <div className={styles.boardColumn}>
              <h2 className={styles.boardTitle}>Engineering Staff</h2>
              {MOCK_ENGINEERS.map(eng => (
                <EngineerCard key={eng.id} {...eng} />
              ))}
            </div>
          </div>
        </main>
      </div>
      <CreateTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
