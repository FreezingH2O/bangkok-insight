import { useState } from 'react';
import { PriorityQueueTable } from '@/components/queue/PriorityQueueTable';
import { TicketDetailDrawer } from '@/components/queue/TicketDetailDrawer';
import { ProcessedTicket } from '@/types/ticket';

export default function QueuePage() {
  const [selectedTicket, setSelectedTicket] = useState<ProcessedTicket | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Priority Queue</h1>
        <p className="text-muted-foreground">AI-ranked tickets sorted by priority score</p>
      </div>
      <PriorityQueueTable onTicketSelect={setSelectedTicket} />
      <TicketDetailDrawer ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
}
