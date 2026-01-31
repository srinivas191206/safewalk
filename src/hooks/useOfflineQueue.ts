import { useState, useEffect, useCallback } from 'react';
import type { EmergencyEvent } from '@/types/emergency';

const QUEUE_KEY = 'guardian_mode_offline_queue';

export const useOfflineQueue = () => {
  const [queue, setQueue] = useState<EmergencyEvent[]>([]);

  // Load queue from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(QUEUE_KEY);
    if (stored) {
      try {
        setQueue(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse offline queue:', e);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }, [queue]);

  const addToQueue = useCallback((event: EmergencyEvent) => {
    setQueue(prev => [...prev, { ...event, offlineQueued: true }]);
  }, []);

  const removeFromQueue = useCallback((eventId: string) => {
    setQueue(prev => prev.filter(e => e.id !== eventId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const getPendingEvents = useCallback(() => {
    return queue.filter(e => e.status === 'pending');
  }, [queue]);

  return {
    queue,
    pendingCount: queue.filter(e => e.status === 'pending').length,
    addToQueue,
    removeFromQueue,
    clearQueue,
    getPendingEvents,
  };
};
