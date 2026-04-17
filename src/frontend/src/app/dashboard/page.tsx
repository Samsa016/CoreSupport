'use client';

import React from 'react';
import { Header } from '@/widgets/header';
import { KanbanBoard } from '@/widgets/kanban';
import { ChatWidget } from '@/widgets/chat';

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <KanbanBoard mode="all" />
      <ChatWidget />
    </div>
  );
}
