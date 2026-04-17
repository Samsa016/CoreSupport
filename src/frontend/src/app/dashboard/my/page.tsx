'use client';

import React from 'react';
import { Header } from '@/widgets/header';
import { KanbanBoard } from '@/widgets/kanban';
import { ChatWidget } from '@/widgets/chat';

export default function MyTasksPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <KanbanBoard mode="my" />
      <ChatWidget />
    </div>
  );
}
